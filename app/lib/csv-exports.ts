import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

type CsvColumn<T> = {
  header: string;
  getValue: (row: T) => string | number | null | undefined;
};

type ProteinMetadataRow = {
  protein_id: number;
  species_id: number | null;
  protein_family_id: number | null;
  protein_name: string | null;
  standardized_base: string | null;
  isoform_suffix: string | null;
  standardized_name: string | null;
  protein_accession: string | null;
  cds_accession: string | null;
  prot_fasta: string | null;
  cds_fasta: string | null;
  protein_sequence: string | null;
  protein_sequence_hash: string | null;
  genus: string | null;
  species: string | null;
  species_code: string | null;
  protein_family: string | null;
  functional_entry_count: number;
};

type FunctionalAnnotationRow = {
  entry_id: number;
  protein_id: number;
  reference_id: number | null;
  standardized_name: string | null;
  protein_name: string | null;
  protein_accession: string | null;
  cds_accession: string | null;
  genus: string | null;
  species: string | null;
  species_code: string | null;
  protein_family: string | null;
  expression_tissue: string | null;
  expression_timing: string | null;
  expression_details: string | null;
  expression_stress_variation: string | null;
  molecular_function: string | null;
  biological_process: string | null;
  function_details: string | null;
  molecular_mechanisms: string | null;
  notes: string | null;
  reference_summary: string | null;
  reference_doi: string | null;
  reference_url: string | null;
};

