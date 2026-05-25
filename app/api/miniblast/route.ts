import { runMiniBlast } from "../../lib/miniblast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_MINIBLAST_HITS = 30;

type MiniBlastBackendResult = {
  queryLength?: number;
  databaseProteinCount?: number;
  hitCount?: number;
  hits?: unknown[];
  [key: string]: unknown;
};

function capMiniBlastResult(result: MiniBlastBackendResult) {
  const hits = Array.isArray(result.hits)
    ? result.hits.slice(0, MAX_MINIBLAST_HITS)
    : [];

  return {
    ...result,
    hitCount: hits.length,
    hits,
  };
}

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
      maxResults: MAX_MINIBLAST_HITS,
      max_hits: MAX_MINIBLAST_HITS,
      limit: MAX_MINIBLAST_HITS,
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

  return capMiniBlastResult(payload as MiniBlastBackendResult);
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
