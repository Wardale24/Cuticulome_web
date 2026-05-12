import Link from "next/link";
import { getSpeciesData } from "../lib/cuticulome-db";

type SpeciesBrowserProps = {
  searchTerm: string;
};

type CharacterizationReference = {
  label: string;
  url: string;
};

const characterizationReferencesBySpecies: Record<
  string,
  CharacterizationReference[]
> = {
  "Anopheles gambiae": [
    {
      label: "Cornman et al. 2008",
      url: "https://doi.org/10.1186/1471-2164-9-22",
    },
    {
      label: "Zhou et al. 2016",
      url: "https://doi.org/10.1016/j.ibmb.2016.05.001",
    },
    {
      label: "Zhou et al. 2017",
      url: "https://doi.org/10.1002/ps.4649",
    },
  ],
  "Acyrthosiphon pisum": [
    {
      label: "Guschinskaya et al. 2020",
      url: "https://doi.org/10.1016/j.isci.2020.100828",
    },
  ],
  "Bombyx mori": [
    {
      label: "Yan et al. 2022",
      url: "https://doi.org/10.3390/ijms23095155",
    },
  ],
  "Cryptolestes ferrugineus": [
    {
      label: "Tang et al. 2023",
      url: "https://doi.org/10.1016/j.pestbp.2023.105491",
    },
  ],
  "Daphnia magna": [
    {
      label: "Otte et al. 2024",
      url: "https://doi.org/10.1002/pmic.202300292",
    },
  ],
  "Drosophila melanogaster": [
    {
      label: "Cornman 2009",
      url: "https://doi.org/10.1371/journal.pone.0008345",
    },
  ],
  "Drosophila ananassae": [
    {
      label: "Cornman 2009",
      url: "https://doi.org/10.1371/journal.pone.0008345",
    },
  ],
  "Drosophila pseudoobscura": [
    {
      label: "Cornman 2009",
      url: "https://doi.org/10.1371/journal.pone.0008345",
    },
  ],
  "Drosophila pseudobscura": [
    {
      label: "Cornman 2009",
      url: "https://doi.org/10.1371/journal.pone.0008345",
    },
  ],
  "Drosophila willistoni": [
    {
      label: "Cornman 2009",
      url: "https://doi.org/10.1371/journal.pone.0008345",
    },
  ],
  "Drosophila mojavensis": [
    {
      label: "Cornman 2009",
      url: "https://doi.org/10.1371/journal.pone.0008345",
    },
  ],
  "Drosophila virilis": [
    {
      label: "Cornman 2009",
      url: "https://doi.org/10.1371/journal.pone.0008345",
    },
  ],
  "Drosophila grimshawi": [
    {
      label: "Cornman 2009",
      url: "https://doi.org/10.1371/journal.pone.0008345",
    },
  ],
  "Frankliniella occidentalis": [
    {
      label: "Zheng et al. 2024",
      url: "https://doi.org/10.1002/arch.22102",
    },
  ],
  "Locusta migratoria": [
    {
      label: "Zhao et al. 2017",
      url: "https://doi.org/10.1038/srep45462",
    },
  ],
};

function isUnassignedFamily(family: string) {
  return family.trim().toLowerCase() === "unassigned";
}

function getCharacterizationReferences(species: string) {
  return characterizationReferencesBySpecies[species] ?? [];
}

function CharacterizationReferenceButton({
  references,
}: {
  references: CharacterizationReference[];
}) {
  if (references.length === 0) {
    return null;
  }

  if (references.length === 1) {
    const reference = references[0];

    return (
      <a
        href={reference.url}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
      >
        Reference
      </a>
    );
  }

  return (
    <details className="group relative">
      <summary className="list-none rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4] [&::-webkit-details-marker]:hidden">
        <span className="cursor-pointer select-none">Reference</span>
      </summary>

      <div className="z-10 mt-2 min-w-[18rem] rounded-2xl border border-[#d8cbb7] bg-[#fffdf8] p-3 shadow-md sm:absolute">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
          References
        </p>

        <div className="flex flex-col gap-1">
          {references.map((reference) => (
            <a
              key={`${reference.label}-${reference.url}`}
              href={reference.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
            >
              {reference.label}
            </a>
          ))}
        </div>
      </div>
    </details>
  );
}

export default function SpeciesBrowser({ searchTerm }: SpeciesBrowserProps) {
  const { speciesSummaries } = getSpeciesData(searchTerm);

  const sortedSpeciesSummaries = [...speciesSummaries].sort((a, b) => {
    if (b.proteinCount !== a.proteinCount) {
      return b.proteinCount - a.proteinCount;
    }

    return a.species.localeCompare(b.species);
  });

  return (
    <div className="space-y-8">
      <form
        action="/species"
        method="get"
        className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="species-search"
            className="text-sm font-semibold text-[#2a2118]"
          >
            Search species
          </label>
          <input
            id="species-search"
            name="q"
            type="text"
            defaultValue={searchTerm}
            placeholder="Search by species, family, protein count, or average length..."
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
            href="/species"
            className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
          >
            Clear
          </Link>
        </div>
      </form>

      <section className="grid items-stretch gap-5 md:grid-cols-2">
        {sortedSpeciesSummaries.map((entry) => {
          const assignedFamilies = entry.families.filter(
            (family) => !isUnassignedFamily(family)
          );
          const characterizationReferences = getCharacterizationReferences(
            entry.species
          );

          return (
            <article
              key={`${entry.id}-${entry.species}`}
              className="flex h-full flex-col rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#bfa98a] hover:shadow-md"
            >
              <div className="flex flex-1 flex-col gap-5">
                <div>
                  <h2 className="text-2xl font-semibold text-[#2a2118]">
                    <span className="italic">{entry.species}</span>
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
                      Proteins
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[#2a2118]">
                      {entry.proteinCount.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
                      Families
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[#2a2118]">
                      {assignedFamilies.length.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
                      Avg. length
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[#2a2118]">
                      {entry.averageLength > 0
                        ? `${entry.averageLength.toLocaleString()} aa`
                        : "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#2a2118]">
                    Protein families
                  </p>

                  {assignedFamilies.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assignedFamilies.slice(0, 10).map((family) => (
                        <span
                          key={family}
                          className="rounded-full bg-[#8c3f2b]/10 px-3 py-1 text-xs font-semibold text-[#8c3f2b]"
                        >
                          {family}
                        </span>
                      ))}

                      {assignedFamilies.length > 10 && (
                        <span className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-semibold text-[#6a5d4d]">
                          +{assignedFamilies.length - 10} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-[#6a5d4d]">
                      No assigned protein families.
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href={`/browse?species=${encodeURIComponent(
                      entry.species
                    )}`}
                    className="rounded-full bg-[#2a2118] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
                  >
                    View proteins
                  </Link>

                  <CharacterizationReferenceButton
                    references={characterizationReferences}
                  />

                  <Link
                    href={`/api/downloads/species/${entry.id}`}
                    className="rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
                  >
                    Download FASTA
                  </Link>
                </div>
              </div>
            </article>
          );
        })}

        {sortedSpeciesSummaries.length === 0 && (
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-8 text-center shadow-sm md:col-span-2">
            <p className="text-sm font-semibold text-[#2a2118]">
              No matching species found.
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
