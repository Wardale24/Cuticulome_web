import { getSpeciesFasta } from "../../../../lib/cuticulome-db";

type SpeciesDownloadRouteProps = {
  params: Promise<{
    speciesId: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: SpeciesDownloadRouteProps) {
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

  const fasta = getSpeciesFasta(speciesId);

  if (fasta.recordCount === 0) {
    return new Response("No protein sequences found for this species.", {
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
