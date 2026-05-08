import Link from "next/link";
import { getBrowseData } from "../lib/cuticulome-db";
import { getDatabaseStatistics } from "../lib/statistics";

const PAGE_SIZE = 100;

type BrowseDatabaseProps = {
  searchTerm: string;
  selectedFamily: string;
  selectedSpecies: string;
  currentPage: number;
};

function createPageHref({
  page,
  searchTerm,
  selectedFamily,
  selectedSpecies,
}: {
  page: number;
  searchTerm: string;
  selectedFamily: string;
  selectedSpecies: string;
}) {
  const params = new URLSearchParams();

  if (searchTerm.trim().length > 0) {
    params.set("q", searchTerm.trim());
  }

  if (selectedFamily !== "All families") {
    params.set("family", selectedFamily);
  }

  if (selectedSpecies !== "All species") {
    params.set("species", selectedSpecies);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString.length > 0 ? `/browse?${queryString}` : "/browse";
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);

  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export default function BrowseDatabase({
  searchTerm,
  selectedFamily,
  selectedSpecies,
  currentPage,
}: BrowseDatabaseProps) {
  const { records, families, species, totalRecords, totalFamilies } =
    getBrowseData({
      searchTerm,
      selectedFamily,
      selectedSpecies,
    });

  const statistics = getDatabaseStatistics();

  const filteredRecordCount = records.length;
  const totalPages = Math.max(Math.ceil(filteredRecordCount / PAGE_SIZE), 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedRecords = records.slice(startIndex, endIndex);
  const visiblePageNumbers = getVisiblePageNumbers(safeCurrentPage, totalPages);

  const firstShownRecord =
    filteredRecordCount === 0 ? 0 : startIndex + 1;

  const lastShownRecord = Math.min(endIndex, filteredRecordCount);

  return (
    <div className="space-y-8">
      <form
        action="/browse"
        method="get"
        className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm"
      >
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <label
              htmlFor="database-search"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Search database
            </label>
            <input
              id="database-search"
              name="q"
              type="text"
              defaultValue={searchTerm}
              placeholder="Search by name, accession, species, or family..."
              className="mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
            />
          </div>

          <div>
            <label
              htmlFor="family-filter"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Protein family
            </label>
            <select
              id="family-filter"
              name="family"
              defaultValue={selectedFamily}
              className="mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm text-[#2a2118] outline-none transition focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
            >
              {families.map((family) => (
                <option key={family} value={family}>
                  {family}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="species-filter"
              className="text-sm font-semibold text-[#2a2118]"
            >
              Species
            </label>
            <select
              id="species-filter"
              name="species"
              defaultValue={selectedSpecies}
              className="mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm text-[#2a2118] outline-none transition focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
            >
              {species.map((speciesName) => (
                <option key={speciesName} value={speciesName}>
                  {speciesName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
          >
            Apply filters
          </button>

          <Link
            href="/browse"
            className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
          >
            Reset filters
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {filteredRecordCount.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Filtered records</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalRecords.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Total proteins</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {statistics.functionDefinedProteins.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Function-defined</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalFamilies.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Protein families</p>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
        <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[#2a2118]">
                Protein records
              </h2>
              <p className="mt-1 text-sm text-[#6a5d4d]">
                Showing {firstShownRecord.toLocaleString()}–
                {lastShownRecord.toLocaleString()} of{" "}
                {filteredRecordCount.toLocaleString()} matching records.
              </p>
            </div>

            <Link
              href="/api/downloads/all"
              className="rounded-full border border-[#c8b89d] px-5 py-2 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
            >
              Download all FASTA
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-[#eadfca] text-[#2a2118]">
              <tr>
                <th className="px-6 py-4 font-semibold">Standardized name</th>
                <th className="px-6 py-4 font-semibold">Protein name</th>
                <th className="px-6 py-4 font-semibold">Accession</th>
                <th className="px-6 py-4 font-semibold">Species</th>
                <th className="px-6 py-4 font-semibold">Family</th>
                <th className="px-6 py-4 font-semibold">Length</th>
                <th className="px-6 py-4 font-semibold">Record</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRecords.map((record) => (
                <tr
                  key={`${record.id}-${record.accession}`}
                  className="border-t border-[#e5d9c6] bg-[#fffdf8] transition hover:bg-[#fff7ea]"
                >
                  <td className="px-6 py-4 font-semibold">
                    <Link
                      href={`/protein/${record.id}`}
                      className="text-[#8c3f2b] hover:underline"
                    >
                      {record.standardizedName}
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-[#2a2118]">
                    {record.proteinName}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-[#6a5d4d]">
                    {record.accession}
                  </td>

                  <td className="px-6 py-4">
                    <span className="italic text-[#2a2118]">
                      {record.species}
                    </span>
                    <span className="ml-2 rounded-full bg-[#efe5d4] px-2 py-1 text-xs font-semibold not-italic text-[#6a5d4d]">
                      {record.speciesCode}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-[#8c3f2b]/10 px-3 py-1 text-xs font-semibold text-[#8c3f2b]">
                      {record.family}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-[#6a5d4d]">
                    {record.length > 0 ? `${record.length} aa` : "Unknown"}
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      href={`/protein/${record.id}`}
                      className="rounded-full border border-[#c8b89d] px-4 py-2 text-xs font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedRecords.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-semibold text-[#2a2118]">
              No matching records found.
            </p>
            <p className="mt-2 text-sm text-[#6a5d4d]">
              Try changing the search term, family filter, or species filter.
            </p>
          </div>
        )}

        {filteredRecordCount > PAGE_SIZE && (
          <div className="border-t border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <p className="text-sm text-[#6a5d4d]">
                Page {safeCurrentPage.toLocaleString()} of{" "}
                {totalPages.toLocaleString()}
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={createPageHref({
                    page: Math.max(safeCurrentPage - 1, 1),
                    searchTerm,
                    selectedFamily,
                    selectedSpecies,
                  })}
                  className={
                    safeCurrentPage === 1
                      ? "pointer-events-none rounded-full border border-[#d8cbb7] px-4 py-2 text-sm font-semibold text-[#b8aa96] opacity-60"
                      : "rounded-full border border-[#c8b89d] px-4 py-2 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
                  }
                >
                  Previous
                </Link>

                {visiblePageNumbers.map((page, index) => {
                  const previousPage = visiblePageNumbers[index - 1];
                  const shouldShowEllipsis =
                    previousPage !== undefined && page - previousPage > 1;

                  return (
                    <span key={page} className="flex items-center gap-2">
                      {shouldShowEllipsis && (
                        <span className="px-1 text-sm text-[#6a5d4d]">…</span>
                      )}

                      <Link
                        href={createPageHref({
                          page,
                          searchTerm,
                          selectedFamily,
                          selectedSpecies,
                        })}
                        className={
                          page === safeCurrentPage
                            ? "rounded-full bg-[#2a2118] px-4 py-2 text-sm font-semibold text-white"
                            : "rounded-full border border-[#c8b89d] px-4 py-2 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
                        }
                      >
                        {page}
                      </Link>
                    </span>
                  );
                })}

                <Link
                  href={createPageHref({
                    page: Math.min(safeCurrentPage + 1, totalPages),
                    searchTerm,
                    selectedFamily,
                    selectedSpecies,
                  })}
                  className={
                    safeCurrentPage === totalPages
                      ? "pointer-events-none rounded-full border border-[#d8cbb7] px-4 py-2 text-sm font-semibold text-[#b8aa96] opacity-60"
                      : "rounded-full border border-[#c8b89d] px-4 py-2 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
                  }
                >
                  Next
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