export type CsvDownload = {
  fileName: string;
  content: string;
  recordCount: number;
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

function normalizeText(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
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

function extractSequenceLength(
  proteinSequence: string | null,
  protFasta: string | null
) {
  const directSequence = cleanProteinSequence(proteinSequence);

  if (directSequence.length > 0) {
    return directSequence.length;
  }

  return cleanProteinSequence(protFasta).length;
}

function speciesName(genus: string | null, species: string | null) {
  return [normalizeText(genus), normalizeText(species)]
    .filter(Boolean)
    .join(" ");
}

function yesNo(value: string | null | undefined) {
  return normalizeText(value).length > 0 ? "yes" : "no";
}

function escapeCsvCell(value: string | number | null | undefined) {
  const text = normalizeText(value);
  const escaped = text.replace(/"/g, '""');

  return `"${escaped}"`;
}

function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  const header = columns.map((column) => escapeCsvCell(column.header)).join(",");

  const body = rows
    .map((row) =>
      columns
        .map((column) => escapeCsvCell(column.getValue(row)))
        .join(",")
    )
    .join("\n");

  if (!body) {
    return `${header}\n`;
  }

  return `${header}\n${body}\n`;
}

function tableHasColumn(tableName: string, columnName: string) {
  const database = getDatabase();

  const rows = database
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as { name: string }[];

  return rows.some((row) => row.name === columnName);
}

function getReferenceSummaryExpression() {
  const possibleColumns = [
    "citation",
    "reference",
    "title",
    "authors",
    "journal",
  ];

  const existingColumn = possibleColumns.find((columnName) =>
    tableHasColumn("literature_references", columnName)
  );

  if (!existingColumn) {
    return "NULL";
  }

  return `lr.${existingColumn}`;
}

function getReferenceDoiExpression() {
  if (tableHasColumn("literature_references", "doi")) {
    return "lr.doi";
  }

  return "NULL";
}

function getReferenceUrlExpression() {
  const possibleColumns = ["url", "link", "pubmed_url"];

  const existingColumn = possibleColumns.find((columnName) =>
    tableHasColumn("literature_references", columnName)
  );

  if (!existingColumn) {
    return "NULL";
  }

  return `lr.${existingColumn}`;
}

export function getProteinMetadataCsv(): CsvDownload {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      SELECT
        p.id AS protein_id,
        p.species_id AS species_id,
        p.protein_family_id AS protein_family_id,
        p.protein_name AS protein_name,
        p.standardized_base AS standardized_base,
        p.isoform_suffix AS isoform_suffix,
        p.standardized_name AS standardized_name,
        p.protein_accession AS protein_accession,
        p.cds_accession AS cds_accession,
        p.prot_fasta AS prot_fasta,
        p.cds_fasta AS cds_fasta,
        p.protein_sequence AS protein_sequence,
        p.protein_sequence_hash AS protein_sequence_hash,
        s.genus AS genus,
        s.species AS species,
        s.species_code AS species_code,
        pf.name AS protein_family,
        (
          SELECT COUNT(*)
          FROM entries e
          WHERE e.protein_id = p.id
        ) AS functional_entry_count
      FROM proteins p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      ORDER BY s.genus, s.species, p.standardized_name
      `
    )
    .all() as ProteinMetadataRow[];

  const columns: CsvColumn<ProteinMetadataRow>[] = [
    {
      header: "protein_id",
      getValue: (row) => row.protein_id,
    },
    {
      header: "standardized_name",
      getValue: (row) => row.standardized_name,
    },
    {
      header: "protein_name",
      getValue: (row) => row.protein_name,
    },
    {
      header: "standardized_base",
      getValue: (row) => row.standardized_base,
    },
    {
      header: "isoform_suffix",
      getValue: (row) => row.isoform_suffix,
    },
    {
      header: "protein_family",
      getValue: (row) => row.protein_family ?? "Unassigned",
    },
    {
      header: "protein_family_id",
      getValue: (row) => row.protein_family_id,
    },
    {
      header: "species",
      getValue: (row) => speciesName(row.genus, row.species),
    },
    {
      header: "species_code",
      getValue: (row) => row.species_code,
    },
    {
      header: "species_id",
      getValue: (row) => row.species_id,
    },
    {
      header: "protein_accession",
      getValue: (row) => row.protein_accession,
    },
    {
      header: "cds_accession",
      getValue: (row) => row.cds_accession,
    },
    {
      header: "protein_sequence_length",
      getValue: (row) =>
        extractSequenceLength(row.protein_sequence, row.prot_fasta),
    },
    {
      header: "has_protein_sequence",
      getValue: (row) =>
        extractSequenceLength(row.protein_sequence, row.prot_fasta) > 0
          ? "yes"
          : "no",
    },
    {
      header: "has_prot_fasta",
      getValue: (row) => yesNo(row.prot_fasta),
    },
    {
      header: "has_cds_fasta",
      getValue: (row) => yesNo(row.cds_fasta),
    },
    {
      header: "protein_sequence_hash",
      getValue: (row) => row.protein_sequence_hash,
    },
    {
      header: "functional_entry_count",
      getValue: (row) => row.functional_entry_count,
    },
  ];

  return {
    fileName: "cuticulome_protein_metadata.csv",
    content: buildCsv(rows, columns),
    recordCount: rows.length,
  };
}

export function getFunctionalAnnotationsCsv(): CsvDownload {
  const database = getDatabase();

  const referenceSummaryExpression = getReferenceSummaryExpression();
  const referenceDoiExpression = getReferenceDoiExpression();
  const referenceUrlExpression = getReferenceUrlExpression();

  const rows = database
    .prepare(
      `
      SELECT
        e.id AS entry_id,
        e.protein_id AS protein_id,
        e.reference_id AS reference_id,
        p.standardized_name AS standardized_name,
        p.protein_name AS protein_name,
        p.protein_accession AS protein_accession,
        p.cds_accession AS cds_accession,
        s.genus AS genus,
        s.species AS species,
        s.species_code AS species_code,
        pf.name AS protein_family,
        e.expression_tissue AS expression_tissue,
        e.expression_timing AS expression_timing,
        e.expression_details AS expression_details,
        e.expression_stress_variation AS expression_stress_variation,
        e.molecular_function AS molecular_function,
        e.biological_process AS biological_process,
        e.function_details AS function_details,
        e.molecular_mechanisms AS molecular_mechanisms,
        e.notes AS notes,
        ${referenceSummaryExpression} AS reference_summary,
        ${referenceDoiExpression} AS reference_doi,
        ${referenceUrlExpression} AS reference_url
      FROM entries e
      LEFT JOIN proteins p ON e.protein_id = p.id
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      LEFT JOIN literature_references lr ON e.reference_id = lr.id
      ORDER BY e.id ASC
      `
    )
    .all() as FunctionalAnnotationRow[];

  const columns: CsvColumn<FunctionalAnnotationRow>[] = [
    {
      header: "entry_id",
      getValue: (row) => row.entry_id,
    },
    {
      header: "protein_id",
      getValue: (row) => row.protein_id,
    },
    {
      header: "standardized_name",
      getValue: (row) => row.standardized_name,
    },
    {
      header: "protein_name",
      getValue: (row) => row.protein_name,
    },
    {
      header: "protein_family",
      getValue: (row) => row.protein_family ?? "Unassigned",
    },
    {
      header: "species",
      getValue: (row) => speciesName(row.genus, row.species),
    },
    {
      header: "species_code",
      getValue: (row) => row.species_code,
    },
    {
      header: "protein_accession",
      getValue: (row) => row.protein_accession,
    },
    {
      header: "cds_accession",
      getValue: (row) => row.cds_accession,
    },
    {
      header: "reference_id",
      getValue: (row) => row.reference_id,
    },
    {
      header: "reference_summary",
      getValue: (row) => row.reference_summary,
    },
    {
      header: "reference_doi",
      getValue: (row) => row.reference_doi,
    },
    {
      header: "reference_url",
      getValue: (row) => row.reference_url,
    },
    {
      header: "expression_tissue",
      getValue: (row) => row.expression_tissue,
    },
    {
      header: "expression_timing",
      getValue: (row) => row.expression_timing,
    },
    {
      header: "expression_details",
      getValue: (row) => row.expression_details,
    },
    {
      header: "expression_stress_variation",
      getValue: (row) => row.expression_stress_variation,
    },
    {
      header: "molecular_function",
      getValue: (row) => row.molecular_function,
    },
    {
      header: "biological_process",
      getValue: (row) => row.biological_process,
    },
    {
      header: "function_details",
      getValue: (row) => row.function_details,
    },
    {
      header: "molecular_mechanisms",
      getValue: (row) => row.molecular_mechanisms,
    },
    {
      header: "notes",
      getValue: (row) => row.notes,
    },
  ];

  return {
    fileName: "cuticulome_functional_annotations.csv",
    content: buildCsv(rows, columns),
    recordCount: rows.length,
  };
}
