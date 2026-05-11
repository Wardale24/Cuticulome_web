import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type DownloadFilters = {
  query: string;
  genus: string;
  speciesId: string;
  family: string;
  functionStatus: "all" | "defined" | "lacking";
  functionQuery: string;
};

export type DownloadFilterSpeciesOption = {
  id: number;
  genus: string;
  species: string;
  speciesCode: string;
};

export type DownloadFilterOptions = {
  genera: string[];
  species: DownloadFilterSpeciesOption[];
  families: string[];
};

export type DownloadRecord = {
  id: number;
  standardizedName: string;
  proteinName: string;
  accession: string;
  genus: string;
  species: string;
  speciesCode: string;
  family: string;
  sequence: string;
  length: number;
  functionDefined: boolean;
  expressionDetails: string;
  functionDetails: string;
  molecularFunction: string;
  biologicalProcess: string;
};

export type FilteredDownloadSummary = {
  matchingRecords: number;
  speciesCount: number;
  familyCount: number;
  functionDefinedCount: number;
};

type SQLiteDownloadRow = {
  id: number;
  standardizedName: string | null;
  proteinName: string | null;
  accession: string | null;
  protFasta: string | null;
  proteinSequence: string | null;
  genus: string | null;
  speciesEpithet: string | null;
  speciesCode: string | null;
  familyName: string | null;
  functionalEntryCount: number;
  expressionDetails: string | null;
  functionDetails: string | null;
  molecularFunction: string | null;
  biologicalProcess: string | null;
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

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function makeSpeciesName(genus: string | null, speciesEpithet: string | null) {
  return [normalizeText(genus), normalizeText(speciesEpithet)]
    .filter(Boolean)
    .join(" ");
}

function cleanProteinSequence(text: string | null | undefined) {
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

function extractSequence(
  proteinSequence: string | null,
  protFasta: string | null
) {
  const directSequence = cleanProteinSequence(proteinSequence);

  if (directSequence.length > 0) {
    return directSequence;
  }

  return cleanProteinSequence(protFasta);
}

function uniqueJoinedText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return Array.from(new Set(parts)).join("; ");
}

function wrapSequence(sequence: string, width = 80) {
  const wrappedLines = [];

  for (let index = 0; index < sequence.length; index += width) {
    wrappedLines.push(sequence.slice(index, index + width));
  }

  return wrappedLines.join("\n");
}

function escapeCsvCell(value: string | number | boolean) {
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');

  return `"${escaped}"`;
}

function makeSqlFilters(filters: DownloadFilters) {
  const whereClauses: string[] = [];
  const havingClauses: string[] = [];
  const parameters: Record<string, string | number> = {};

  const query = filters.query.trim();
  const genus = filters.genus.trim();
  const speciesId = filters.speciesId.trim();
  const family = filters.family.trim();
  const functionQuery = filters.functionQuery.trim();

  if (query.length > 0) {
    parameters.query = `%${query.toLowerCase()}%`;
    whereClauses.push(`
      (
        LOWER(COALESCE(p.standardized_name, '')) LIKE @query
        OR LOWER(COALESCE(p.protein_name, '')) LIKE @query
        OR LOWER(COALESCE(p.protein_accession, '')) LIKE @query
        OR LOWER(COALESCE(s.genus, '')) LIKE @query
        OR LOWER(COALESCE(s.species, '')) LIKE @query
        OR LOWER(COALESCE(s.species_code, '')) LIKE @query
        OR LOWER(COALESCE(pf.name, '')) LIKE @query
      )
    `);
  }

  if (genus.length > 0) {
    parameters.genus = genus;
    whereClauses.push("s.genus = @genus");
  }

  if (speciesId.length > 0) {
    const parsedSpeciesId = Number(speciesId);

    if (Number.isFinite(parsedSpeciesId)) {
      parameters.speciesId = parsedSpeciesId;
      whereClauses.push("s.id = @speciesId");
    }
  }

  if (family.length > 0) {
    parameters.family = family;
    whereClauses.push("COALESCE(pf.name, 'Unassigned') = @family");
  }

  if (functionQuery.length > 0) {
    parameters.functionQuery = `%${functionQuery.toLowerCase()}%`;
    whereClauses.push(`
      (
        LOWER(COALESCE(e.expression_tissue, '')) LIKE @functionQuery
        OR LOWER(COALESCE(e.expression_timing, '')) LIKE @functionQuery
        OR LOWER(COALESCE(e.expression_details, '')) LIKE @functionQuery
        OR LOWER(COALESCE(e.expression_stress_variation, '')) LIKE @functionQuery
        OR LOWER(COALESCE(e.molecular_function, '')) LIKE @functionQuery
        OR LOWER(COALESCE(e.biological_process, '')) LIKE @functionQuery
        OR LOWER(COALESCE(e.function_details, '')) LIKE @functionQuery
        OR LOWER(COALESCE(e.molecular_mechanisms, '')) LIKE @functionQuery
        OR LOWER(COALESCE(e.notes, '')) LIKE @functionQuery
      )
    `);
  }

  if (filters.functionStatus === "defined") {
    havingClauses.push("COUNT(e.id) > 0");
  }

  if (filters.functionStatus === "lacking") {
    havingClauses.push("COUNT(e.id) = 0");
  }

  return {
    whereSql:
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "",
    havingSql:
      havingClauses.length > 0
        ? `HAVING ${havingClauses.join(" AND ")}`
        : "",
    parameters,
  };
}

export function getDefaultDownloadFilters(): DownloadFilters {
  return {
    query: "",
    genus: "",
    speciesId: "",
    family: "",
    functionStatus: "all",
    functionQuery: "",
  };
}

export function getDownloadFilterOptions(): DownloadFilterOptions {
  const database = getDatabase();

  const genera = database
    .prepare(
      `
      SELECT DISTINCT genus
      FROM species
      WHERE genus IS NOT NULL
        AND TRIM(genus) != ''
      ORDER BY genus ASC
      `
    )
    .all()
    .map((row) => normalizeText((row as { genus: string | null }).genus))
    .filter(Boolean);

  const species = database
    .prepare(
      `
      SELECT
        id,
        genus,
        species,
        species_code AS speciesCode
      FROM species
      ORDER BY genus ASC, species ASC
      `
    )
    .all()
    .map((row) => {
      const typedRow = row as {
        id: number;
        genus: string | null;
        species: string | null;
        speciesCode: string | null;
      };

      const genus = normalizeText(typedRow.genus);

      return {
        id: typedRow.id,
        genus,
        species:
          makeSpeciesName(typedRow.genus, typedRow.species) ||
          "Unknown species",
        speciesCode: normalizeText(typedRow.speciesCode) || "Unknown",
      };
    });

  const families = database
    .prepare(
      `
      SELECT DISTINCT COALESCE(pf.name, 'Unassigned') AS family
      FROM proteins p
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      ORDER BY family ASC
      `
    )
    .all()
    .map((row) => normalizeText((row as { family: string | null }).family))
    .filter(Boolean);

  return {
    genera,
    species,
    families,
  };
}

export function getFilteredDownloadRecords(filters: DownloadFilters) {
  const database = getDatabase();
  const { whereSql, havingSql, parameters } = makeSqlFilters(filters);

  const rows = database
    .prepare(
      `
      SELECT
        p.id AS id,
        p.standardized_name AS standardizedName,
        p.protein_name AS proteinName,
        p.protein_accession AS accession,
        p.prot_fasta AS protFasta,
        p.protein_sequence AS proteinSequence,
        s.genus AS genus,
        s.species AS speciesEpithet,
        s.species_code AS speciesCode,
        COALESCE(pf.name, 'Unassigned') AS familyName,
        COUNT(e.id) AS functionalEntryCount,
        GROUP_CONCAT(DISTINCT e.expression_details) AS expressionDetails,
        GROUP_CONCAT(DISTINCT e.function_details) AS functionDetails,
        GROUP_CONCAT(DISTINCT e.molecular_function) AS molecularFunction,
        GROUP_CONCAT(DISTINCT e.biological_process) AS biologicalProcess
      FROM proteins p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      LEFT JOIN entries e ON e.protein_id = p.id
      ${whereSql}
      GROUP BY p.id
      ${havingSql}
      ORDER BY s.genus ASC, s.species ASC, p.standardized_name ASC
      `
    )
    .all(parameters) as SQLiteDownloadRow[];

  return rows.map((row) => {
    const sequence = extractSequence(row.proteinSequence, row.protFasta);
    const genus = normalizeText(row.genus);
    const species = makeSpeciesName(row.genus, row.speciesEpithet);

    return {
      id: row.id,
      standardizedName: normalizeText(row.standardizedName) || "Unnamed protein",
      proteinName: normalizeText(row.proteinName) || "No protein name available",
      accession: normalizeText(row.accession) || "No accession available",
      genus: genus || "Unknown",
      species: species || "Unknown species",
      speciesCode: normalizeText(row.speciesCode) || "Unknown",
      family: normalizeText(row.familyName) || "Unassigned",
      sequence,
      length: sequence.length,
      functionDefined: row.functionalEntryCount > 0,
      expressionDetails: uniqueJoinedText(row.expressionDetails),
      functionDetails: uniqueJoinedText(row.functionDetails),
      molecularFunction: uniqueJoinedText(row.molecularFunction),
      biologicalProcess: uniqueJoinedText(row.biologicalProcess),
    };
  });
}

export function getFilteredDownloadSummary(
  filters: DownloadFilters
): FilteredDownloadSummary {
  const records = getFilteredDownloadRecords(filters);

  return {
    matchingRecords: records.length,
    speciesCount: new Set(records.map((record) => record.species)).size,
    familyCount: new Set(records.map((record) => record.family)).size,
    functionDefinedCount: records.filter((record) => record.functionDefined)
      .length,
  };
}

export function buildFilteredFasta(records: DownloadRecord[]) {
  return records
    .filter((record) => record.sequence.length > 0)
    .map((record) => {
      const header = [
        record.standardizedName,
        record.accession,
        record.speciesCode,
        record.species,
        record.family,
        record.functionDefined ? "function-defined" : "function-not-defined",
      ].join(" | ");

      return `>${header}\n${wrapSequence(record.sequence)}`;
    })
    .join("\n\n")
    .concat("\n");
}

export function buildFilteredCsv(records: DownloadRecord[]) {
  const header = [
    "protein_id",
    "standardized_name",
    "protein_name",
    "accession",
    "species",
    "species_code",
    "genus",
    "protein_family",
    "sequence_length",
    "function_defined",
    "expression_details",
    "function_details",
    "molecular_function",
    "biological_process",
    "protein_sequence",
  ];

  const rows = records.map((record) => [
    record.id,
    record.standardizedName,
    record.proteinName,
    record.accession,
    record.species,
    record.speciesCode,
    record.genus,
    record.family,
    record.length,
    record.functionDefined,
    record.expressionDetails,
    record.functionDetails,
    record.molecularFunction,
    record.biologicalProcess,
    record.sequence,
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n")
    .concat("\n");
}
