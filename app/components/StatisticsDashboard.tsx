import { getDatabaseStatistics } from "../lib/statistics";

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[#2a2118]">
        {value}
      </p>
      {detail && <p className="mt-2 text-sm text-[#6a5d4d]">{detail}</p>}
    </div>
  );
}

export default function StatisticsDashboard() {
  const statistics = getDatabaseStatistics();

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Proteins"
          value={statistics.totalProteins.toLocaleString()}
          detail="Total protein records in Cuticulome.org"
        />

        <StatCard
          label="Species"
          value={statistics.totalSpecies.toLocaleString()}
          detail="Species represented in the database"
        />

        <StatCard
          label="Families"
          value={statistics.totalFamilyTerms.toLocaleString()}
          detail={`${statistics.totalFamilyTerms.toLocaleString()} cuticular-related families defined`}
        />

        <StatCard
          label="Function-defined"
          value={statistics.totalFunctionalEntries.toLocaleString()}
          detail="Proteins with defined functional annotations"
        />
      </section>

      <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
          Functional annotation coverage
        </p>

        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#2a2118]">
          Function-defined proteins
        </h2>

        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#6a5d4d]">
          This shows how many cuticular protein records present a defined
          function.
        </p>

        <div className="mt-6 rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
          <p className="text-5xl font-semibold text-[#2a2118]">
            {statistics.functionDefinedPercentage.toFixed(1)}%
          </p>
          <p className="mt-2 text-sm text-[#6a5d4d]">
            {statistics.functionDefinedProteins.toLocaleString()} of{" "}
            {statistics.totalProteins.toLocaleString()} proteins have defined
            function entries.
          </p>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#efe5d4]">
            <div
              className="h-full rounded-full bg-[#8c3f2b]"
              style={{
                width: `${Math.min(
                  statistics.functionDefinedPercentage,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
        <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
          <h2 className="text-xl font-semibold text-[#2a2118]">
            Top represented species
          </h2>
          <p className="mt-1 text-sm text-[#6a5d4d]">
            Species with the largest number of protein records.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead className="bg-[#eadfca] text-[#2a2118]">
              <tr>
                <th className="px-6 py-4 font-semibold">Species</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Proteins</th>
                <th className="px-6 py-4 font-semibold">Families</th>
              </tr>
            </thead>

            <tbody>
              {statistics.topSpecies.map((species) => (
                <tr
                  key={`${species.species}-${species.speciesCode}`}
                  className="border-t border-[#e5d9c6] bg-[#fffdf8]"
                >
                  <td className="px-6 py-4 text-[#2a2118]">
                    <span className="italic">{species.species}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#6a5d4d]">
                    {species.speciesCode}
                  </td>
                  <td className="px-6 py-4 text-[#2a2118]">
                    {species.proteinCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[#6a5d4d]">
                    {species.familyCount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
