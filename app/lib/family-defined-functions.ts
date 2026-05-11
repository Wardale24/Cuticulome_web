import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type FamilyDefinedFunctionProtein = {
  id: number;
  standardizedName: string;
  accession: string;
  species: string;
  expressionDetails: string;
  functionDetails: string;
};

type SQLiteFamilyDefinedFunctionRow = {
  id: number;
  standardizedName: string | null;
  accession: string | null;
  genus: string | null;
  species: string | null;
  familyName: string | null;
  expressionDetails: string | null;
  functionDetails: string | null;
};

type InternalFamilyDefinedFunctionProtein = FamilyDefinedFunctionProtein & {
  hasBothDetails: boolean;
  hasAnyDetails: boolean;
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

function addCandidateIfAllowed({
  candidate,
  selected,
  selectedProteinIds,
  selectedSpecies,
  limitPerFamily,
  requireNewSpecies,
}: {
  candidate: InternalFamilyDefinedFunctionProtein;
  selected: FamilyDefinedFunctionProtein[];
  selectedProteinIds: Set<number>;
  selectedSpecies: Set<string>;
  limitPerFamily: number;
  requireNewSpecies: boolean;
}) {
  if (selected.length >= limitPerFamily) {
    return;
  }

  if (selectedProteinIds.has(candidate.id)) {
    return;
  }

  if (requireNewSpecies && selectedSpecies.has(candidate.species)) {
    return;
  }

  selected.push({
    id: candidate.id,
    standardizedName: candidate.standardizedName,
    accession: candidate.accession,
    species: candidate.species,
    expressionDetails: candidate.expressionDetails,
    functionDetails: candidate.functionDetails,
  });

  selectedProteinIds.add(candidate.id);
  selectedSpecies.add(candidate.species);
}

function selectRepresentativeProteins(
  candidates: InternalFamilyDefinedFunctionProtein[],
  limitPerFamily: number
) {
  const selected: FamilyDefinedFunctionProtein[] = [];
  const selectedProteinIds = new Set<number>();
  const selectedSpecies = new Set<string>();

  const candidatesWithBothDetails = candidates.filter(
    (candidate) => candidate.hasBothDetails
  );

  const candidatesWithPartialDetails = candidates.filter(
    (candidate) => !candidate.hasBothDetails && candidate.hasAnyDetails
  );

  const fallbackCandidates = candidates.filter(
    (candidate) => !candidate.hasAnyDetails
  );

  const selectionPasses = [
    {
      candidates: candidatesWithBothDetails,
      requireNewSpecies: true,
    },
    {
      candidates: candidatesWithBothDetails,
      requireNewSpecies: false,
    },
    {
      candidates: candidatesWithPartialDetails,
      requireNewSpecies: true,
    },
    {
      candidates: candidatesWithPartialDetails,
      requireNewSpecies: false,
    },
    {
      candidates: fallbackCandidates,
      requireNewSpecies: true,
    },
    {
      candidates: fallbackCandidates,
      requireNewSpecies: false,
    },
  ];

  for (const selectionPass of selectionPasses) {
    for (const candidate of selectionPass.candidates) {
      addCandidateIfAllowed({
        candidate,
        selected,
        selectedProteinIds,
        selectedSpecies,
        limitPerFamily,
        requireNewSpecies: selectionPass.requireNewSpecies,
      });
    }
  }

  return selected;
}

export function getDefinedFunctionProteinsByFamily(limitPerFamily = 4) {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      SELECT
        p.id AS id,
        p.standardized_name AS standardizedName,
        p.protein_accession AS accession,
        s.genus AS genus,
        s.species AS species,
        pf.name AS familyName,
        e.expression_details AS expressionDetails,
        e.function_details AS functionDetails
      FROM entries e
      INNER JOIN proteins p ON e.protein_id = p.id
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN protein_family pf ON p.protein_family_id = pf.id
      WHERE pf.name IS NOT NULL
        AND TRIM(pf.name) != ''
        AND LOWER(TRIM(pf.name)) != 'unassigned'
      ORDER BY pf.name ASC, RANDOM()
      `
    )
    .all() as SQLiteFamilyDefinedFunctionRow[];

  const candidatesByFamily = new Map<
    string,
    InternalFamilyDefinedFunctionProtein[]
  >();

  const seenProteinIdsByFamily = new Map<string, Set<number>>();

  for (const row of rows) {
    const familyName = normalizeText(row.familyName);

    if (!familyName) {
      continue;
    }

    if (!candidatesByFamily.has(familyName)) {
      candidatesByFamily.set(familyName, []);
      seenProteinIdsByFamily.set(familyName, new Set<number>());
    }

    const seenProteinIds = seenProteinIdsByFamily.get(familyName);

    if (!seenProteinIds || seenProteinIds.has(row.id)) {
      continue;
    }

    seenProteinIds.add(row.id);

    const expressionDetails = normalizeText(row.expressionDetails);
    const functionDetails = normalizeText(row.functionDetails);

    candidatesByFamily.get(familyName)?.push({
      id: row.id,
      standardizedName: normalizeText(row.standardizedName) || "Unnamed protein",
      accession: normalizeText(row.accession) || "No accession available",
      species: makeSpeciesName(row.genus, row.species) || "Unknown species",
      expressionDetails,
      functionDetails,
      hasBothDetails:
        expressionDetails.length > 0 && functionDetails.length > 0,
      hasAnyDetails:
        expressionDetails.length > 0 || functionDetails.length > 0,
    });
  }

  const selectedProteinsByFamily = new Map<
    string,
    FamilyDefinedFunctionProtein[]
  >();

  for (const [familyName, candidates] of candidatesByFamily.entries()) {
    selectedProteinsByFamily.set(
      familyName,
      selectRepresentativeProteins(candidates, limitPerFamily)
    );
  }

  return selectedProteinsByFamily;
}
