import { postprocessClassifierResult } from "../../lib/classifier-postprocess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBackendBaseUrl() {
  const backendUrl = process.env.CUTICULOME_TOOLS_BACKEND_URL?.trim();

  if (!backendUrl) {
    throw new Error(
      "CUTICULOME_TOOLS_BACKEND_URL is not set. Add it to .env.local and to the Vercel environment variables."
    );
  }

  return backendUrl.replace(/\/+$/, "");
}

function normalizeSequenceInput(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const sequence =
      normalizeSequenceInput(payload.sequence) ||
      normalizeSequenceInput(payload.query);

    if (!sequence) {
      return Response.json(
        {
          error: "Please paste a protein sequence before running the classifier.",
        },
        {
          status: 400,
        }
      );
    }

    const backendBaseUrl = getBackendBaseUrl();

    const backendResponse = await fetch(`${backendBaseUrl}/classifier`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sequence,
        query: sequence,
      }),
    });

    const backendPayload = await backendResponse.json();

    if (!backendResponse.ok) {
      return Response.json(
        {
          error:
            backendPayload.error ??
            backendPayload.detail ??
            "The classifier backend failed.",
        },
        {
          status: backendResponse.status,
        }
      );
    }

    const processedPayload = postprocessClassifierResult(backendPayload);

    return Response.json(processedPayload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The classifier failed.";

    return Response.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
