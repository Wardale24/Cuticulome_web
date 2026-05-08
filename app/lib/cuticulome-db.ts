import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type ProteinRecord = {
  id: number;
  speciesId: number;
  proteinFamilyId: number | null;
  standardizedName: string;
  proteinName: string;
  accession: string;
  species: string;
  speciesCode: string;
  family: string;
  length: number;
  proteinSequence: string;
};

type SQLiteProteinRow = {
  id: number;
  speciesId: number | null;
  proteinFamilyId: number | null;
  standardizedName: string | null;
  proteinName: string | null;
  accession: string | null;
  protFasta: string | null;
  proteinSequence: string | null;
  genus: string | null;
  species: string | null;
  speciesCode: string | null;
  familyName: string | null;
};

type SQLiteEntryRow = {
  id: number;
  protein_id: number;
  reference_id: number | null;
  expression_tissue: string | null;
  expression_timing: string | null;
  expression_details: string | null;
  expression_stress_variation: string | null;
  molecular_function: string | null;
  biological_process: string | null;
  function_details: string | null;
  molecular_mechanisms: string | null;
  notes: string | null;
};

type SQLiteReferenceRow = Record<string, unknown>;

export type LiteratureReferenceField = {
  label: string;
  value: string;
};

export type LiteratureReference = {
  id: number;
  label: string;
  doi: string;
  url: string;
  fields: LiteratureReferenceField[];
};

export type FunctionalEntry = {
  id: number;
  referenceId: number | null;
  expressionTissue: string;
  expressionTiming: string;
  expressionDetails: string;
  expressionStressVariation: string;
  molecularFunction: string;
  biologicalProcess: string;
  functionDetails: string;
  molecularMechanisms: string;
  notes: string;
  reference: LiteratureReference | null;
};

export type ProteinPageData = {
  protein: ProteinRecord;
  functionalEntries: FunctionalEntry[];
};

export type BrowseFilters = {
  searchTerm?: string;
  selectedFamily?: string;
  selectedSpecies?: string;
};

export type BrowseData = {
  records: ProteinRecord[];
  families: string[];
  species: string[];
  totalRecords: number;
  totalFamilies: number;
  totalSpecies: number;
};

export type SpeciesSummary = {
  id: number;
  species: string;
  speciesCode: string;
  proteinCount: number;
  familyCount: number;
  families: string[];
  averageLength: number;
};

export type SpeciesData = {
  speciesSummaries: SpeciesSummary[];
  totalSpecies: number;
  totalProteins: number;
  totalFamilies: number;
};

export type FamilyExampleProtein = {
  id: number;
  standardizedName: string;
  accession: string;
  species: string;
  speciesCode: string;
};

export type FamilySummary = {
  family: string;
  proteinCount: number;
  speciesCount: number;
  averageLength: number;
  species: string[];
  exampleProteins: FamilyExampleProtein[];
};

export type FamiliesData = {
  familySummaries: FamilySummary[];
  totalFamilies: number;
  totalProteins: number;
  totalSpecies: number;
};

export type DownloadFamilySummary = {
  family: string;
  proteinCount: number;
};

export type DownloadSpeciesSummary = {
  id: number;
  species: string;
  speciesCode: string;
  proteinCount: number;
};

export type DownloadsData = {
  totalProteins: number;
  totalSpecies: number;
  totalFamilies: number;
  families: DownloadFamilySummary[];
  species: DownloadSpeciesSummary[];
};

