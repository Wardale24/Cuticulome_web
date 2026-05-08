import fs from "fs";
import os from "os";
import path from "path";
import Database from "better-sqlite3";
import { execFile } from "child_process";
import { promisify } from "util";
import {
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "fs/promises";

const execFileAsync = promisify(execFile);

type MiniBlastProteinRow = {
  proteinId: number;
  proteinName: string | null;
  standardizedName: string | null;
  accession: string | null;
  protFasta: string | null;
  proteinSequence: string | null;
  genus: string | null;
  species: string | null;
  speciesCode: string | null;
  isFunctionDefined: number;
};

export type MiniBlastHit = {
  proteinId: number;
  status: "Function-defined" | "Non-function-defined";
  protein: string;
  accession: string;
  species: string;
  speciesCode: string;
  percentIdentity: number;
  queryCoverage: number;
  alignmentLength: number;
  evalue: number;
  bitScore: number;
};

export type MiniBlastResult = {
  queryLength: number;
  databaseProteinCount: number;
  hitCount: number;
  hits: MiniBlastHit[];
};

type MiniBlastProtein = {
  proteinId: number;
  proteinName: string;
  standardizedName: string;
  accession: string;
  species: string;
  speciesCode: string;
  isFunctionDefined: boolean;
  proteinSequence: string;
};

let cachedDatabase: Database.Database | null = null;

function getDatabase() {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  const databasePath = path.join(process.cwd(), "data", "cuticulome.db");

  if (!fs.existsSync(databasePath)) {
    throw new Error(
      `Could not find cuticulome.db at ${databasePath}. Copy it into data/cuticulome.db first.`
    );
  }

  cachedDatabase = new Database(databasePath, {
    readonly: true,
    fileMustExist: true,
  });

  return cachedDatabase;
}

export function cleanProteinSequence(text: string) {
  if (!text) {
    return "";
  }

  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !line.startsWith(">"));

  return lines.join("").replace(/\s+/g, "").toUpperCase().trim();
}

export function isValidProteinSequence(sequence: string) {
  if (!sequence) {
    return false;
  }

  return /^[ACDEFGHIKLMNPQRSTVWYBXZJUO*\-]+$/.test(sequence);
}

function wrapSequence(sequence: string, width = 80) {
  const cleanSequence = sequence.replace(/\s+/g, "");
  const wrappedLines = [];

  for (let index = 0; index < cleanSequence.length; index += width) {
    wrappedLines.push(cleanSequence.slice(index, index + width));
  }

  return wrappedLines.join("\n");
}

function extractSequenceFromFasta(fastaText: string | null) {
  if (!fastaText) {
    return "";
  }

  return cleanProteinSequence(fastaText);
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

async function findExecutable(name: string) {
  const environmentOverride =
    name === "makeblastdb"
      ? process.env.MINIBLAST_MAKEBLASTDB_PATH
      : process.env.MINIBLAST_BLASTP_PATH;

  if (environmentOverride && environmentOverride.trim().length > 0) {
    return environmentOverride.trim();
  }

  try {
    const { stdout } = await execFileAsync("which", [name], {
      maxBuffer: 1024 * 1024,
    });

    const executablePath = stdout.trim().split(/\r?\n/)[0];

    return executablePath || null;
  } catch {
    return null;
  }
}

function loadMiniBlastProteins() {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      SELECT
        p.id AS proteinId,
        p.protein_name AS proteinName,
        p.standardized_name AS standardizedName,
        p.protein_accession AS accession,
        p.prot_fasta AS protFasta,
        p.protein_sequence AS proteinSequence,
        s.genus AS genus,
        s.species AS species,
        s.species_code AS speciesCode,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM entries e
            WHERE e.protein_id = p.id
          ) THEN 1
          ELSE 0
        END AS isFunctionDefined
      FROM proteins p
      LEFT JOIN species s ON p.species_id = s.id
      WHERE (
        p.prot_fasta IS NOT NULL
        AND TRIM(p.prot_fasta) != ''
      )
      OR (
        p.protein_sequence IS NOT NULL
        AND TRIM(p.protein_sequence) != ''
      )
      `
    )
    .all() as MiniBlastProteinRow[];

  const seenProteinIds = new Set<number>();

  const proteins = rows
    .map((row) => {
      const proteinSequence =
        extractSequenceFromFasta(row.proteinSequence) ||
        extractSequenceFromFasta(row.protFasta);

      const genus = normalizeText(row.genus);
      const speciesEpithet = normalizeText(row.species);
      const species = [genus, speciesEpithet].filter(Boolean).join(" ");

      return {
        proteinId: row.proteinId,
        proteinName: normalizeText(row.proteinName),
        standardizedName: normalizeText(row.standardizedName),
        accession: normalizeText(row.accession),
        species: species || "Unknown species",
        speciesCode: normalizeText(row.speciesCode) || "Unknown",
        isFunctionDefined: Number(row.isFunctionDefined) === 1,
        proteinSequence,
      };
    })
    .filter((protein) => {
      if (seenProteinIds.has(protein.proteinId)) {
        return false;
      }

      seenProteinIds.add(protein.proteinId);

      return (
        protein.proteinSequence.length > 0 &&
        isValidProteinSequence(protein.proteinSequence)
      );
    });

  return proteins;
}

async function buildBlastDatabase(
  proteins: MiniBlastProtein[],
  temporaryDirectory: string
) {
  const makeblastdb = await findExecutable("makeblastdb");

  if (!makeblastdb) {
    throw new Error(
      "makeblastdb was not found in PATH. Install NCBI BLAST+ with: sudo apt install -y ncbi-blast+"
    );
  }

  const fastaPath = path.join(temporaryDirectory, "all_proteins.fasta");
  const databasePrefix = path.join(temporaryDirectory, "all_proteins_db");

  const fastaContent = proteins
    .map((protein) => {
      return `>${protein.proteinId}\n${wrapSequence(
        protein.proteinSequence
      )}`;
    })
    .join("\n");

  await writeFile(fastaPath, `${fastaContent}\n`, "utf-8");

  try {
    await execFileAsync(
      makeblastdb,
      [
        "-in",
        fastaPath,
        "-dbtype",
        "prot",
        "-out",
        databasePrefix,
      ],
      {
        maxBuffer: 50 * 1024 * 1024,
      }
    );
  } catch (error) {
    const blastError = error as {
      stderr?: string;
      stdout?: string;
      message?: string;
    };

    throw new Error(
      [
        "makeblastdb failed.",
        blastError.stderr ? `STDERR:\n${blastError.stderr}` : "",
        blastError.stdout ? `STDOUT:\n${blastError.stdout}` : "",
        blastError.message ? `Message:\n${blastError.message}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  return databasePrefix;
}

