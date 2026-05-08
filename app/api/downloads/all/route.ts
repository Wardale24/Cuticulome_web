import { getAllFasta } from "../../../lib/cuticulome-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const fasta = getAllFasta();

  return new Response(fasta.content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fasta.fileName}"`,
    },
  });
}
