import DownloadsFilterForm from "./DownloadsFilterForm";
import {
  DownloadFilters,
  getDownloadFilterOptions,
  getFilteredDownloadSummary,
} from "../lib/download-filters";

type DownloadsBrowserProps = {
  filters: DownloadFilters;
};

function createDownloadHref(
  filters: DownloadFilters,
  format: "protein-fasta" | "cds-fasta" | "csv"
) {
  const params = new URLSearchParams();

  if (filters.query.trim().length > 0) {
    params.set("q", filters.query.trim());
  }

  if (filters.taxonomicClass.trim().length > 0) {
    params.set("class", filters.taxonomicClass.trim());
  }

  if (filters.speciesId.trim().length > 0) {
    params.set("speciesId", filters.speciesId.trim());
  }

  if (filters.family.trim().length > 0) {
    params.set("family", filters.family.trim());
  }

  if (filters.functionStatus !== "all") {
    params.set("functionStatus", filters.functionStatus);
  }

  if (filters.functionQuery.trim().length > 0) {
    params.set("functionQuery", filters.functionQuery.trim());
  }

  params.set("format", format);

  return `/api/downloads/custom?${params.toString()}`;
}

function hasActiveFilters(filters: DownloadFilters) {
  return (
    filters.query.trim().length > 0 ||
    filters.taxonomicClass.trim().length > 0 ||
    filters.speciesId.trim().length > 0 ||
    filters.family.trim().length > 0 ||
    filters.functionStatus !== "all" ||
    filters.functionQuery.trim().length > 0
  );
}

const primaryButtonClass =
  "inline-flex w-full whitespace-nowrap rounded-full bg-[#2a2118] px-4 py-3 text-center text-xs font-semibold text-white hover:bg-[#453729] sm:w-auto sm:min-w-[12rem] sm:justify-center";

const secondaryButtonClass =
  "inline-flex w-full whitespace-nowrap rounded-full border border-[#c8b89d] px-4 py-3 text-center text-xs font-semibold text-[#2a2118] hover:bg-[#efe5d4] sm:w-auto sm:min-w-[12rem] sm:justify-center";

export default function DownloadsBrowser({ filters }: DownloadsBrowserProps) {
  const options = getDownloadFilterOptions();
  const summary = getFilteredDownloadSummary(filters);
  const activeFilters = hasActiveFilters(filters);
  const hasMatchingRecords = summary.matchingRecords > 0;
  const hasProteinSequences = summary.proteinSequenceCount > 0;
  const hasCdsSequences = summary.cdsSequenceCount > 0;

  return (
    <div className="space-y-8">
      <DownloadsFilterForm
        filters={filters}
        options={options}
        activeFilters={activeFilters}
      />

      <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Matching dataset
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2a2118]">
              {summary.matchingRecords.toLocaleString()} proteins
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6a5d4d]">
              This filtered dataset contains{" "}
              {summary.speciesCount.toLocaleString()} species,{" "}
              {summary.familyCount.toLocaleString()} protein families, and{" "}
              {summary.functionDefinedCount.toLocaleString()} proteins with
              defined functional annotations. Protein FASTA is available for{" "}
              {summary.proteinSequenceCount.toLocaleString()} records and CDS
              FASTA is available for {summary.cdsSequenceCount.toLocaleString()}{" "}
              records.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col lg:items-stretch xl:flex-row xl:flex-nowrap">
            {hasProteinSequences && (
              <a
                href={createDownloadHref(filters, "protein-fasta")}
                className={primaryButtonClass}
              >
                Download Protein FASTA
              </a>
            )}

            {hasCdsSequences && (
              <a
                href={createDownloadHref(filters, "cds-fasta")}
                className={secondaryButtonClass}
              >
                Download CDS FASTA
              </a>
            )}

            {hasMatchingRecords && (
              <a
                href={createDownloadHref(filters, "csv")}
                className={secondaryButtonClass}
              >
                Download CSV
              </a>
            )}

            {!hasMatchingRecords && (
              <span className="inline-flex w-full whitespace-nowrap rounded-full border border-[#d8cbb7] px-4 py-3 text-center text-xs font-semibold text-[#9a8b78] sm:w-auto sm:min-w-[12rem] sm:justify-center">
                No records to download
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6">
          <h3 className="text-lg font-semibold text-[#2a2118]">
            Taxonomy-focused downloads
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#6a5d4d]">
            Use class and species filters to build datasets for one taxonomic
            group, then combine them with protein family or function filters.
          </p>
        </div>

        <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6">
          <h3 className="text-lg font-semibold text-[#2a2118]">
            Function-focused downloads
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#6a5d4d]">
            Select function-defined proteins only, or search function and
            expression text to extract proteins associated with specific
            tissues, timings, structures, or biological roles.
          </p>
        </div>

        <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6">
          <h3 className="text-lg font-semibold text-[#2a2118]">
            Format choice
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#6a5d4d]">
            Download Protein FASTA or CDS FASTA for downstream sequence
            analysis. CSV is available for metadata inspection, filtering in
            spreadsheets, and dataset documentation.
          </p>
        </div>
      </section>
    </div>
  );
}
