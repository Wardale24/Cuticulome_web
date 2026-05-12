"use client";

import { useMemo, useState } from "react";

type SubmissionPayload = {
  submitterName: string;
  submitterEmail: string;
  proteinName: string;
  species: string;
  proteinFamily: string;
  sequence: string;
  cdsSequence: string;
  tissueSpecificity: string;
  functionDescription: string;
  reference: string;
  doi: string;
  website: string;
};

type SubmissionResponse = {
  message?: string;
  error?: string;
};

const initialSubmission: SubmissionPayload = {
  submitterName: "",
  submitterEmail: "",
  proteinName: "",
  species: "",
  proteinFamily: "",
  sequence: "",
  cdsSequence: "",
  tissueSpecificity: "",
  functionDescription: "",
  reference: "",
  doi: "",
  website: "",
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
  maxLength,
}: {
  id: keyof SubmissionPayload;
  value: string;
  onChange: (field: keyof SubmissionPayload, value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
}) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      required={required}
      maxLength={maxLength}
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
  maxLength,
}: {
  id: keyof SubmissionPayload;
  value: string;
  onChange: (field: keyof SubmissionPayload, value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  mono?: boolean;
  maxLength?: number;
}) {
  return (
    <textarea
      id={id}
      name={id}
      value={value}
      required={required}
      rows={rows}
      maxLength={maxLength}
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

  const completedRequiredFields = useMemo(() => {
    const requiredFields = [
      submission.submitterName,
      submission.submitterEmail,
      submission.proteinName,
      submission.species,
      submission.sequence,
      submission.functionDescription,
    ];

    return requiredFields.filter((value) => value.trim().length > 0).length;
  }, [submission]);

  function updateField(field: keyof SubmissionPayload, value: string) {
    setSubmission((currentSubmission) => ({
      ...currentSubmission,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

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
        throw new Error(
          payload.error ??
            "The submission could not be sent right now. Please try again later or contact the Cuticulome.org team."
        );
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
          : "The submission could not be sent right now. Please try again later or contact the Cuticulome.org team.";

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
              {completedRequiredFields}/6
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
            review. Submissions are saved through a Google Form and reviewed
            before inclusion in Cuticulome.org.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8"
      >
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            value={submission.website}
            tabIndex={-1}
            autoComplete="off"
            onChange={(event) => updateField("website", event.target.value)}
          />
        </div>

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
                maxLength={120}
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
                maxLength={254}
                placeholder="your.email@example.com"
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
                maxLength={200}
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
                maxLength={200}
                placeholder="Example: Drosophila melanogaster"
                onChange={updateField}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="proteinFamily">
                Suggested protein family
              </FieldLabel>
              <TextInput
                id="proteinFamily"
                value={submission.proteinFamily}
                maxLength={120}
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
                maxLength={20000}
                placeholder={">protein_name\nMKKLLVVAAALVAAQASA..."}
                onChange={updateField}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="cdsSequence">CDS sequence</FieldLabel>
              <TextArea
                id="cdsSequence"
                value={submission.cdsSequence}
                mono
                rows={8}
                maxLength={60000}
                placeholder={">protein_name_cds\nATGGCCAAG..."}
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
              <FieldLabel htmlFor="functionDescription" required>
                Function / evidence
              </FieldLabel>
              <TextArea
                id="functionDescription"
                value={submission.functionDescription}
                required
                rows={5}
                maxLength={5000}
                placeholder="Describe the experimentally validated or inferred function, phenotype, expression evidence, or other support."
                onChange={updateField}
              />
            </div>

            <div>
              <FieldLabel htmlFor="tissueSpecificity">
                Tissue specificity
              </FieldLabel>
              <TextInput
                id="tissueSpecificity"
                value={submission.tissueSpecificity}
                maxLength={500}
                placeholder="Example: epidermis, wing disc, leg cuticle, whole body"
                onChange={updateField}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="reference">Reference</FieldLabel>
                <TextInput
                  id="reference"
                  value={submission.reference}
                  maxLength={1000}
                  placeholder="Author et al., year, title, journal"
                  onChange={updateField}
                />
              </div>

              <div>
                <FieldLabel htmlFor="doi">DOI / URL</FieldLabel>
                <TextInput
                  id="doi"
                  value={submission.doi}
                  maxLength={500}
                  placeholder="https://doi.org/... or publication URL"
                  onChange={updateField}
                />
              </div>
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
        </section>
      )}
    </div>
  );
}