export type FastaDownload = {
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

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeUnknown(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

function humanizeColumnName(columnName: string) {
  return columnName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

export function wrapSequence(sequence: string, width = 80) {
  const cleanSequence = sequence.replace(/\s+/g, "");
  const wrappedLines = [];

  for (let index = 0; index < cleanSequence.length; index += width) {
    wrappedLines.push(cleanSequence.slice(index, index + width));
  }

  return wrappedLines.join("\n");
}

function buildFasta(records: ProteinRecord[]) {
  return records
    .filter((record) => record.proteinSequence.length > 0)
    .map((record) => {
      const headerParts = [
        record.standardizedName,
        record.accession,
        record.speciesCode,
        record.species,
        record.family,
      ].filter(Boolean);

      const header = `>${headerParts.join(" | ")}`;
      const sequence = wrapSequence(record.proteinSequence);

      return `${header}\n${sequence}`;
    })
    .join("\n\n")
    .concat("\n");
}

function getAllProteinRecords() {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      SELECT
        p.id AS id,
        p.species_id AS speciesId,
        p.protein_family_id AS proteinFamilyId,
        p.standardized_name AS standardizedName,
        p.protein_name AS proteinName,
        p.protein_accession AS accession,
        p.prot_fasta AS protFasta,
        p.protein_sequence AS proteinSequence,
        s.genus AS genus,
        s.species AS species,
        s.species_code AS speciesCode,
        pf.name AS familyName
      FROM proteins p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      ORDER BY s.genus, s.species, p.standardized_name
      `
    )
    .all() as SQLiteProteinRow[];

  return rows.map((row) => {
    const standardizedName = normalizeText(row.standardizedName);
    const proteinName = normalizeText(row.proteinName);
    const accession = normalizeText(row.accession);
    const genus = normalizeText(row.genus);
    const speciesEpithet = normalizeText(row.species);
    const species = [genus, speciesEpithet].filter(Boolean).join(" ");
    const speciesCode = normalizeText(row.speciesCode);
    const familyName = normalizeText(row.familyName);
    const proteinSequence = extractSequence(row.proteinSequence, row.protFasta);

    return {
      id: row.id,
      speciesId: row.speciesId ?? 0,
      proteinFamilyId: row.proteinFamilyId,
      standardizedName: standardizedName || "Unnamed protein",
      proteinName: proteinName || "No protein name available",
      accession: accession || "No accession available",
      species: species || "Unknown species",
      speciesCode: speciesCode || "Unknown",
      family: familyName || "Unassigned",
      length: proteinSequence.length,
      proteinSequence,
    };
  });
}

function getReference(referenceId: number | null) {
  if (!referenceId) {
    return null;
  }

  const database = getDatabase();

  const row = database
    .prepare(
      `
      SELECT *
      FROM literature_references
      WHERE id = ?
      `
    )
    .get(referenceId) as SQLiteReferenceRow | undefined;

  if (!row) {
    return null;
  }

  const fields = Object.entries(row)
    .filter(([key]) => key !== "id")
    .map(([key, value]) => ({
      label: humanizeColumnName(key),
      value: normalizeUnknown(value),
    }))
    .filter((field) => field.value.length > 0);

  const doiField =
    fields.find((field) => field.label.toLowerCase() === "doi") ??
    fields.find((field) => field.label.toLowerCase().includes("doi"));

  const urlField =
    fields.find((field) => field.label.toLowerCase() === "url") ??
    fields.find((field) => field.label.toLowerCase().includes("url")) ??
    fields.find((field) => field.value.startsWith("http"));

  const labelField =
    fields.find((field) => field.label.toLowerCase() === "reference") ??
    fields.find((field) => field.label.toLowerCase() === "citation") ??
    fields.find((field) => field.label.toLowerCase() === "title") ??
    fields[0];

  return {
    id: Number(row.id),
    label: labelField?.value ?? `Reference ${referenceId}`,
    doi: doiField?.value ?? "",
    url: urlField?.value ?? "",
    fields,
  };
}

function getFunctionalEntries(proteinId: number): FunctionalEntry[] {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      SELECT
        id,
        protein_id,
        reference_id,
        expression_tissue,
        expression_timing,
        expression_details,
        expression_stress_variation,
        molecular_function,
        biological_process,
        function_details,
        molecular_mechanisms,
        notes
      FROM entries
      WHERE protein_id = ?
      ORDER BY id ASC
      `
    )
    .all(proteinId) as SQLiteEntryRow[];

  return rows.map((row) => ({
    id: row.id,
    referenceId: row.reference_id,
    expressionTissue: normalizeText(row.expression_tissue),
    expressionTiming: normalizeText(row.expression_timing),
    expressionDetails: normalizeText(row.expression_details),
    expressionStressVariation: normalizeText(row.expression_stress_variation),
    molecularFunction: normalizeText(row.molecular_function),
    biologicalProcess: normalizeText(row.biological_process),
    functionDetails: normalizeText(row.function_details),
    molecularMechanisms: normalizeText(row.molecular_mechanisms),
    notes: normalizeText(row.notes),
    reference: getReference(row.reference_id),
  }));
}

export function getProteinDetail(proteinId: number) {
  const records = getAllProteinRecords();
  return records.find((record) => record.id === proteinId) ?? null;
}

export function getProteinPageData(proteinId: number): ProteinPageData | null {
  const protein = getProteinDetail(proteinId);

  if (!protein) {
    return null;
  }

  return {
    protein,
    functionalEntries: getFunctionalEntries(proteinId),
  };
}

export function getBrowseData({
  searchTerm = "",
  selectedFamily = "All families",
  selectedSpecies = "All species",
}: BrowseFilters): BrowseData {
  const allRecords = getAllProteinRecords();

  const families = [
    "All families",
    ...Array.from(new Set(allRecords.map((record) => record.family))).sort(),
  ];

  const species = [
    "All species",
    ...Array.from(new Set(allRecords.map((record) => record.species))).sort(),
  ];

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  const filteredRecords = allRecords.filter((record) => {
    const searchableText = [
      record.standardizedName,
      record.proteinName,
      record.accession,
      record.species,
      record.speciesCode,
      record.family,
      String(record.length),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      searchableText.includes(normalizedSearchTerm);

    const matchesFamily =
      selectedFamily === "All families" || record.family === selectedFamily;

    const matchesSpecies =
      selectedSpecies === "All species" || record.species === selectedSpecies;

    return matchesSearch && matchesFamily && matchesSpecies;
  });

  return {
    records: filteredRecords,
    families,
    species,
    totalRecords: allRecords.length,
    totalFamilies: families.length - 1,
    totalSpecies: species.length - 1,
  };
}

export function getSpeciesData(searchTerm = ""): SpeciesData {
  const allRecords = getAllProteinRecords();
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  const speciesMap = new Map<
    string,
    {
      id: number;
      species: string;
      speciesCode: string;
      proteinCount: number;
      totalLength: number;
      proteinsWithLength: number;
      families: Set<string>;
    }
  >();

  for (const record of allRecords) {
    const mapKey = `${record.speciesId}-${record.species}`;

    if (!speciesMap.has(mapKey)) {
      speciesMap.set(mapKey, {
        id: record.speciesId,
        species: record.species,
        speciesCode: record.speciesCode,
        proteinCount: 0,
        totalLength: 0,
        proteinsWithLength: 0,
        families: new Set<string>(),
      });
    }

    const speciesEntry = speciesMap.get(mapKey);

    if (!speciesEntry) {
      continue;
    }

    speciesEntry.proteinCount += 1;
    speciesEntry.families.add(record.family);

    if (record.length > 0) {
      speciesEntry.totalLength += record.length;
      speciesEntry.proteinsWithLength += 1;
    }
  }

  const allSpeciesSummaries = Array.from(speciesMap.values())
    .map((entry) => {
      const averageLength =
        entry.proteinsWithLength > 0
          ? Math.round(entry.totalLength / entry.proteinsWithLength)
          : 0;

      const families = Array.from(entry.families).sort();

      return {
        id: entry.id,
        species: entry.species,
        speciesCode: entry.speciesCode,
        proteinCount: entry.proteinCount,
        familyCount: families.length,
        families,
        averageLength,
      };
    })
    .sort((a, b) => a.species.localeCompare(b.species));

  const filteredSpeciesSummaries = allSpeciesSummaries.filter((entry) => {
    const searchableText = [
      entry.species,
      entry.speciesCode,
      entry.proteinCount,
      entry.familyCount,
      entry.averageLength,
      entry.families.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return (
      normalizedSearchTerm.length === 0 ||
      searchableText.includes(normalizedSearchTerm)
    );
  });

  const allFamilies = new Set<string>();

  for (const record of allRecords) {
    allFamilies.add(record.family);
  }

  return {
    speciesSummaries: filteredSpeciesSummaries,
    totalSpecies: allSpeciesSummaries.length,
    totalProteins: allRecords.length,
    totalFamilies: allFamilies.size,
  };
}

export function getFamiliesData(searchTerm = ""): FamiliesData {
  const allRecords = getAllProteinRecords();
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  const familyMap = new Map<
    string,
    {
      family: string;
      proteinCount: number;
      totalLength: number;
      proteinsWithLength: number;
      species: Set<string>;
      exampleProteins: FamilyExampleProtein[];
    }
  >();

  for (const record of allRecords) {
    if (!familyMap.has(record.family)) {
      familyMap.set(record.family, {
        family: record.family,
        proteinCount: 0,
        totalLength: 0,
        proteinsWithLength: 0,
        species: new Set<string>(),
        exampleProteins: [],
      });
    }

    const familyEntry = familyMap.get(record.family);

    if (!familyEntry) {
      continue;
    }

    familyEntry.proteinCount += 1;
    familyEntry.species.add(record.species);

    if (record.length > 0) {
      familyEntry.totalLength += record.length;
      familyEntry.proteinsWithLength += 1;
    }

    if (familyEntry.exampleProteins.length < 5) {
      familyEntry.exampleProteins.push({
        id: record.id,
        standardizedName: record.standardizedName,
        accession: record.accession,
        species: record.species,
        speciesCode: record.speciesCode,
      });
    }
  }

  const allFamilySummaries = Array.from(familyMap.values())
    .map((entry) => {
      const averageLength =
        entry.proteinsWithLength > 0
          ? Math.round(entry.totalLength / entry.proteinsWithLength)
          : 0;

      return {
        family: entry.family,
        proteinCount: entry.proteinCount,
        speciesCount: entry.species.size,
        averageLength,
        species: Array.from(entry.species).sort(),
        exampleProteins: entry.exampleProteins,
      };
    })
    .sort((a, b) => {
      if (b.proteinCount !== a.proteinCount) {
        return b.proteinCount - a.proteinCount;
      }

      return a.family.localeCompare(b.family);
    });

  const filteredFamilySummaries = allFamilySummaries.filter((entry) => {
    const searchableText = [
      entry.family,
      entry.proteinCount,
      entry.speciesCount,
      entry.averageLength,
      entry.species.join(" "),
      entry.exampleProteins
        .map((protein) =>
          [
            protein.standardizedName,
            protein.accession,
            protein.species,
            protein.speciesCode,
          ].join(" ")
        )
        .join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return (
      normalizedSearchTerm.length === 0 ||
      searchableText.includes(normalizedSearchTerm)
    );
  });

  const allSpecies = new Set<string>();

  for (const record of allRecords) {
    allSpecies.add(record.species);
  }

  return {
    familySummaries: filteredFamilySummaries,
    totalFamilies: allFamilySummaries.length,
    totalProteins: allRecords.length,
    totalSpecies: allSpecies.size,
  };
}

export function getDownloadsData(): DownloadsData {
  const allRecords = getAllProteinRecords();

  const familyMap = new Map<string, number>();
  const speciesMap = new Map<
    string,
    {
      id: number;
      species: string;
      speciesCode: string;
      proteinCount: number;
    }
  >();

  for (const record of allRecords) {
    familyMap.set(record.family, (familyMap.get(record.family) ?? 0) + 1);

    const speciesKey = `${record.speciesId}-${record.species}`;

    if (!speciesMap.has(speciesKey)) {
      speciesMap.set(speciesKey, {
        id: record.speciesId,
        species: record.species,
        speciesCode: record.speciesCode,
        proteinCount: 0,
      });
    }

    const speciesEntry = speciesMap.get(speciesKey);

    if (speciesEntry) {
      speciesEntry.proteinCount += 1;
    }
  }

  const families = Array.from(familyMap.entries())
    .map(([family, proteinCount]) => ({
      family,
      proteinCount,
    }))
    .sort((a, b) => a.family.localeCompare(b.family));

  const species = Array.from(speciesMap.values()).sort((a, b) =>
    a.species.localeCompare(b.species)
  );

  return {
    totalProteins: allRecords.length,
    totalSpecies: species.length,
    totalFamilies: families.length,
    families,
    species,
  };
}

export function getAllFasta(): FastaDownload {
  const records = getAllProteinRecords();
  const content = buildFasta(records);

  return {
    fileName: "cuticulome_all_proteins.fasta",
    content,
    recordCount: records.filter((record) => record.proteinSequence.length > 0)
      .length,
  };
}

export function getSpeciesFasta(speciesId: number): FastaDownload {
  const records = getAllProteinRecords().filter(
    (record) => record.speciesId === speciesId
  );

  const firstRecord = records[0];
  const speciesLabel = firstRecord
    ? `${firstRecord.speciesCode}_${firstRecord.species}`
    : `species_${speciesId}`;

  const fileName = `cuticulome_${sanitizeFileName(speciesLabel)}.fasta`;

  return {
    fileName,
    content: buildFasta(records),
    recordCount: records.filter((record) => record.proteinSequence.length > 0)
      .length,
  };
}

export function getFamilyFasta(family: string): FastaDownload {
  const records = getAllProteinRecords().filter(
    (record) => record.family === family
  );

  const fileName = `cuticulome_family_${sanitizeFileName(family)}.fasta`;

  return {
    fileName,
    content: buildFasta(records),
    recordCount: records.filter((record) => record.proteinSequence.length > 0)
      .length,
  };
}

export function getProteinFasta(proteinId: number): FastaDownload {
  const protein = getProteinDetail(proteinId);
  const records = protein ? [protein] : [];
  const fileName = protein
    ? `cuticulome_${sanitizeFileName(protein.standardizedName)}.fasta`
    : `cuticulome_protein_${proteinId}.fasta`;

  return {
    fileName,
    content: buildFasta(records),
    recordCount: records.filter((record) => record.proteinSequence.length > 0)
      .length,
  };
}
