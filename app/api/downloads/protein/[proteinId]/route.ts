import { getProteinFasta } from "../../../../lib/cuticulome-db";

type ProteinDownloadRouteProps = {
  params: Promise<{
    proteinId: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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

  const fasta = getProteinFasta(proteinId);

  if (fasta.recordCount === 0) {
    return new Response("No protein sequence found for this record.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(fasta.content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fasta.fileName}"`,
    },
  });
}
