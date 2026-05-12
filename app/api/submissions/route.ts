type SubmissionPayload = {
  submitterName?: string;
  submitterEmail?: string;
  proteinName?: string;
  species?: string;
  proteinFamily?: string;
  sequence?: string;
  cdsSequence?: string;
  tissueSpecificity?: string;
  functionDescription?: string;
  reference?: string;
  doi?: string;
  website?: string;
};

const SUCCESS_MESSAGE =
  "Submission received. Thank you — the Cuticulome.org team will review it before inclusion.";

const GENERIC_SUBMISSION_ERROR =
  "The submission could not be sent right now. Please try again later or contact the Cuticulome.org team.";

const requiredEnvironmentVariables = [
  "CUTICULOME_SUBMISSION_ENDPOINT",
  "CUTICULOME_FORM_FIELD_PROTEIN_NAME",
  "CUTICULOME_FORM_FIELD_SPECIES",
  "CUTICULOME_FORM_FIELD_PROTEIN_FAMILY",
  "CUTICULOME_FORM_FIELD_FUNCTION",
  "CUTICULOME_FORM_FIELD_TISSUE_SPECIFICITY",
  "CUTICULOME_FORM_FIELD_SEQUENCE",
  "CUTICULOME_FORM_FIELD_CDS_SEQUENCE",
  "CUTICULOME_FORM_FIELD_REFERENCE",
  "CUTICULOME_FORM_FIELD_DOI",
  "CUTICULOME_FORM_FIELD_SUBMITTER_NAME",
  "CUTICULOME_FORM_FIELD_SUBMITTER_EMAIL",
];

const fieldLengthLimits: Array<{
  field: keyof SubmissionPayload;
  label: string;
  maxLength: number;
}> = [
  {
    field: "submitterName",
    label: "Name",
    maxLength: 120,
  },
  {
    field: "submitterEmail",
    label: "Email",
    maxLength: 254,
  },
  {
    field: "proteinName",
    label: "Protein name",
    maxLength: 200,
  },
  {
    field: "species",
    label: "Species",
    maxLength: 200,
  },
  {
    field: "proteinFamily",
    label: "Protein family",
    maxLength: 120,
  },
  {
    field: "tissueSpecificity",
    label: "Tissue specificity",
    maxLength: 500,
  },
  {
    field: "functionDescription",
    label: "Function / evidence",
    maxLength: 5000,
  },
  {
    field: "sequence",
    label: "Protein sequence",
    maxLength: 20000,
  },
  {
    field: "cdsSequence",
    label: "CDS sequence",
    maxLength: 60000,
  },
  {
    field: "reference",
    label: "Reference",
    maxLength: 1000,
  },
  {
    field: "doi",
    label: "DOI / URL",
    maxLength: 500,
  },
];

function cleanText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function removeFastaHeaders(sequence: string) {
  return sequence
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith(">"))
    .join("")
    .replace(/\s+/g, "")
    .toUpperCase();
}

function validateSubmission(payload: SubmissionPayload) {
  const submitterName = cleanText(payload.submitterName);
  const submitterEmail = cleanText(payload.submitterEmail);
  const proteinName = cleanText(payload.proteinName);
  const species = cleanText(payload.species);
  const sequence = cleanText(payload.sequence);
  const functionDescription = cleanText(payload.functionDescription);

  if (
    !submitterName ||
    !submitterEmail ||
    !proteinName ||
    !species ||
    !sequence ||
    !functionDescription
  ) {
    return "Please complete all required fields before submitting.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
    return "Please enter a valid email address.";
  }

  for (const limit of fieldLengthLimits) {
    const value = cleanText(payload[limit.field]);

    if (value.length > limit.maxLength) {
      return `${limit.label} is too long. Please shorten it and try again.`;
    }
  }

  const proteinSequenceWithoutHeader = removeFastaHeaders(sequence);

  if (proteinSequenceWithoutHeader.length < 20) {
    return "The protein sequence looks very short. Please provide a full or meaningful amino acid sequence.";
  }

  if (!/^[ACDEFGHIKLMNPQRSTVWYXBZUO*.-]+$/.test(proteinSequenceWithoutHeader)) {
    return "Please check the protein sequence. It should contain amino acid characters only.";
  }

  const cdsSequence = cleanText(payload.cdsSequence);

  if (cdsSequence) {
    const cdsSequenceWithoutHeader = removeFastaHeaders(cdsSequence);

    if (
      cdsSequenceWithoutHeader.length > 0 &&
      !/^[ACGTUNRYSWKMBDHV.-]+$/.test(cdsSequenceWithoutHeader)
    ) {
      return "Please check the CDS sequence. It should contain nucleotide characters only.";
    }
  }

  return null;
}

