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
            placeholder="Search by family, species, protein name, accession, or species code..."
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

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalFamilies.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Protein families</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalProteins.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Cuticular proteins</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalSpecies.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Species represented</p>
          </div>
        </div>
      </form>

      <section className="grid gap-5">
        {familySummaries.map((family) => (
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
                href={`/api/downloads/family?family=${encodeURIComponent(
                  family.family
                )}`}
                className="rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Download FASTA
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

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#e5d9c6] bg-[#fffaf1] p-5">
                <p className="text-sm font-semibold text-[#2a2118]">
                  Represented species
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {family.species.slice(0, 16).map((speciesName) => (
                    <span
                      key={speciesName}
                      className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-semibold text-[#6a5d4d]"
                    >
                      <span className="italic">{speciesName}</span>
                    </span>
                  ))}

                  {family.species.length > 16 && (
                    <span className="rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-semibold text-[#6a5d4d]">
                      +{family.species.length - 16} more
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#e5d9c6] bg-[#fffaf1] p-5">
                <p className="text-sm font-semibold text-[#2a2118]">
                  Example proteins
                </p>

                <div className="mt-3 space-y-3">
                  {family.exampleProteins.map((protein) => (
                    <div
                      key={protein.id}
                      className="flex flex-col justify-between gap-2 rounded-xl border border-[#e5d9c6] bg-white p-3 sm:flex-row sm:items-center"
                    >
                      <div>
                        <Link
                          href={`/protein/${protein.id}`}
                          className="font-semibold text-[#8c3f2b] hover:underline"
                        >
                          {protein.standardizedName}
                        </Link>
                        <p className="mt-1 text-xs text-[#6a5d4d]">
                          <span className="italic">{protein.species}</span>{" "}
                          · {protein.speciesCode}
                        </p>
                      </div>

                      <p className="font-mono text-xs text-[#6a5d4d]">
                        {protein.accession}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}

        {familySummaries.length === 0 && (
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
