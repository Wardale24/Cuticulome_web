import Link from "next/link";
import { getFamiliesData } from "../lib/cuticulome-db";
import {
  FamilyDefinedFunctionProtein,
  getDefinedFunctionProteinsByFamily,
} from "../lib/family-defined-functions";

type FamiliesBrowserProps = {
  searchTerm: string;
};

type FamilySummary = ReturnType<typeof getFamiliesData>["familySummaries"][number];

const preferredFamilyOrder = [
  "CPR",
  "CPR RR-1",
  "CPR RR-2",
  "His-Rich CPR RR-2",
  "CPR RR-3",
  "CPAP",
  "CPAP-1",
  "CPAP-3",
  "Tweedle",
  "CPT",
  "CPG",
  "CPH",
  "CPF",
  "CPFL",
  "CPLCA",
  "CPLCG",
  "CPLCP",
  "CPLCW",
  "CPCFC",
  "Engineered CP",
  "Low complexity",
  "Non-canonical CP",
  "Chitinase",
  "Chitinase - group I",
  "Chitinase - group II",
  "Chitinase - group III",
  "Chitinase - group IV",
  "Chitin deacetylase - group I",
  "Yellow",
  "ABC Transporter",
  "Enzyme",
];

function normalizeFamilyForOrdering(family: string) {
  return family.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const preferredFamilyOrderMap = new Map(
  preferredFamilyOrder.map((family, index) => [
    normalizeFamilyForOrdering(family),
    index,
  ])
);

function compareFamiliesForDisplay(a: FamilySummary, b: FamilySummary) {
  const aPreferredIndex = preferredFamilyOrderMap.get(
    normalizeFamilyForOrdering(a.family)
  );
  const bPreferredIndex = preferredFamilyOrderMap.get(
    normalizeFamilyForOrdering(b.family)
  );

  if (aPreferredIndex !== undefined && bPreferredIndex !== undefined) {
    return aPreferredIndex - bPreferredIndex;
  }

  if (aPreferredIndex !== undefined) {
    return -1;
  }

  if (bPreferredIndex !== undefined) {
    return 1;
  }

  if (b.proteinCount !== a.proteinCount) {
    return b.proteinCount - a.proteinCount;
  }

  return a.family.localeCompare(b.family);
}

function isUnassignedFamily(family: string) {
  return family.trim().toLowerCase() === "unassigned";
}

function displayDetail(value: string) {
  return value.trim().length > 0 ? value : "-";
}

function familyMatchesSearch({
  family,
  searchTerm,
  definedFunctionProteins,
}: {
  family: ReturnType<typeof getFamiliesData>["familySummaries"][number];
  searchTerm: string;
  definedFunctionProteins: FamilyDefinedFunctionProtein[];
}) {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  if (!normalizedSearchTerm) {
    return true;
  }

  const searchableText = [
    family.family,
    family.proteinCount,
    family.speciesCount,
    family.averageLength,
    family.species.join(" "),
    family.exampleProteins
      .map((protein) =>
        [
          protein.standardizedName,
          protein.accession,
          protein.species,
          protein.speciesCode,
        ].join(" ")
      )
      .join(" "),
    definedFunctionProteins
      .map((protein) =>
        [
          protein.standardizedName,
          protein.accession,
          protein.species,
          protein.expressionDetails,
          protein.functionDetails,
        ].join(" ")
      )
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedSearchTerm);
}

export default function FamiliesBrowser({ searchTerm }: FamiliesBrowserProps) {
  const { familySummaries } = getFamiliesData("");
  const definedFunctionProteinsByFamily = getDefinedFunctionProteinsByFamily(4);

  const allVisibleFamilySummaries = familySummaries
    .filter((family) => !isUnassignedFamily(family.family))
    .sort(compareFamiliesForDisplay);

  const visibleFamilySummaries = allVisibleFamilySummaries.filter((family) =>
    familyMatchesSearch({
      family,
      searchTerm,
      definedFunctionProteins:
        definedFunctionProteinsByFamily.get(family.family) ?? [],
    })
  );

  return (
    <div className="space-y-8">
      <form
        action="/families"
        method="get"
        className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="family-search"
            className="text-sm font-semibold text-[#2a2118]"
          >
            Search families
          </label>

          <input
            id="family-search"
            name="q"
            type="text"
            defaultValue={searchTerm}
            placeholder="Search by family, species, function-defined protein, accession, or species code..."
            className="mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
          >
            Search
          </button>

          <Link
            href="/families"
            className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
          >
            Reset
          </Link>
        </div>
      </form>

      <section className="grid gap-5">
        {visibleFamilySummaries.map((family) => {
          const definedFunctionProteins =
            definedFunctionProteinsByFamily.get(family.family) ?? [];

          return (
            <article
              key={family.family}
              className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-[#2a2118]">
                    {family.family}
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6a5d4d]">
                    {family.proteinCount.toLocaleString()} proteins across{" "}
                    {family.speciesCount.toLocaleString()} species. Average
                    sequence length:{" "}
                    {family.averageLength > 0
                      ? `${family.averageLength.toLocaleString()} aa`
                      : "unknown"}
                    .
                  </p>
                </div>

                <Link
                  href={`/browse?family=${encodeURIComponent(family.family)}`}
                  className="rounded-full bg-[#2a2118] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
                >
                  View proteins
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                    Proteins
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[#2a2118]">
                    {family.proteinCount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                    Species
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[#2a2118]">
                    {family.speciesCount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                    Average length
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[#2a2118]">
                    {family.averageLength > 0
                      ? `${family.averageLength.toLocaleString()} aa`
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#e5d9c6] bg-[#fffaf1] p-5">
                <p className="text-sm font-semibold text-[#2a2118]">
                  Cuticular proteins with defined functions
                </p>

                {definedFunctionProteins.length > 0 ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {definedFunctionProteins.map((protein) => (
                      <div
                        key={`${family.family}-${protein.id}`}
                        className="rounded-2xl border border-[#e5d9c6] bg-white p-4"
                      >
                        <Link
                          href={`/protein/${protein.id}`}
                          className="font-semibold text-[#8c3f2b] hover:underline"
                        >
                          {protein.standardizedName}
                        </Link>

                        <p className="mt-2 text-sm text-[#6a5d4d]">
                          <span className="italic">{protein.species}</span>
                        </p>

                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
                              Expression timing
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#6a5d4d]">
                              {displayDetail(protein.expressionDetails)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
                              Defined function
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#6a5d4d]">
                              {displayDetail(protein.functionDetails)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-[#6a5d4d]">
                    No function-defined proteins are currently linked to this
                    family.
                  </p>
                )}
              </div>
            </article>
          );
        })}

        {visibleFamilySummaries.length === 0 && (
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#2a2118]">
              No matching protein families found.
            </p>
            <p className="mt-2 text-sm text-[#6a5d4d]">
              Try changing the search term.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