async function runBlastp(
  querySequence: string,
  databasePrefix: string,
  temporaryDirectory: string
) {
  const blastp = await findExecutable("blastp");

  if (!blastp) {
    throw new Error(
      "blastp was not found in PATH. Install NCBI BLAST+ with: sudo apt install -y ncbi-blast+"
    );
  }

  const queryFastaPath = path.join(temporaryDirectory, "query.fasta");
  const outputPath = path.join(temporaryDirectory, "blast_results.tsv");

  await writeFile(
    queryFastaPath,
    `>query\n${wrapSequence(querySequence)}\n`,
    "utf-8"
  );

  try {
    await execFileAsync(
      blastp,
      [
        "-query",
        queryFastaPath,
        "-db",
        databasePrefix,
        "-out",
        outputPath,
        "-outfmt",
        "6 sseqid pident length evalue bitscore qcovs",
        "-max_target_seqs",
        "200",
      ],
      {
        maxBuffer: 50 * 1024 * 1024,
      }
    );
  } catch (error) {
    const blastError = error as {
      stderr?: string;
      stdout?: string;
      message?: string;
    };

    throw new Error(
      [
        "blastp failed.",
        blastError.stderr ? `STDERR:\n${blastError.stderr}` : "",
        blastError.stdout ? `STDOUT:\n${blastError.stdout}` : "",
        blastError.message ? `Message:\n${blastError.message}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  try {
    const outputStats = await stat(outputPath);

    if (outputStats.size === 0) {
      return [];
    }
  } catch {
    return [];
  }

  const outputText = await readFile(outputPath, "utf-8");

  return outputText
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [
        subjectId,
        percentIdentity,
        alignmentLength,
        evalue,
        bitScore,
        queryCoverage,
      ] = line.split("\t");

      return {
        proteinId: Number(subjectId),
        percentIdentity: Number(percentIdentity),
        alignmentLength: Number(alignmentLength),
        evalue: Number(evalue),
        bitScore: Number(bitScore),
        queryCoverage: Number(queryCoverage),
      };
    })
    .filter((hit) => Number.isInteger(hit.proteinId));
}

export async function runMiniBlast(queryText: string): Promise<MiniBlastResult> {
  const querySequence = cleanProteinSequence(queryText);

  if (!querySequence) {
    throw new Error("Please paste a protein sequence.");
  }

  if (!isValidProteinSequence(querySequence)) {
    throw new Error("That does not look like a valid amino acid sequence.");
  }

  const proteins = loadMiniBlastProteins();

  if (proteins.length === 0) {
    throw new Error("No protein FASTA entries were found in the database.");
  }

  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "cuticulome-miniblast-")
  );

  try {
    const databasePrefix = await buildBlastDatabase(proteins, temporaryDirectory);
    const blastHits = await runBlastp(
      querySequence,
      databasePrefix,
      temporaryDirectory
    );

    const proteinsById = new Map(
      proteins.map((protein) => [protein.proteinId, protein])
    );

    const hits = blastHits
      .map((hit) => {
        const protein = proteinsById.get(hit.proteinId);

        if (!protein) {
          return null;
        }

        return {
          proteinId: protein.proteinId,
          status: protein.isFunctionDefined
            ? "Function-defined"
            : "Non-function-defined",
          protein:
            protein.standardizedName ||
            protein.proteinName ||
            `Protein ${protein.proteinId}`,
          accession: protein.accession || "No accession available",
          species: protein.species,
          speciesCode: protein.speciesCode,
          percentIdentity: hit.percentIdentity,
          queryCoverage: hit.queryCoverage,
          alignmentLength: hit.alignmentLength,
          evalue: hit.evalue,
          bitScore: hit.bitScore,
        };
      })
      .filter((hit): hit is MiniBlastHit => hit !== null)
      .sort((a, b) => {
        if (b.bitScore !== a.bitScore) {
          return b.bitScore - a.bitScore;
        }

        if (b.percentIdentity !== a.percentIdentity) {
          return b.percentIdentity - a.percentIdentity;
        }

        if (b.queryCoverage !== a.queryCoverage) {
          return b.queryCoverage - a.queryCoverage;
        }

        return a.evalue - b.evalue;
      });

    return {
      queryLength: querySequence.length,
      databaseProteinCount: proteins.length,
      hitCount: hits.length,
      hits,
    };
  } finally {
    await rm(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
}
