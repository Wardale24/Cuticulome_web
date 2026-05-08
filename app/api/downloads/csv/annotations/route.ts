import { getFunctionalAnnotationsCsv } from "../../../../lib/csv-exports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const csv = getFunctionalAnnotationsCsv();

  return new Response(csv.content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csv.fileName}"`,
    },
  });
}
