import Link from "next/link";
import { getSpeciesData } from "../lib/cuticulome-db";

type SpeciesBrowserProps = {
  searchTerm: string;
};

export default function SpeciesBrowser({ searchTerm }: SpeciesBrowserProps) {
  const { speciesSummaries, totalSpecies, totalProteins, totalFamilies } =
    getSpeciesData(searchTerm);

  return (
    <div className="space-y-8">
      <form
        action="/species"
        method="get"
        className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm"
      >
        <div className="grid gap-5 lg:grid-cols-[1.5fr_auto] lg:items-end">
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
              placeholder="Search by species, species code, family, or protein count..."
              className="mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
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
              Reset
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {speciesSummaries.length}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Displayed species</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalSpecies}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Total species</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalProteins}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Total proteins</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalFamilies}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Detected families</p>
          </div>
        </div>
      </form>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {speciesSummaries.map((entry) => (
          <article
            key={`${entry.id}-${entry.species}`}
            className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#bfa98a] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#2a2118]">
                  <span className="italic">{entry.species}</span>
                </h2>
                <p className="mt-2 text-sm text-[#6a5d4d]">
                  Species code:{" "}
                  <span className="font-mono text-xs font-semibold text-[#8c3f2b]">
                    {entry.speciesCode}
                  </span>
                </p>
              </div>

              <span className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-semibold text-[#6a5d4d]">
                {entry.proteinCount} proteins
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
                <p className="text-2xl font-semibold text-[#2a2118]">
                  {entry.familyCount}
                </p>
                <p className="mt-1 text-xs text-[#6a5d4d]">Families</p>
              </div>

              <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
                <p className="text-2xl font-semibold text-[#2a2118]">
                  {entry.averageLength > 0 ? `${entry.averageLength}` : "—"}
                </p>
                <p className="mt-1 text-xs text-[#6a5d4d]">
                  Avg. length / aa
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {entry.families.slice(0, 8).map((family) => (
                <span
                  key={family}
                  className="rounded-full bg-[#8c3f2b]/10 px-3 py-1 text-xs font-semibold text-[#8c3f2b]"
                >
                  {family}
                </span>
              ))}

              {entry.families.length > 8 && (
                <span className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-semibold text-[#6a5d4d]">
                  +{entry.families.length - 8} more
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/browse?species=${encodeURIComponent(entry.species)}`}
                className="rounded-full bg-[#2a2118] px-5 py-2 text-center text-sm font-semibold text-white hover:bg-[#453729]"
              >
                View proteins
              </Link>

              <Link
                href={`/api/downloads/species/${entry.id}`}
                className="rounded-full border border-[#c8b89d] px-5 py-2 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Download FASTA
              </Link>
            </div>
          </article>
        ))}
      </div>

      {speciesSummaries.length === 0 && (
        <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#2a2118]">
            No matching species found.
          </p>
          <p className="mt-2 text-sm text-[#6a5d4d]">
            Try changing the search term.
          </p>
        </div>
      )}
    </div>
  );
}
