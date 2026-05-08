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

function BarRow({
  label,
  count,
  percentage,
}: {
  label: string;
  count: number;
  percentage: number;
}) {
  return (
    <div className="border-b border-[#e5d9c6] px-5 py-4 last:border-b-0">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <p className="font-semibold text-[#2a2118]">{label}</p>
        <p className="text-sm text-[#6a5d4d]">
          {count.toLocaleString()} · {percentage.toFixed(1)}%
        </p>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#efe5d4]">
        <div
          className="h-full rounded-full bg-[#8c3f2b]"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function StatisticsDashboard() {
  const statistics = getDatabaseStatistics();

  const topFamilies = statistics.familyDistribution.slice(0, 12);

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
          value={statistics.totalRepresentedFamilies.toLocaleString()}
          detail={`${statistics.totalFamilyTerms.toLocaleString()} family terms defined`}
        />

        <StatCard
          label="Functional entries"
          value={statistics.totalFunctionalEntries.toLocaleString()}
          detail="Curated functional annotation entries"
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Functional annotation coverage
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#2a2118]">
            Function-defined proteins
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#6a5d4d]">
            This shows how many protein records are associated with at least one
            curated entry in the functional annotation table.
          </p>

          <div className="mt-6 rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-5xl font-semibold text-[#2a2118]">
              {statistics.functionDefinedPercentage.toFixed(1)}%
            </p>
            <p className="mt-2 text-sm text-[#6a5d4d]">
              {statistics.functionDefinedProteins.toLocaleString()} of{" "}
              {statistics.totalProteins.toLocaleString()} proteins have
              function-defined entries.
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

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e5d9c6] bg-white p-5">
              <p className="text-3xl font-semibold text-[#2a2118]">
                {statistics.functionDefinedProteins.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-[#6a5d4d]">
                Function-defined proteins
              </p>
            </div>

            <div className="rounded-2xl border border-[#e5d9c6] bg-white p-5">
              <p className="text-3xl font-semibold text-[#2a2118]">
                {statistics.nonFunctionDefinedProteins.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-[#6a5d4d]">
                Proteins without curated function entries
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
          <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
            <h2 className="text-xl font-semibold text-[#2a2118]">
              Sequence and accession availability
            </h2>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              Availability is calculated across all protein records.
            </p>
          </div>

          <div>
            {statistics.sequenceAvailability.map((item) => (
              <BarRow
                key={item.label}
                label={item.label}
                count={item.count}
                percentage={item.percentage}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
          <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
            <h2 className="text-xl font-semibold text-[#2a2118]">
              Protein family distribution
            </h2>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              Top represented protein families by protein count.
            </p>
          </div>

          <div>
            {topFamilies.map((family) => (
              <BarRow
                key={family.label}
                label={family.label}
                count={family.count}
                percentage={family.percentage}
              />
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
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
        </div>
      </section>

      <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
          Notes
        </p>

        <p className="mt-3 text-sm leading-7 text-[#6a5d4d]">
          Statistics are generated directly from the local Cuticulome.org SQLite
          database. Family counts use curated protein-family assignments stored
          in the database, and function-defined coverage is based on whether a
          protein has one or more entries in the curated functional annotation
          table.
        </p>
      </section>
    </div>
  );
}
