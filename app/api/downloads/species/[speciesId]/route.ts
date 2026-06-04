import { getSpeciesFasta } from "../../../../lib/cuticulome-db";
import { getSpeciesCdsFasta } from "../../../../lib/cds-downloads";

type SpeciesDownloadRouteProps = {
  params: Promise<{
    speciesId: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isCdsRequest(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");

  return format === "cds" || format === "cds-fasta";
}

export async function GET(
  request: Request,
  { params }: SpeciesDownloadRouteProps
) {
  const resolvedParams = await params;
  const speciesId = Number(resolvedParams.speciesId);

  if (!Number.isInteger(speciesId) || speciesId < 1) {
    return new Response("Invalid species ID.", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const downloadCds = isCdsRequest(request);
  const fasta = downloadCds
    ? getSpeciesCdsFasta(speciesId)
    : getSpeciesFasta(speciesId);

  if (fasta.recordCount === 0) {
    return new Response(
      downloadCds
        ? "No CDS sequences found for this species."
        : "No protein sequences found for this species.",
      {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      }
    );
  }

  return new Response(fasta.content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fasta.fileName}"`,
    },
  });
}