function getEnvironmentVariable(variableName: string) {
  return cleanText(process.env[variableName]);
}

function getMissingEnvironmentVariables() {
  return requiredEnvironmentVariables.filter(
    (variableName) => !getEnvironmentVariable(variableName)
  );
}

function getGoogleFormEndpoint() {
  const configuredEndpoint = getEnvironmentVariable(
    "CUTICULOME_SUBMISSION_ENDPOINT"
  );

  return configuredEndpoint
    .replace("/viewform", "/formResponse")
    .replace(/\?.*$/, "");
}

function addGoogleFormField(
  body: URLSearchParams,
  environmentVariableName: string,
  value: string
) {
  const fieldId = getEnvironmentVariable(environmentVariableName);

  if (!fieldId) {
    return;
  }

  body.set(fieldId, value);
}

function buildGoogleFormsBody(payload: SubmissionPayload) {
  const body = new URLSearchParams();

  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_PROTEIN_NAME",
    cleanText(payload.proteinName)
  );
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_SPECIES",
    cleanText(payload.species)
  );
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_PROTEIN_FAMILY",
    cleanText(payload.proteinFamily)
  );
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_FUNCTION",
    cleanText(payload.functionDescription)
  );
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_TISSUE_SPECIFICITY",
    cleanText(payload.tissueSpecificity)
  );
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_SEQUENCE",
    cleanText(payload.sequence)
  );
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_CDS_SEQUENCE",
    cleanText(payload.cdsSequence)
  );
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_REFERENCE",
    cleanText(payload.reference)
  );
  addGoogleFormField(body, "CUTICULOME_FORM_FIELD_DOI", cleanText(payload.doi));
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_SUBMITTER_NAME",
    cleanText(payload.submitterName)
  );
  addGoogleFormField(
    body,
    "CUTICULOME_FORM_FIELD_SUBMITTER_EMAIL",
    cleanText(payload.submitterEmail)
  );

  return body;
}

async function sendToGoogleForm(payload: SubmissionPayload) {
  const googleFormEndpoint = getGoogleFormEndpoint();
  const googleFormsBody = buildGoogleFormsBody(payload);

  if (!googleFormEndpoint.includes("/formResponse")) {
    throw new Error("Invalid Google Form endpoint.");
  }

  const googleFormsResponse = await fetch(googleFormEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: googleFormsBody.toString(),
    redirect: "follow",
  });

  if (!googleFormsResponse.ok) {
    throw new Error("Google Form submission failed.");
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmissionPayload;

    if (cleanText(payload.website)) {
      return Response.json(
        {
          message: SUCCESS_MESSAGE,
        },
        {
          status: 200,
        }
      );
    }

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
      console.error("Submission form configuration is incomplete.", {
        missingEnvironmentVariables,
      });

      return Response.json(
        {
          error: GENERIC_SUBMISSION_ERROR,
        },
        {
          status: 503,
        }
      );
    }

    await sendToGoogleForm(payload);

    return Response.json(
      {
        message: SUCCESS_MESSAGE,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Submission error:", error);

    return Response.json(
      {
        error: GENERIC_SUBMISSION_ERROR,
      },
      {
        status: 500,
      }
    );
  }
}
