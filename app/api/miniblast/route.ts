import { runMiniBlast } from "../../lib/miniblast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
    };

    const query = body.query ?? "";

    const result = await runMiniBlast(query);

    return Response.json(result, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "miniBLAST failed unexpectedly.";

    return Response.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}
