import {
  buildFilteredCdsFasta,
  buildFilteredCsv,
  buildFilteredFasta,
  DownloadFilters,
  getFilteredDownloadRecords,
} from "../../../lib/download-filters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFiltersFromUrl(url: URL): DownloadFilters {
  const functionStatus = url.searchParams.get("functionStatus");

  return {
    query: url.searchParams.get("q") ?? "",
    taxonomicClass: url.searchParams.get("class") ?? "",
    speciesId: url.searchParams.get("speciesId") ?? "",
    family: url.searchParams.get("family") ?? "",
    functionStatus:
      functionStatus === "defined" || functionStatus === "lacking"
        ? functionStatus
        : "all",
    functionQuery: url.searchParams.get("functionQuery") ?? "",
  };
}

type DownloadFormat = "protein-fasta" | "cds-fasta" | "csv";

function getDownloadFormat(url: URL): DownloadFormat {
  const format = url.searchParams.get("format");

  if (format === "csv") {
    return "csv";
  }

  if (format === "cds-fasta" || format === "cds") {
    return "cds-fasta";
  }

  return "protein-fasta";
}

function makeFileName(format: DownloadFormat) {
  const date = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    return `cuticulome_filtered_download_${date}.csv`;
  }

  if (format === "cds-fasta") {
    return `cuticulome_filtered_cds_${date}.fasta`;
  }

  return `cuticulome_filtered_proteins_${date}.fasta`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = getDownloadFormat(url);
  const filters = getFiltersFromUrl(url);
  const records = getFilteredDownloadRecords(filters);

  const content =
    format === "csv"
      ? buildFilteredCsv(records)
      : format === "cds-fasta"
      ? buildFilteredCdsFasta(records)
      : buildFilteredFasta(records);

  const contentType =
    format === "csv" ? "text/csv; charset=utf-8" : "text/plain; charset=utf-8";

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${makeFileName(format)}"`,
    },
  });
}
