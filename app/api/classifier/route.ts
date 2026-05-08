import { classifyCuticularProtein } from "../../lib/cuticular-classifier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function proxyClassifierToBackend(sequence: string) {
  const backendUrl = process.env.CUTICULOME_TOOLS_BACKEND_URL;

  if (!backendUrl) {
    return null;
  }

  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/classifier`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sequence,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      typeof payload.detail === "string"
        ? payload.detail
        : payload.error ?? "The classifier backend failed.";

    throw new Error(message);
  }

  return payload;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sequence?: string;
    };

    const sequence = body.sequence ?? "";
    const backendResult = await proxyClassifierToBackend(sequence);

    if (backendResult) {
      return Response.json(backendResult, {
        status: 200,
      });
    }

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
