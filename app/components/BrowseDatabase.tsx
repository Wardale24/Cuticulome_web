import Link from "next/link";
import { getBrowseData } from "../lib/cuticulome-db";

type BrowseDatabaseProps = {
  searchTerm: string;
  selectedFamily: string;
  selectedSpecies: string;
};

export default function BrowseDatabase({
  searchTerm,
  selectedFamily,
  selectedSpecies,
}: BrowseDatabaseProps) {
  const { records, families, species, totalRecords, totalFamilies, totalSpecies } =
    getBrowseData({
      searchTerm,
      selectedFamily,
      selectedSpecies,
    });

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
              placeholder="Search by name, accession, species, family, or length..."
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
              {records.length}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Displayed records</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalRecords}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Total proteins</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalFamilies}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Families detected</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalSpecies}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Species represented</p>
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
                Results are loaded directly from cuticulome.db.
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
              {records.map((record) => (
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

        {records.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-semibold text-[#2a2118]">
              No matching records found.
            </p>
            <p className="mt-2 text-sm text-[#6a5d4d]">
              Try changing the search term, family filter, or species filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
