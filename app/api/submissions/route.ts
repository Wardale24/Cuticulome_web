type SubmissionPayload = {
  submitterName?: string;
  submitterEmail?: string;
  affiliation?: string;
  proteinName?: string;
  species?: string;
  accession?: string;
  proteinFamily?: string;
  sequence?: string;
  functionDescription?: string;
  reference?: string;
  doi?: string;
  notes?: string;
};

const requiredEnvironmentVariables = [
  "CUTICULOME_SUBMISSION_ENDPOINT",
  "CUTICULOME_FORM_FIELD_SUBMITTER_NAME",
  "CUTICULOME_FORM_FIELD_SUBMITTER_EMAIL",
  "CUTICULOME_FORM_FIELD_AFFILIATION",
  "CUTICULOME_FORM_FIELD_PROTEIN_NAME",
  "CUTICULOME_FORM_FIELD_SPECIES",
  "CUTICULOME_FORM_FIELD_ACCESSION",
  "CUTICULOME_FORM_FIELD_PROTEIN_FAMILY",
  "CUTICULOME_FORM_FIELD_SEQUENCE",
  "CUTICULOME_FORM_FIELD_FUNCTION",
  "CUTICULOME_FORM_FIELD_REFERENCE",
  "CUTICULOME_FORM_FIELD_DOI",
  "CUTICULOME_FORM_FIELD_NOTES",
];

function cleanText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function validateSubmission(payload: SubmissionPayload) {
  const submitterName = cleanText(payload.submitterName);
  const submitterEmail = cleanText(payload.submitterEmail);
  const proteinName = cleanText(payload.proteinName);
  const species = cleanText(payload.species);
  const sequence = cleanText(payload.sequence);

  if (!submitterName) {
    return "Please provide your name.";
  }

  if (!submitterEmail || !submitterEmail.includes("@")) {
    return "Please provide a valid email address.";
  }

  if (!proteinName) {
    return "Please provide a protein name.";
  }

  if (!species) {
    return "Please provide the species name.";
  }

  if (!sequence) {
    return "Please provide a protein sequence.";
  }

  const sequenceWithoutHeader = sequence
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith(">"))
    .join("")
    .replace(/\s+/g, "")
    .toUpperCase();

  if (sequenceWithoutHeader.length < 20) {
    return "The protein sequence looks very short. Please provide a full or meaningful amino acid sequence.";
  }

  const invalidCharacters = Array.from(
    new Set(sequenceWithoutHeader.split(""))
  )
    .filter((character) => !/^[ACDEFGHIKLMNPQRSTVWYXBZUO*.-]$/.test(character))
    .sort();

  if (invalidCharacters.length > 0) {
    return `Invalid character(s) found in sequence: ${invalidCharacters.join(
      ", "
    )}`;
  }

  return null;
}

function getMissingEnvironmentVariables() {
  return requiredEnvironmentVariables.filter(
    (variableName) => !process.env[variableName]
  );
}

function createSubmissionSummary(payload: SubmissionPayload) {
  return [
    `Submitter name: ${cleanText(payload.submitterName)}`,
    `Submitter email: ${cleanText(payload.submitterEmail)}`,
    `Affiliation: ${cleanText(payload.affiliation) || "Not provided"}`,
    "",
    `Protein name: ${cleanText(payload.proteinName)}`,
    `Species: ${cleanText(payload.species)}`,
    `Accession: ${cleanText(payload.accession) || "Not provided"}`,
    `Suggested family: ${cleanText(payload.proteinFamily) || "Not provided"}`,
    "",
    "Protein sequence:",
    cleanText(payload.sequence),
    "",
    "Function / evidence:",
    cleanText(payload.functionDescription) || "Not provided",
    "",
    `Reference: ${cleanText(payload.reference) || "Not provided"}`,
    `DOI / URL: ${cleanText(payload.doi) || "Not provided"}`,
    "",
    "Additional notes:",
    cleanText(payload.notes) || "Not provided",
  ].join("\n");
}

function buildGoogleFormsBody(payload: SubmissionPayload) {
  const body = new URLSearchParams();

  body.set(
    process.env.CUTICULOME_FORM_FIELD_SUBMITTER_NAME ?? "",
    cleanText(payload.submitterName)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_SUBMITTER_EMAIL ?? "",
    cleanText(payload.submitterEmail)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_AFFILIATION ?? "",
    cleanText(payload.affiliation)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_PROTEIN_NAME ?? "",
    cleanText(payload.proteinName)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_SPECIES ?? "",
    cleanText(payload.species)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_ACCESSION ?? "",
    cleanText(payload.accession)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_PROTEIN_FAMILY ?? "",
    cleanText(payload.proteinFamily)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_SEQUENCE ?? "",
    cleanText(payload.sequence)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_FUNCTION ?? "",
    cleanText(payload.functionDescription)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_REFERENCE ?? "",
    cleanText(payload.reference)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_DOI ?? "",
    cleanText(payload.doi)
  );
  body.set(
    process.env.CUTICULOME_FORM_FIELD_NOTES ?? "",
    cleanText(payload.notes)
  );

  return body;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmissionPayload;
    const validationError = validateSubmission(payload);

    if (validationError) {
      return Response.json(
        {
          error: validationError,
        },
        {
          status: 400,
        }
      );
    }

    const missingEnvironmentVariables = getMissingEnvironmentVariables();

    if (missingEnvironmentVariables.length > 0) {
      return Response.json(
        {
          error:
            "The submission form is not connected to a Google Form yet. The submission has not been sent.",
          configurationMissing: true,
          missingEnvironmentVariables,
          submissionSummary: createSubmissionSummary(payload),
        },
        {
          status: 501,
        }
      );
    }

    const googleFormEndpoint = process.env.CUTICULOME_SUBMISSION_ENDPOINT ?? "";
    const googleFormsBody = buildGoogleFormsBody(payload);

    const googleFormsResponse = await fetch(googleFormEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: googleFormsBody.toString(),
    });

    if (!googleFormsResponse.ok && googleFormsResponse.status < 300) {
      return Response.json(
        {
          error:
            "The submission could not be forwarded to the configured Google Form.",
        },
        {
          status: 502,
        }
      );
    }

    return Response.json(
      {
        message:
          "Submission received. Thank you — the Cuticulome.org team will review it before inclusion.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The submission could not be processed.";

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
