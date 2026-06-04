import { getProteinFasta } from "../../../../lib/cuticulome-db";
import { getProteinCdsFasta } from "../../../../lib/cds-downloads";

type ProteinDownloadRouteProps = {
  params: Promise<{
    proteinId: string;
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
  { params }: ProteinDownloadRouteProps
) {
  const resolvedParams = await params;
  const proteinId = Number(resolvedParams.proteinId);

  if (!Number.isInteger(proteinId) || proteinId < 1) {
    return new Response("Invalid protein ID.", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const downloadCds = isCdsRequest(request);
  const fasta = downloadCds
    ? getProteinCdsFasta(proteinId)
    : getProteinFasta(proteinId);

  if (fasta.recordCount === 0) {
    return new Response(
      downloadCds
        ? "No CDS sequence found for this record."
        : "No protein sequence found for this record.",
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
