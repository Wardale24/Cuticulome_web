import { getFamilyFasta } from "../../../lib/cuticulome-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const family = url.searchParams.get("family") ?? "";

  if (family.trim().length === 0) {
    return new Response("Missing family query parameter.", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const fasta = getFamilyFasta(family);

  if (fasta.recordCount === 0) {
    return new Response("No protein sequences found for this family.", {
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
