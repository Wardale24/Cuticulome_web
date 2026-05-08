import { runMiniBlast } from "../../lib/miniblast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function proxyMiniBlastToBackend(query: string) {
  const backendUrl = process.env.CUTICULOME_TOOLS_BACKEND_URL;

  if (!backendUrl) {
    return null;
  }

  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/miniblast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      typeof payload.detail === "string"
        ? payload.detail
        : payload.error ?? "miniBLAST backend failed.";

    throw new Error(message);
  }

  return payload;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
    };

    const query = body.query ?? "";
    const backendResult = await proxyMiniBlastToBackend(query);

    if (backendResult) {
      return Response.json(backendResult, {
        status: 200,
      });
    }

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
