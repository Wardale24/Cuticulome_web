import Link from "next/link";
import SitePage from "../components/SitePage";
import SubmissionForm from "../components/SubmissionForm";

export default function SubmitPage() {
  return (
    <SitePage
      eyebrow="Contributions"
      title="Submit protein annotations"
      description="Submit individual arthropod cuticular protein annotations for curator review, or contact the Cuticulome.db team for batch submissions and large datasets."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <SubmissionForm />

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Before submitting
            </p>

            <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-[#6a5d4d]">
              <li>Submit one protein sequence per form entry.</li>
              <li>Use FASTA or plain amino acid sequence format.</li>
              <li>Include accession numbers where available.</li>
              <li>Add publication details, DOI, or URL if the protein has functional evidence.</li>
              <li>Use the notes field for alternative names or nomenclature issues.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Batch submissions
            </p>

            <p className="mt-4 text-sm leading-7 text-[#6a5d4d]">
              For large batches of proteins, newly annotated species datasets,
              or extensive function tables, please contact the Cuticulome.db
              team directly. This helps avoid repetitive individual submissions
              and allows curators to review the dataset structure first.
            </p>

            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-full border border-[#c8b89d] px-5 py-3 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
            >
              Contact the team
            </Link>
          </section>

          <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Review policy
            </p>

            <p className="mt-4 text-sm leading-7 text-[#6a5d4d]">
              Submitted proteins are reviewed before inclusion in
              Cuticulome.db. Submission does not guarantee immediate addition to
              the public database.
            </p>
          </section>
        </aside>
      </div>
    </SitePage>
  );
}
