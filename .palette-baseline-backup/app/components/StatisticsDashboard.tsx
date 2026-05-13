import {
  getDatabaseStatistics,
  type PublicationYearStatistic,
  type SpeciesStatistic,
} from "../lib/statistics";

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

function SpeciesProteinPlot({
  speciesStatistics,
}: {
  speciesStatistics: SpeciesStatistic[];
}) {
  const maximumProteinCount = Math.max(
    ...speciesStatistics.map((species) => species.proteinCount),
    1
  );

  const middleTick = Math.round(maximumProteinCount / 2);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
      <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
        <h2 className="text-xl font-semibold text-[#2a2118]">
          Identified cuticular proteins by species
        </h2>
      </div>

      <div className="overflow-x-auto px-4 py-6 md:px-6">
        <div className="min-w-[1040px]">
          <div className="grid grid-cols-[32px_56px_1fr] gap-4">
            <div className="flex h-72 items-center justify-center">
              <p className="-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] text-[#6a5d4d]">
                Number of cuticular proteins
              </p>
            </div>

            <div className="relative h-72 text-xs font-semibold text-[#6a5d4d]">
              <span className="absolute right-0 top-0">
                {maximumProteinCount}
              </span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2">
                {middleTick}
              </span>
              <span className="absolute bottom-0 right-0">0</span>
            </div>

            <div>
              <div className="relative h-72 border-b border-l border-[#c8b89d]">
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#e5d9c6]" />

                <div className="absolute inset-0 flex items-end gap-10 px-7">
                  {speciesStatistics.map((species) => {
                    const pointHeight = Math.max(
                      (species.proteinCount / maximumProteinCount) * 100,
                      species.proteinCount > 0 ? 4 : 0
                    );

                    return (
                      <div
                        key={`${species.species}-${species.speciesCode}-protein-point`}
                        className="flex h-full min-w-[120px] flex-1 flex-col items-center justify-end"
                      >
                        <p className="mb-2 text-xs font-semibold text-[#2a2118]">
                          {species.proteinCount.toLocaleString()}
                        </p>

                        <div
                          className="relative w-full"
                          style={{ height: `${pointHeight}%` }}
                          aria-label={`${species.species}: ${species.proteinCount.toLocaleString()} cuticular proteins and ${species.familyCount.toLocaleString()} protein families`}
                        >
                          <div className="absolute bottom-0 left-1/2 h-full w-px -translate-x-1/2 bg-[#c8b89d]" />
                          <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#fffdf8] bg-[#8c3f2b] shadow-sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex gap-10 px-7">
                {speciesStatistics.map((species) => (
                  <div
                    key={`${species.species}-${species.speciesCode}-protein-label`}
                    className="min-w-[120px] flex-1 text-center"
                  >
                    <p className="font-mono text-xs font-semibold text-[#2a2118]">
                      {species.speciesCode}
                    </p>
                    <p
                      title={species.species}
                      className="mt-1 min-h-[2.25rem] break-words text-xs italic leading-4 text-[#6a5d4d]"
                    >
                      {species.species}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold leading-4 text-[#8c3f2b]">
                      {species.familyCount.toLocaleString()} protein families
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicationsTimelineChart({
  publicationsByYear,
}: {
  publicationsByYear: PublicationYearStatistic[];
}) {
  const maximumPublicationCount = Math.max(
    ...publicationsByYear.map((year) => year.publicationCount),
    1
  );

  const middleTick = Math.round(maximumPublicationCount / 2);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
      <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
        <h2 className="text-xl font-semibold text-[#2a2118]">
          Cuticular protein publications in arthropods
        </h2>
      </div>

      <div className="overflow-x-auto px-4 py-6 md:px-6">
        <div className="min-w-[1120px]">
          <div className="grid grid-cols-[32px_56px_1fr] gap-4">
            <div className="flex h-72 items-center justify-center">
              <p className="-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] text-[#6a5d4d]">
                Number of publications
              </p>
            </div>

            <div className="relative h-72 text-xs font-semibold text-[#6a5d4d]">
              <span className="absolute right-0 top-0">
                {maximumPublicationCount}
              </span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2">
                {middleTick}
              </span>
              <span className="absolute bottom-0 right-0">0</span>
            </div>

            <div>
              <div className="relative h-72 border-b border-l border-[#c8b89d]">
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#e5d9c6]" />

                <div className="absolute inset-0 flex items-end gap-3 px-4">
                  {publicationsByYear.map((yearStatistic) => {
                    const barHeight =
                      yearStatistic.publicationCount === 0
                        ? 0
                        : Math.max(
                            (yearStatistic.publicationCount /
                              maximumPublicationCount) *
                              100,
                            4
                          );

                    return (
                      <div
                        key={yearStatistic.year}
                        className="flex h-full min-w-[38px] flex-1 flex-col items-center justify-end"
                      >
                        <p className="mb-2 text-[10px] font-semibold text-[#2a2118]">
                          {yearStatistic.publicationCount.toLocaleString()}
                        </p>

                        <div
                          className="w-5 rounded-t-full bg-[#8c3f2b]"
                          style={{ height: `${barHeight}%` }}
                          aria-label={`${yearStatistic.year}: ${yearStatistic.publicationCount.toLocaleString()} publications`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex gap-3 px-4">
                {publicationsByYear.map((yearStatistic) => (
                  <div
                    key={`${yearStatistic.year}-label`}
                    className="min-w-[38px] flex-1 text-center"
                  >
                    <p className="rotate-45 whitespace-nowrap text-left text-[10px] font-semibold text-[#6a5d4d]">
                      {yearStatistic.year}
                    </p>
                  </div>
                ))}
              </div>

              <div className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StatisticsDashboard() {
  const statistics = getDatabaseStatistics();

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cuticular proteins"
          value={statistics.totalProteins.toLocaleString()}
          detail="Total cuticular protein records in Cuticulome.org"
        />

        <StatCard
          label="Species"
          value={statistics.totalSpecies.toLocaleString()}
          detail="Species represented by at least one protein record"
        />

        <StatCard
          label="Protein families"
          value={statistics.totalRepresentedFamilies.toLocaleString()}
          detail="Protein families represented by at least one protein record"
        />

        <StatCard
          label="Function-defined"
          value={statistics.functionDefinedProteins.toLocaleString()}
          detail="Cuticular proteins with defined functional annotations"
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
            {statistics.totalProteins.toLocaleString()} cuticular proteins are
            function-defined.
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

      <SpeciesProteinPlot speciesStatistics={statistics.topSpecies} />

      <PublicationsTimelineChart
        publicationsByYear={statistics.publicationsByYear}
      />
    </div>
  );
}
