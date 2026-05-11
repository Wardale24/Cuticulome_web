import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type DistributionRow = {
  label: string;
  count: number;
  percentage: number;
};

export type SpeciesStatistic = {
  species: string;
  speciesCode: string;
  proteinCount: number;
  familyCount: number;
};

export type SequenceAvailability = {
  label: string;
  count: number;
  percentage: number;
};

export type DatabaseStatistics = {
  totalProteins: number;
  totalSpecies: number;
  totalRepresentedFamilies: number;
  totalFamilyTerms: number;
  totalFunctionalEntries: number;
  totalLiteratureReferences: number;
  functionDefinedProteins: number;
  nonFunctionDefinedProteins: number;
  functionDefinedPercentage: number;
  familyDistribution: DistributionRow[];
  topSpecies: SpeciesStatistic[];
  sequenceAvailability: SequenceAvailability[];
};

type CountRow = {
  count: number;
};

type FamilyDistributionRow = {
  family: string | null;
  count: number;
};

type SpeciesStatisticRow = {
  species: string | null;
  speciesCode: string | null;
  proteinCount: number;
  familyCount: number;
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

function getCount(query: string) {
  const database = getDatabase();
  const row = database.prepare(query).get() as CountRow | undefined;

  return row?.count ?? 0;
}

function percentage(count: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 1000) / 10;
}

export function getDatabaseStatistics(): DatabaseStatistics {
  const database = getDatabase();

  const totalProteins = getCount(`
    SELECT COUNT(*) AS count
    FROM proteins
  `);

  const totalSpecies = getCount(`
    SELECT COUNT(*) AS count
    FROM species
  `);

  const totalRepresentedFamilies = getCount(`
    SELECT COUNT(DISTINCT protein_family_id) AS count
    FROM proteins
    WHERE protein_family_id IS NOT NULL
  `);

  const totalFamilyTerms = getCount(`
    SELECT COUNT(*) AS count
    FROM protein_family
  `);

  const functionDefinedProteins = getCount(`
    SELECT COUNT(DISTINCT protein_id) AS count
    FROM entries
  `);

  const totalFunctionalEntries = functionDefinedProteins;

  const totalLiteratureReferences = getCount(`
    SELECT COUNT(*) AS count
    FROM literature_references
  `);

  const nonFunctionDefinedProteins = Math.max(
    totalProteins - functionDefinedProteins,
    0
  );

  const familyRows = database
    .prepare(
      `
      SELECT
        COALESCE(pf.name, 'Unassigned') AS family,
        COUNT(p.id) AS count
      FROM proteins p
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      GROUP BY COALESCE(pf.name, 'Unassigned')
      ORDER BY count DESC, family ASC
      `
    )
    .all() as FamilyDistributionRow[];

  const familyDistribution = familyRows.map((row) => ({
    label: row.family ?? "Unassigned",
    count: row.count,
    percentage: percentage(row.count, totalProteins),
  }));

  const speciesRows = database
    .prepare(
      `
      SELECT
        TRIM(COALESCE(s.genus, '') || ' ' || COALESCE(s.species, '')) AS species,
        COALESCE(s.species_code, 'Unknown') AS speciesCode,
        COUNT(p.id) AS proteinCount,
        COUNT(DISTINCT p.protein_family_id) AS familyCount
      FROM species s
      LEFT JOIN proteins p ON p.species_id = s.id
      GROUP BY s.id
      ORDER BY proteinCount DESC, species ASC
      LIMIT 12
      `
    )
    .all() as SpeciesStatisticRow[];

  const topSpecies = speciesRows.map((row) => ({
    species: row.species?.trim() || "Unknown species",
    speciesCode: row.speciesCode ?? "Unknown",
    proteinCount: row.proteinCount,
    familyCount: row.familyCount,
  }));

  const proteinsWithProteinSequence = getCount(`
    SELECT COUNT(*) AS count
    FROM proteins
    WHERE protein_sequence IS NOT NULL
      AND TRIM(protein_sequence) != ''
  `);

  const proteinsWithProteinFasta = getCount(`
    SELECT COUNT(*) AS count
    FROM proteins
    WHERE prot_fasta IS NOT NULL
      AND TRIM(prot_fasta) != ''
  `);

  const proteinsWithCdsFasta = getCount(`
    SELECT COUNT(*) AS count
    FROM proteins
    WHERE cds_fasta IS NOT NULL
      AND TRIM(cds_fasta) != ''
  `);

  const proteinsWithProteinAccession = getCount(`
    SELECT COUNT(*) AS count
    FROM proteins
    WHERE protein_accession IS NOT NULL
      AND TRIM(protein_accession) != ''
  `);

  const proteinsWithCdsAccession = getCount(`
    SELECT COUNT(*) AS count
    FROM proteins
    WHERE cds_accession IS NOT NULL
      AND TRIM(cds_accession) != ''
  `);

  const sequenceAvailability = [
    {
      label: "Protein sequence",
      count: proteinsWithProteinSequence,
      percentage: percentage(proteinsWithProteinSequence, totalProteins),
    },
    {
      label: "Protein FASTA",
      count: proteinsWithProteinFasta,
      percentage: percentage(proteinsWithProteinFasta, totalProteins),
    },
    {
      label: "CDS FASTA",
      count: proteinsWithCdsFasta,
      percentage: percentage(proteinsWithCdsFasta, totalProteins),
    },
    {
      label: "Protein accession",
      count: proteinsWithProteinAccession,
      percentage: percentage(proteinsWithProteinAccession, totalProteins),
    },
    {
      label: "CDS accession",
      count: proteinsWithCdsAccession,
      percentage: percentage(proteinsWithCdsAccession, totalProteins),
    },
  ];

  return {
    totalProteins,
    totalSpecies,
    totalRepresentedFamilies,
    totalFamilyTerms,
    totalFunctionalEntries,
    totalLiteratureReferences,
    functionDefinedProteins,
    nonFunctionDefinedProteins,
    functionDefinedPercentage: percentage(functionDefinedProteins, totalProteins),
    familyDistribution,
    topSpecies,
    sequenceAvailability,
  };
}
