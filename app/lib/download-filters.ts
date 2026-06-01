import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type DownloadFilters = {
  query: string;
  taxonomicClass: string;
  speciesId: string;
  family: string;
  functionStatus: "all" | "defined" | "lacking";
  functionQuery: string;
};

export type DownloadFilterSpeciesOption = {
  id: number;
  taxonomicClass: string;
  genus: string;
  species: string;
  speciesCode: string;
};

export type DownloadFilterOptions = {
  classes: string[];
  species: DownloadFilterSpeciesOption[];
  families: string[];
};

export type DownloadRecord = {
  id: number;
  standardizedName: string;
  proteinName: string;
  accession: string;
  cdsAccession: string;
  genus: string;
  species: string;
  speciesCode: string;
  family: string;
  sequence: string;
  length: number;
  functionDefined: boolean;
  expressionTissue: string;
  expressionTiming: string;
  expressionDetails: string;
  expressionStressVariation: string;
  molecularFunction: string;
  biologicalProcess: string;
  functionDetails: string;
  molecularMechanisms: string;
  notes: string;
  literatureReference: string;
  referenceYear: string;
  referenceDoi: string;
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
  cdsAccession: string | null;
  protFasta: string | null;
  proteinSequence: string | null;
  genus: string | null;
  speciesEpithet: string | null;
  speciesCode: string | null;
  familyName: string | null;
  functionalEntryCount: number;
  expressionTissue: string | null;
  expressionTiming: string | null;
  expressionDetails: string | null;
  expressionStressVariation: string | null;
  molecularFunction: string | null;
  biologicalProcess: string | null;
  functionDetails: string | null;
  molecularMechanisms: string | null;
  notes: string | null;
  literatureReference: string | null;
  referenceYear: string | null;
  referenceDoi: string | null;
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

function normalizeGroupedText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const parts = value
    .split(" || ")
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
  const taxonomicClass = filters.taxonomicClass.trim();
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
        OR LOWER(COALESCE(p.cds_accession, '')) LIKE @query
        OR LOWER(COALESCE(s.class_name, '')) LIKE @query
        OR LOWER(COALESCE(s.genus, '')) LIKE @query
        OR LOWER(COALESCE(s.species, '')) LIKE @query
        OR LOWER(COALESCE(s.species_code, '')) LIKE @query
        OR LOWER(COALESCE(pf.name, '')) LIKE @query
      )
    `);
  }

  if (taxonomicClass.length > 0) {
    parameters.taxonomicClass = taxonomicClass;
    whereClauses.push("s.class_name = @taxonomicClass");
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
        OR LOWER(COALESCE(lr.reference_text, '')) LIKE @functionQuery
        OR LOWER(COALESCE(CAST(lr.year AS TEXT), '')) LIKE @functionQuery
        OR LOWER(COALESCE(lr.doi, '')) LIKE @functionQuery
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
    taxonomicClass: "",
    speciesId: "",
    family: "",
    functionStatus: "all",
    functionQuery: "",
  };
}

export function getDownloadFilterOptions(): DownloadFilterOptions {
  const database = getDatabase();

  const classes = database
    .prepare(
      `
      SELECT DISTINCT class_name AS taxonomicClass
      FROM species
      WHERE class_name IS NOT NULL
        AND TRIM(class_name) != ''
      ORDER BY class_name ASC
      `
    )
    .all()
    .map((row) =>
      normalizeText((row as { taxonomicClass: string | null }).taxonomicClass)
    )
    .filter(Boolean);

  const species = database
    .prepare(
      `
      SELECT
        id,
        class_name AS taxonomicClass,
        genus,
        species,
        species_code AS speciesCode
      FROM species
      ORDER BY class_name ASC, genus ASC, species ASC
      `
    )
    .all()
    .map((row) => {
      const typedRow = row as {
        id: number;
        taxonomicClass: string | null;
        genus: string | null;
        species: string | null;
        speciesCode: string | null;
      };

      const genus = normalizeText(typedRow.genus);

      return {
        id: typedRow.id,
        taxonomicClass: normalizeText(typedRow.taxonomicClass),
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
    classes,
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
        p.cds_accession AS cdsAccession,
        p.prot_fasta AS protFasta,
        p.protein_sequence AS proteinSequence,
        s.genus AS genus,
        s.species AS speciesEpithet,
        s.species_code AS speciesCode,
        COALESCE(pf.name, 'Unassigned') AS familyName,
        COUNT(e.id) AS functionalEntryCount,
        GROUP_CONCAT(NULLIF(TRIM(e.expression_tissue), ''), ' || ') AS expressionTissue,
        GROUP_CONCAT(NULLIF(TRIM(e.expression_timing), ''), ' || ') AS expressionTiming,
        GROUP_CONCAT(NULLIF(TRIM(e.expression_details), ''), ' || ') AS expressionDetails,
        GROUP_CONCAT(NULLIF(TRIM(e.expression_stress_variation), ''), ' || ') AS expressionStressVariation,
        GROUP_CONCAT(NULLIF(TRIM(e.molecular_function), ''), ' || ') AS molecularFunction,
        GROUP_CONCAT(NULLIF(TRIM(e.biological_process), ''), ' || ') AS biologicalProcess,
        GROUP_CONCAT(NULLIF(TRIM(e.function_details), ''), ' || ') AS functionDetails,
        GROUP_CONCAT(NULLIF(TRIM(e.molecular_mechanisms), ''), ' || ') AS molecularMechanisms,
        GROUP_CONCAT(NULLIF(TRIM(e.notes), ''), ' || ') AS notes,
        GROUP_CONCAT(NULLIF(TRIM(lr.reference_text), ''), ' || ') AS literatureReference,
        GROUP_CONCAT(NULLIF(TRIM(CAST(lr.year AS TEXT)), ''), ' || ') AS referenceYear,
        GROUP_CONCAT(NULLIF(TRIM(lr.doi), ''), ' || ') AS referenceDoi
      FROM proteins p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      LEFT JOIN entries e ON e.protein_id = p.id
      LEFT JOIN literature_references lr ON e.reference_id = lr.id
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
      accession: normalizeText(row.accession),
      cdsAccession: normalizeText(row.cdsAccession),
      genus: genus || "Unknown",
      species: species || "Unknown species",
      speciesCode: normalizeText(row.speciesCode) || "Unknown",
      family: normalizeText(row.familyName) || "Unassigned",
      sequence,
      length: sequence.length,
      functionDefined: row.functionalEntryCount > 0,
      expressionTissue: normalizeGroupedText(row.expressionTissue),
      expressionTiming: normalizeGroupedText(row.expressionTiming),
      expressionDetails: normalizeGroupedText(row.expressionDetails),
      expressionStressVariation: normalizeGroupedText(
        row.expressionStressVariation
      ),
      molecularFunction: normalizeGroupedText(row.molecularFunction),
      biologicalProcess: normalizeGroupedText(row.biologicalProcess),
      functionDetails: normalizeGroupedText(row.functionDetails),
      molecularMechanisms: normalizeGroupedText(row.molecularMechanisms),
      notes: normalizeGroupedText(row.notes),
      literatureReference: normalizeGroupedText(row.literatureReference),
      referenceYear: normalizeGroupedText(row.referenceYear),
      referenceDoi: normalizeGroupedText(row.referenceDoi),
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

function makeFilteredFastaHeader(record: DownloadRecord) {
  const headerParts = [
    cleanFastaHeaderPart(record.standardizedName),
    hasUsableAccession(record.accession)
      ? cleanFastaHeaderPart(record.accession)
      : "",
    cleanFastaHeaderPart(record.species),
    cleanFastaHeaderPart(record.family),
  ].filter(Boolean);

  return `>${headerParts.join("|")}`;
}

export function buildFilteredFasta(records: DownloadRecord[]) {
  return records
    .filter((record) => record.sequence.length > 0)
    .map((record) => {
      const header = makeFilteredFastaHeader(record);

      return `${header}\n${wrapSequence(record.sequence)}`;
    })
    .join("\n\n")
    .concat("\n");
}

export function buildFilteredCsv(records: DownloadRecord[]) {
  const header = [
    "Standardized name",
    "Protein name",
    "NCBI accession",
    "CDS accession",
    "Species",
    "Species code",
    "Genus",
    "Protein family",
    "Sequence length",
    "Expression tissue",
    "Expression timing",
    "Expression details",
    "Expression stress variation",
    "Molecular function",
    "Biological process",
    "Function details",
    "Molecular mechanisms",
    "Notes",
    "Literature reference",
    "Reference year",
    "Reference DOI",
    "Protein sequence",
  ];

  const rows = records.map((record) => [
    record.standardizedName,
    record.proteinName,
    record.accession,
    record.cdsAccession,
    record.species,
    record.speciesCode,
    record.genus,
    record.family,
    record.length,
    record.expressionTissue,
    record.expressionTiming,
    record.expressionDetails,
    record.expressionStressVariation,
    record.molecularFunction,
    record.biologicalProcess,
    record.functionDetails,
    record.molecularMechanisms,
    record.notes,
    record.literatureReference,
    record.referenceYear,
    record.referenceDoi,
    record.sequence,
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n")
    .concat("\n");
}
