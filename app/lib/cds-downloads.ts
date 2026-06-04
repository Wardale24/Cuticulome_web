import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type CdsFastaDownload = {
  fileName: string;
  content: string;
  recordCount: number;
};

type SQLiteCdsRow = {
  id: number;
  speciesId: number | null;
  standardizedName: string | null;
  cdsAccession: string | null;
  cdsFasta: string | null;
  genus: string | null;
  species: string | null;
  speciesCode: string | null;
  familyName: string | null;
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

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

function cleanSequence(text: string | null | undefined) {
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

function wrapSequence(sequence: string, width = 80) {
  const wrappedLines = [];

  for (let index = 0; index < sequence.length; index += width) {
    wrappedLines.push(sequence.slice(index, index + width));
  }

  return wrappedLines.join("\n");
}

function cleanFastaHeaderPart(value: string | null | undefined) {
  return (
    value
      ?.trim()
      .replace(/\s+/g, "_")
      .replace(/\|/g, "-") ?? ""
  );
}

function hasUsableAccession(accession: string | null | undefined) {
  const cleanedAccession = cleanFastaHeaderPart(accession).toLowerCase();

  return (
    cleanedAccession.length > 0 &&
    cleanedAccession !== "no_accession_available" &&
    cleanedAccession !== "no accession available" &&
    cleanedAccession !== "unknown" &&
    cleanedAccession !== "na" &&
    cleanedAccession !== "n/a"
  );
}

function makeCdsFastaHeader(row: SQLiteCdsRow) {
  const species = makeSpeciesName(row.genus, row.species) || "Unknown species";
  const family = normalizeText(row.familyName) || "Unassigned";

  const headerParts = [
    cleanFastaHeaderPart(row.standardizedName) || `protein_${row.id}`,
    hasUsableAccession(row.cdsAccession)
      ? cleanFastaHeaderPart(row.cdsAccession)
      : "",
    cleanFastaHeaderPart(species),
    cleanFastaHeaderPart(family),
    "CDS",
  ].filter(Boolean);

  return `>${headerParts.join("|")}`;
}

function buildCdsFasta(rows: SQLiteCdsRow[]) {
  return rows
    .map((row) => ({
      row,
      sequence: cleanSequence(row.cdsFasta),
    }))
    .filter(({ sequence }) => sequence.length > 0)
    .map(
      ({ row, sequence }) => `${makeCdsFastaHeader(row)}\n${wrapSequence(sequence)}`
    )
    .join("\n\n")
    .concat("\n");
}

function getCdsRowsForProtein(proteinId: number) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        p.id AS id,
        p.species_id AS speciesId,
        p.standardized_name AS standardizedName,
        p.cds_accession AS cdsAccession,
        p.cds_fasta AS cdsFasta,
        s.genus AS genus,
        s.species AS species,
        s.species_code AS speciesCode,
        pf.name AS familyName
      FROM proteins p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      WHERE p.id = ?
      `
    )
    .all(proteinId) as SQLiteCdsRow[];
}

function getCdsRowsForSpecies(speciesId: number) {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        p.id AS id,
        p.species_id AS speciesId,
        p.standardized_name AS standardizedName,
        p.cds_accession AS cdsAccession,
        p.cds_fasta AS cdsFasta,
        s.genus AS genus,
        s.species AS species,
        s.species_code AS speciesCode,
        pf.name AS familyName
      FROM proteins p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      WHERE p.species_id = ?
      ORDER BY p.standardized_name ASC
      `
    )
    .all(speciesId) as SQLiteCdsRow[];
}

export function hasProteinCdsData(proteinId: number) {
  return getCdsRowsForProtein(proteinId).some(
    (row) => cleanSequence(row.cdsFasta).length > 0
  );
}

export function getSpeciesCdsAvailabilityMap() {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      SELECT
        p.id AS id,
        p.species_id AS speciesId,
        p.standardized_name AS standardizedName,
        p.cds_accession AS cdsAccession,
        p.cds_fasta AS cdsFasta,
        s.genus AS genus,
        s.species AS species,
        s.species_code AS speciesCode,
        pf.name AS familyName
      FROM proteins p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      WHERE p.species_id IS NOT NULL
      `
    )
    .all() as SQLiteCdsRow[];

  const availability = new Map<number, number>();

  for (const row of rows) {
    if (row.speciesId === null || cleanSequence(row.cdsFasta).length === 0) {
      continue;
    }

    availability.set(row.speciesId, (availability.get(row.speciesId) ?? 0) + 1);
  }

  return availability;
}

export function getProteinCdsFasta(proteinId: number): CdsFastaDownload {
  const rows = getCdsRowsForProtein(proteinId);
  const firstRow = rows[0];
  const fileName = firstRow
    ? `cuticulome_${sanitizeFileName(
        normalizeText(firstRow.standardizedName) || `protein_${proteinId}`
      )}_cds.fasta`
    : `cuticulome_protein_${proteinId}_cds.fasta`;

  const content = buildCdsFasta(rows);

  return {
    fileName,
    content,
    recordCount: rows.filter((row) => cleanSequence(row.cdsFasta).length > 0)
      .length,
  };
}

export function getSpeciesCdsFasta(speciesId: number): CdsFastaDownload {
  const rows = getCdsRowsForSpecies(speciesId);
  const firstRow = rows[0];
  const species = firstRow
    ? makeSpeciesName(firstRow.genus, firstRow.species)
    : `species_${speciesId}`;
  const speciesCode = firstRow ? normalizeText(firstRow.speciesCode) : "";
  const speciesLabel = [speciesCode, species].filter(Boolean).join("_");
  const fileName = `cuticulome_${sanitizeFileName(speciesLabel)}_cds.fasta`;
  const content = buildCdsFasta(rows);

  return {
    fileName,
    content,
    recordCount: rows.filter((row) => cleanSequence(row.cdsFasta).length > 0)
      .length,
  };
}
