import Link from "next/link";
import { getFamiliesData } from "../lib/cuticulome-db";

type FamiliesBrowserProps = {
  searchTerm: string;
};

export default function FamiliesBrowser({ searchTerm }: FamiliesBrowserProps) {
  const { familySummaries, totalFamilies, totalProteins, totalSpecies } =
    getFamiliesData(searchTerm);

  return (
    <div className="space-y-8">
      <form
        action="/families"
        method="get"
        className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm"
      >
        <div className="grid gap-5 lg:grid-cols-[1.5fr_auto] lg:items-end">
          <div>
            <label
              htmlFor="family-search"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Search protein families
            </label>
            <input
              id="family-search"
              name="q"
              type="text"
              defaultValue={searchTerm}
              placeholder="Search by family, species, accession, or example protein..."
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
              href="/families"
              className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
            >
              Reset
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {familySummaries.length}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Displayed families</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalFamilies}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Total families</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalProteins}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Total proteins</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalSpecies}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Species represented</p>
          </div>
        </div>
      </form>

      <div className="grid gap-5 lg:grid-cols-2">
        {familySummaries.map((entry) => (
          <article
            key={entry.family}
            className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#bfa98a] hover:shadow-md"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
                  Protein family
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#2a2118]">
                  {entry.family}
                </h2>
              </div>

              <Link
                href={`/api/downloads/family?family=${encodeURIComponent(
                  entry.family
                )}`}
                className="rounded-full border border-[#c8b89d] px-5 py-2 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Download FASTA
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
                <p className="text-2xl font-semibold text-[#2a2118]">
                  {entry.proteinCount}
                </p>
                <p className="mt-1 text-xs text-[#6a5d4d]">Proteins</p>
              </div>

              <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
                <p className="text-2xl font-semibold text-[#2a2118]">
                  {entry.speciesCount}
                </p>
                <p className="mt-1 text-xs text-[#6a5d4d]">Species</p>
              </div>

              <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
                <p className="text-2xl font-semibold text-[#2a2118]">
                  {entry.averageLength > 0 ? entry.averageLength : "—"}
                </p>
                <p className="mt-1 text-xs text-[#6a5d4d]">
                  Avg. length / aa
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#2a2118]">
                Species represented
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {entry.species.slice(0, 8).map((speciesName) => (
                  <span
                    key={speciesName}
                    className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-semibold text-[#6a5d4d]"
                  >
                    <span className="italic">{speciesName}</span>
                  </span>
                ))}

                {entry.species.length > 8 && (
                  <span className="rounded-full bg-[#8c3f2b]/10 px-3 py-1 text-xs font-semibold text-[#8c3f2b]">
                    +{entry.species.length - 8} more
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#2a2118]">
                Example proteins
              </h3>

              <div className="mt-3 overflow-hidden rounded-2xl border border-[#e5d9c6]">
                {entry.exampleProteins.map((protein) => (
                  <Link
                    href={`/protein/${protein.id}`}
                    key={`${protein.id}-${protein.accession}`}
                    className="block border-b border-[#e5d9c6] bg-white px-4 py-3 last:border-b-0 hover:bg-[#fff7ea]"
                  >
                    <p className="text-sm font-semibold text-[#8c3f2b]">
                      {protein.standardizedName}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#6a5d4d]">
                      <span className="font-mono">{protein.accession}</span>
                      {" · "}
                      <span className="italic">{protein.species}</span>
                      {" · "}
                      {protein.speciesCode}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/browse?family=${encodeURIComponent(entry.family)}`}
                className="rounded-full bg-[#2a2118] px-5 py-2 text-center text-sm font-semibold text-white hover:bg-[#453729]"
              >
                View proteins
              </Link>

              <Link
                href="/downloads"
                className="rounded-full border border-[#c8b89d] px-5 py-2 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                View downloads
              </Link>
            </div>
          </article>
        ))}
      </div>

      {familySummaries.length === 0 && (
        <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#2a2118]">
            No matching families found.
          </p>
          <p className="mt-2 text-sm text-[#6a5d4d]">
            Try changing the search term.
          </p>
        </div>
      )}
    </div>
  );
}
