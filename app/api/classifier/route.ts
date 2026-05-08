import { classifyCuticularProtein } from "../../lib/cuticular-classifier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sequence?: string;
    };

    const sequence = body.sequence ?? "";
    const result = await classifyCuticularProtein(sequence);

    return Response.json(result, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The classifier failed unexpectedly.";

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
