"use client";

import { useMemo, useState } from "react";

type SubmissionPayload = {
  submitterName: string;
  submitterEmail: string;
  affiliation: string;
  proteinName: string;
  species: string;
  accession: string;
  proteinFamily: string;
  sequence: string;
  functionDescription: string;
  reference: string;
  doi: string;
  notes: string;
};

type SubmissionResponse = {
  message?: string;
  error?: string;
  configurationMissing?: boolean;
  missingEnvironmentVariables?: string[];
  submissionSummary?: string;
};

const initialSubmission: SubmissionPayload = {
  submitterName: "",
  submitterEmail: "",
  affiliation: "",
  proteinName: "",
  species: "",
  accession: "",
  proteinFamily: "",
  sequence: "",
  functionDescription: "",
  reference: "",
  doi: "",
  notes: "",
};

function FieldLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-[#2a2118]">
      {children}
      {required && <span className="text-[#8c3f2b]"> *</span>}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  id: keyof SubmissionPayload;
  value: string;
  onChange: (field: keyof SubmissionPayload, value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(event) => onChange(id, event.target.value)}
      className="mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
    />
  );
}

function TextArea({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 5,
  mono = false,
}: {
  id: keyof SubmissionPayload;
  value: string;
  onChange: (field: keyof SubmissionPayload, value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <textarea
      id={id}
      name={id}
      value={value}
      required={required}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(id, event.target.value)}
      className={`mt-2 w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 text-sm leading-6 text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20 ${
        mono ? "font-mono" : ""
      }`}
    />
  );
}

