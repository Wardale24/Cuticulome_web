import Link from "next/link";
import { notFound } from "next/navigation";
import SitePage from "../../components/SitePage";
import {
  FunctionalEntry,
  LiteratureReference,
  getProteinPageData,
  wrapSequence,
} from "../../lib/cuticulome-db";
import { hasProteinCdsData } from "../../lib/cds-downloads";

type ProteinPageProps = {
  params: Promise<{
    proteinId: string;
  }>;
};

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-[#2a2118] px-5 py-3 text-center text-xs font-semibold text-white hover:bg-[#453729] whitespace-nowrap";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-[#c8b89d] px-5 py-3 text-center text-xs font-semibold text-[#2a2118] hover:bg-[#efe5d4] whitespace-nowrap";

function DetailField({
  label,
  value,
  mono = false,
  italic = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  italic?: boolean;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
        {label}
      </p>
      <p
        className={`mt-3 break-words text-sm text-[#2a2118] ${
          mono ? "font-mono" : ""
        } ${italic ? "italic" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function AnnotationField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
        {label}
      </p>
      <p className="mt-3 text-sm leading-7 text-[#2a2118]">{value}</p>
    </div>
  );
}

function makeReferenceHref(reference: LiteratureReference) {
  if (reference.url.startsWith("http")) {
    return reference.url;
  }

  if (reference.doi.startsWith("http")) {
    return reference.doi;
  }

  if (reference.doi.length > 0) {
    return `https://doi.org/${reference.doi.replace(/^doi:\s*/i, "")}`;
  }

  return "";
}

function ReferenceBlock({
  reference,
}: {
  reference: LiteratureReference | null;
}) {
  if (!reference) {
    return (
      <div className="rounded-2xl border border-[#e5d9c6] bg-white p-5">
        <p className="text-sm text-[#6a5d4d]">
          No linked literature reference is available for this entry.
        </p>
      </div>
    );
  }

  const referenceHref = makeReferenceHref(reference);

  return (
    <div className="rounded-2xl border border-[#e5d9c6] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
        Source reference
      </p>

      <p className="mt-3 text-sm font-semibold leading-7 text-[#2a2118]">
        {reference.label}
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {reference.fields.map((field) => (
          <div
            key={`${reference.id}-${field.label}-${field.value}`}
            className="rounded-xl border border-[#efe5d4] bg-[#fffaf1] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
              {field.label}
            </p>
            <p className="mt-2 break-words text-sm leading-6 text-[#6a5d4d]">
              {field.value}
            </p>
          </div>
        ))}
      </div>

      {referenceHref && (
        <a
          href={referenceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex rounded-full border border-[#c8b89d] px-5 py-2 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
        >
          Open reference
        </a>
      )}
    </div>
  );
}

function FunctionalEntryCard({
  entry,
  index,
  totalEntries,
}: {
  entry: FunctionalEntry;
  index: number;
  totalEntries: number;
}) {
  const hasExpressionData =
    entry.expressionTissue ||
    entry.expressionTiming ||
    entry.expressionDetails ||
    entry.expressionStressVariation;

  const hasFunctionData =
    entry.molecularFunction ||
    entry.biologicalProcess ||
    entry.functionDetails ||
    entry.molecularMechanisms ||
    entry.notes;

  return (
    <article className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
      <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
        {totalEntries > 1 && (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Curated entry {index + 1}
          </p>
        )}

        <h3
          className={`text-2xl font-semibold text-[#2a2118] ${
            totalEntries > 1 ? "mt-2" : ""
          }`}
        >
          Functional annotation
        </h3>
      </div>

      <div className="space-y-6 p-6">
        {hasExpressionData && (
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
              Expression evidence
            </h4>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <AnnotationField
                label="Expression tissue"
                value={entry.expressionTissue}
              />
              <AnnotationField
                label="Expression timing"
                value={entry.expressionTiming}
              />
              <AnnotationField
                label="Expression details"
                value={entry.expressionDetails}
              />
              <AnnotationField
                label="Stress variation"
                value={entry.expressionStressVariation}
              />
            </div>
          </section>
        )}

        {hasFunctionData && (
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
              Functional evidence
            </h4>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <AnnotationField
                label="Molecular function"
                value={entry.molecularFunction}
              />
              <AnnotationField
                label="Biological process"
                value={entry.biologicalProcess}
              />
              <AnnotationField
                label="Function details"
                value={entry.functionDetails}
              />
              <AnnotationField
                label="Molecular mechanisms"
                value={entry.molecularMechanisms}
              />
              <AnnotationField label="Notes" value={entry.notes} />
            </div>
          </section>
        )}

        {!hasExpressionData && !hasFunctionData && (
          <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
            <p className="text-sm text-[#6a5d4d]">
              This curated entry does not contain additional expression or
              functional detail fields.
            </p>
          </div>
        )}

        <ReferenceBlock reference={entry.reference} />
      </div>
    </article>
  );
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProteinPage({ params }: ProteinPageProps) {
  const resolvedParams = await params;
  const proteinId = Number(resolvedParams.proteinId);

  if (!Number.isInteger(proteinId) || proteinId < 1) {
    notFound();
  }

  const proteinPageData = getProteinPageData(proteinId);

  if (!proteinPageData) {
    notFound();
  }

  const { protein, functionalEntries } = proteinPageData;
  const hasProteinSequence = protein.proteinSequence.length > 0;
  const hasCdsSequence = hasProteinCdsData(protein.id);

  const wrappedSequence = protein.proteinSequence
    ? wrapSequence(protein.proteinSequence)
    : "";

  return (
    <SitePage
      eyebrow="Protein record"
      title={protein.standardizedName}
      description={protein.proteinName}
    >
      <div className="space-y-8">
        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
                Record summary
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#2a2118]">
                {protein.standardizedName}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6a5d4d]">
                {protein.proteinName}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              {hasProteinSequence && (
                <Link
                  href={`/api/downloads/protein/${protein.id}?format=protein-fasta`}
                  className={primaryButtonClass}
                >
                  Download Protein FASTA
                </Link>
              )}

              {hasCdsSequence && (
                <Link
                  href={`/api/downloads/protein/${protein.id}?format=cds-fasta`}
                  className={secondaryButtonClass}
                >
                  Download CDS FASTA
                </Link>
              )}

              <Link
                href={`/browse?family=${encodeURIComponent(protein.family)}`}
                className={secondaryButtonClass}
              >
                View family
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Accession" value={protein.accession} mono />
            <DetailField label="Species" value={protein.species} italic />
            <DetailField label="Species code" value={protein.speciesCode} mono />
            <DetailField label="Family" value={protein.family} />
            <DetailField
              label="Length"
              value={protein.length > 0 ? `${protein.length} aa` : "Unknown"}
            />
            <DetailField
              label="Functional entries"
              value={functionalEntries.length.toLocaleString()}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
          <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
            <h2 className="text-xl font-semibold text-[#2a2118]">
              Curated functional annotations
            </h2>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              Functional and expression evidence linked to this protein record.
            </p>
          </div>

          <div className="space-y-6 p-6">
            {functionalEntries.length > 0 ? (
              functionalEntries.map((entry, index) => (
                <FunctionalEntryCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  totalEntries={functionalEntries.length}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                <p className="text-sm leading-7 text-[#6a5d4d]">
                  No curated functional annotation entries are currently linked
                  to this protein.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
          <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
            <h2 className="text-xl font-semibold text-[#2a2118]">
              Protein sequence
            </h2>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              Sequence shown in FASTA-style wrapping at 80 amino acids per line.
            </p>
          </div>

          <div className="p-6">
            {wrappedSequence.length > 0 ? (
              <pre className="max-h-[520px] overflow-auto rounded-2xl border border-[#e5d9c6] bg-[#221d18] p-5 text-xs leading-6 text-[#fffaf1]">
                {wrappedSequence}
              </pre>
            ) : (
              <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                <p className="text-sm text-[#6a5d4d]">
                  No protein sequence is available for this record.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#2a2118]">
            Related actions
          </h2>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/browse?species=${encodeURIComponent(protein.species)}`}
              className="rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
            >
              View species proteins
            </Link>

            <Link
              href={`/browse?family=${encodeURIComponent(protein.family)}`}
              className="rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
            >
              View family proteins
            </Link>

            <Link
              href="/browse"
              className="rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
            >
              Back to browse
            </Link>
          </div>
        </section>
      </div>
    </SitePage>
  );
}
