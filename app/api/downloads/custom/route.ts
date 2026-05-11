import {
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
    genus: url.searchParams.get("genus") ?? "",
    speciesId: url.searchParams.get("speciesId") ?? "",
    family: url.searchParams.get("family") ?? "",
    functionStatus:
      functionStatus === "defined" || functionStatus === "lacking"
        ? functionStatus
        : "all",
    functionQuery: url.searchParams.get("functionQuery") ?? "",
  };
}

function makeFileName(format: "fasta" | "csv") {
  const date = new Date().toISOString().slice(0, 10);
  const extension = format === "fasta" ? "fasta" : "csv";

  return `cuticulome_filtered_download_${date}.${extension}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "fasta";
  const filters = getFiltersFromUrl(url);
  const records = getFilteredDownloadRecords(filters);

  const content =
    format === "csv" ? buildFilteredCsv(records) : buildFilteredFasta(records);

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
