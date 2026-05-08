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
            placeholder="Search by species, species code, family, protein count, or average length..."
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
            Reset
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalSpecies.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Species represented</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalProteins.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Cuticular proteins</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalFamilies.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Protein families</p>
          </div>
        </div>
      </form>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {speciesSummaries.map((entry) => (
          <article
            key={`${entry.id}-${entry.species}`}
            className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#bfa98a] hover:shadow-md"
          >
            <div className="flex flex-col justify-between gap-5">
              <div>
                <h2 className="text-2xl font-semibold text-[#2a2118]">
                  <span className="italic">{entry.species}</span>
                </h2>

                <p className="mt-2 font-mono text-sm text-[#6a5d4d]">
                  {entry.speciesCode}
                </p>
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
                    {entry.familyCount.toLocaleString()}
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

                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.families.slice(0, 10).map((family) => (
                    <span
                      key={family}
                      className="rounded-full bg-[#8c3f2b]/10 px-3 py-1 text-xs font-semibold text-[#8c3f2b]"
                    >
                      {family}
                    </span>
                  ))}

                  {entry.families.length > 10 && (
                    <span className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-semibold text-[#6a5d4d]">
                      +{entry.families.length - 10} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/browse?species=${encodeURIComponent(entry.species)}`}
                  className="rounded-full bg-[#2a2118] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
                >
                  View proteins
                </Link>

                <Link
                  href={`/api/downloads/species/${entry.id}`}
                  className="rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
                >
                  Download FASTA
                </Link>
              </div>
            </div>
          </article>
        ))}

        {speciesSummaries.length === 0 && (
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-8 text-center shadow-sm md:col-span-2 xl:col-span-3">
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