export default function SubmissionForm() {
  const [submission, setSubmission] =
    useState<SubmissionPayload>(initialSubmission);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [configurationSummary, setConfigurationSummary] = useState("");

  const completedRequiredFields = useMemo(() => {
    const requiredFields = [
      submission.submitterName,
      submission.submitterEmail,
      submission.proteinName,
      submission.species,
      submission.sequence,
    ];

    return requiredFields.filter((value) => value.trim().length > 0).length;
  }, [submission]);

  function updateField(field: keyof SubmissionPayload, value: string) {
    setSubmission((currentSubmission) => ({
      ...currentSubmission,
      [field]: value,
    }));
  }

  function copySubmissionSummary() {
    if (!configurationSummary) {
      return;
    }

    navigator.clipboard.writeText(configurationSummary);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");
    setConfigurationSummary("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });

      const payload = (await response.json()) as SubmissionResponse;

      if (!response.ok) {
        if (payload.configurationMissing && payload.submissionSummary) {
          setConfigurationSummary(payload.submissionSummary);
        }

        throw new Error(payload.error ?? "The submission could not be sent.");
      }

      setSuccessMessage(
        payload.message ??
          "Submission received. Thank you — the Cuticulome.org team will review it before inclusion."
      );
      setSubmission(initialSubmission);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The submission could not be sent.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {completedRequiredFields}/5
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              Required fields completed
            </p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">1</p>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              Protein per submission
            </p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">Review</p>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              Curator approval required
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-5">
          <p className="text-sm leading-7 text-[#6a5d4d]">
            Use this form to submit a single protein annotation for curator
            review. For large batches of proteins, new species-level datasets,
            or extensive functional annotations, please contact the
            Cuticulome.org team directly rather than submitting entries one by
            one.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8"
      >
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Submitter information
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="submitterName" required>
                Name
              </FieldLabel>
              <TextInput
                id="submitterName"
                value={submission.submitterName}
                required
                placeholder="Your name"
                onChange={updateField}
              />
            </div>

            <div>
              <FieldLabel htmlFor="submitterEmail" required>
                Email
              </FieldLabel>
              <TextInput
                id="submitterEmail"
                value={submission.submitterEmail}
                required
                type="email"
                placeholder="your.email@example.com"
                onChange={updateField}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="affiliation">Affiliation</FieldLabel>
              <TextInput
                id="affiliation"
                value={submission.affiliation}
                placeholder="Institution, laboratory, or organization"
                onChange={updateField}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[#e5d9c6] pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Protein information
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="proteinName" required>
                Protein name
              </FieldLabel>
              <TextInput
                id="proteinName"
                value={submission.proteinName}
                required
                placeholder="Example: CPR1, CPAP3-A, Tweedle-like protein"
                onChange={updateField}
              />
            </div>

            <div>
              <FieldLabel htmlFor="species" required>
                Species
              </FieldLabel>
              <TextInput
                id="species"
                value={submission.species}
                required
                placeholder="Example: Drosophila melanogaster"
                onChange={updateField}
              />
            </div>

            <div>
              <FieldLabel htmlFor="accession">Protein accession</FieldLabel>
              <TextInput
                id="accession"
                value={submission.accession}
                placeholder="NCBI / UniProt / other accession"
                onChange={updateField}
              />
            </div>

            <div>
              <FieldLabel htmlFor="proteinFamily">
                Suggested protein family
              </FieldLabel>
              <TextInput
                id="proteinFamily"
                value={submission.proteinFamily}
                placeholder="Example: CPR RR-2, CPAP3, CPF, Tweedle"
                onChange={updateField}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="sequence" required>
                Protein sequence
              </FieldLabel>
              <TextArea
                id="sequence"
                value={submission.sequence}
                required
                mono
                rows={10}
                placeholder={">protein_name\nMKKLLVVAAALVAAQASA..."}
                onChange={updateField}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[#e5d9c6] pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Functional evidence and source
          </p>

          <div className="mt-5 grid gap-5">
            <div>
              <FieldLabel htmlFor="functionDescription">
                Function / evidence
              </FieldLabel>
              <TextArea
                id="functionDescription"
                value={submission.functionDescription}
                rows={5}
                placeholder="Describe the experimentally validated or inferred function, tissue specificity, phenotype, expression evidence, or other support."
                onChange={updateField}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="reference">Reference</FieldLabel>
                <TextInput
                  id="reference"
                  value={submission.reference}
                  placeholder="Author et al., year, title, journal"
                  onChange={updateField}
                />
              </div>

              <div>
                <FieldLabel htmlFor="doi">DOI / URL</FieldLabel>
                <TextInput
                  id="doi"
                  value={submission.doi}
                  placeholder="https://doi.org/... or publication URL"
                  onChange={updateField}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="notes">Additional notes</FieldLabel>
              <TextArea
                id="notes"
                value={submission.notes}
                rows={4}
                placeholder="Alternative names, special nomenclature notes, batch-submission context, or anything curators should know."
                onChange={updateField}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[#e5d9c6] pt-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit for review"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setSubmission(initialSubmission);
                setSuccessMessage("");
                setErrorMessage("");
                setConfigurationSummary("");
              }}
              className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear form
            </button>
          </div>
        </section>
      </form>

      {successMessage && (
        <section className="rounded-3xl border border-[#b8cfaa] bg-[#f1f8ed] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#486338]">
            Submission received
          </p>
          <p className="mt-2 text-sm leading-7 text-[#486338]">
            {successMessage}
          </p>
        </section>
      )}

      {errorMessage && (
        <section className="rounded-3xl border border-[#c48a7a] bg-[#fff1ed] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#8c3f2b]">
            Submission not sent
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#6a2f24]">
            {errorMessage}
          </p>

          {configurationSummary && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-[#6a2f24]">
                Your completed submission summary
              </p>
              <p className="mt-1 text-sm leading-7 text-[#6a2f24]">
                The form content is shown below so it can be copied while the
                submission backend is being configured.
              </p>

              <pre className="mt-3 max-h-[420px] overflow-auto rounded-2xl border border-[#c48a7a] bg-white p-4 text-xs leading-6 text-[#2a2118]">
                {configurationSummary}
              </pre>

              <button
                type="button"
                onClick={copySubmissionSummary}
                className="mt-4 rounded-full border border-[#c48a7a] px-5 py-2 text-sm font-semibold text-[#6a2f24] hover:bg-[#ffe4dc]"
              >
                Copy submission summary
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
