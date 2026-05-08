import Link from "next/link";
import SitePage from "../components/SitePage";

type HelpTableRow = {
  label: string;
  description: string;
};

function HelpSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-[#2a2118]">
        {title}
      </h2>
      <div className="mt-5 space-y-5 text-sm leading-7 text-[#6a5d4d]">
        {children}
      </div>
    </section>
  );
}

function HelpTable({ rows }: { rows: HelpTableRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8cbb7]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#eadfca] text-[#2a2118]">
          <tr>
            <th className="w-1/3 px-5 py-4 font-semibold">Field</th>
            <th className="px-5 py-4 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-t border-[#e5d9c6] bg-white"
            >
              <td className="px-5 py-4 font-semibold text-[#2a2118]">
                {row.label}
              </td>
              <td className="px-5 py-4 text-[#6a5d4d]">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full bg-[#2a2118] px-5 py-3 text-sm font-semibold text-white hover:bg-[#453729]"
    >
      {children}
    </Link>
  );
}

export default function HelpPage() {
  return (
    <SitePage
      eyebrow="Documentation"
      title="Understanding Cuticulome.org"
      description="Learn how to browse the database, interpret protein records, use miniBLAST, run the Cuticular Protein Classifier, understand standardized nomenclature, and contribute new annotations."
    >
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Help topics
            </p>

            <nav className="mt-4 flex flex-col gap-2 text-sm font-semibold text-[#6a5d4d]">
              <a href="#overview" className="hover:text-[#2a2118]">
                Overview
              </a>
              <a href="#database-structure" className="hover:text-[#2a2118]">
                Database structure
              </a>
              <a href="#using-database" className="hover:text-[#2a2118]">
                Using the database
              </a>
              <a href="#miniblast" className="hover:text-[#2a2118]">
                miniBLAST
              </a>
              <a href="#classifier" className="hover:text-[#2a2118]">
                Cuticular Protein Classifier
              </a>
              <a href="#nomenclature" className="hover:text-[#2a2118]">
                Nomenclature
              </a>
              <a href="#contributing" className="hover:text-[#2a2118]">
                Contributing
              </a>
              <a href="#contact" className="hover:text-[#2a2118]">
                Contact
              </a>
            </nav>
          </div>
        </aside>

        <div className="space-y-8">
          <HelpSection id="overview" title="Overview">
            <p>
              <strong className="text-[#2a2118]">Cuticulome.org</strong>{" "}
              compiles verified information on function-defined arthropod
              cuticular proteins, including protein family, tissue specificity,
              and identified or inferred functions.
            </p>

            <p>
              The goal of Cuticulome.org is to centralize cuticular protein
              information across arthropod species to facilitate downstream
              comparative studies, sequence searches, functional annotation, and
              broader cuticle biology analyses.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/browse">Browse database</ActionLink>
              <Link
                href="/downloads"
                className="inline-flex rounded-full border border-[#c8b89d] px-5 py-3 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                View downloads
              </Link>
            </div>
          </HelpSection>

          <HelpSection id="database-structure" title="Database structure">
            <p>
              The database is organized around curated cuticular protein records
              linked to species information, standardized protein names,
              source publications, and functional annotations where available.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Protein information
              </h3>

              <div className="mt-3">
                <HelpTable
                  rows={[
                    {
                      label: "Cuticular protein",
                      description:
                        "Standardized name of the cuticular protein. See the nomenclature section below for more details.",
                    },
                    {
                      label: "Protein family",
                      description:
                        "Family or group to which the cuticular protein belongs, such as CPR, CPAP, CPF, CPFL, Tweedle, or CPLC.",
                    },
                    {
                      label: "Function",
                      description:
                        "Biological role or experimentally validated/inferred function where available.",
                    },
                    {
                      label: "Species",
                      description:
                        "Species associated with the protein record, including standardized species code.",
                    },
                    {
                      label: "Sequence",
                      description:
                        "Protein sequence used for browsing, FASTA downloads, miniBLAST, and classifier support.",
                    },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Source publication information
              </h3>

              <div className="mt-3">
                <HelpTable
                  rows={[
                    {
                      label: "Reference",
                      description:
                        "Source publication that describes the function, annotation, or biological relevance of the protein.",
                    },
                    {
                      label: "DOI / URL",
                      description:
                        "Digital Object Identifier or source URL associated with the publication.",
                    },
                  ]}
                />
              </div>
            </div>
          </HelpSection>

          <HelpSection id="using-database" title="Using the database">
            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Browsing and filtering
              </h3>

              <p className="mt-2">
                Use the Browse page to search curated protein entries by
                standardized name, original protein name, accession, species,
                species code, family, or sequence length.
              </p>

              <p>
                The Species and Families pages provide higher-level summaries,
                allowing users to inspect which species and protein families are
                currently represented in Cuticulome.org.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Exporting data
              </h3>

              <p className="mt-2">
                Download options are available for the complete protein set,
                species-specific protein sets, family-specific protein sets, and
                individual protein records.
              </p>

              <ul className="list-disc space-y-2 pl-6">
                <li>All curated protein sequences as FASTA.</li>
                <li>Species-specific FASTA files.</li>
                <li>Family-specific FASTA files.</li>
                <li>Single-protein FASTA files from individual records.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/browse">Open database browser</ActionLink>
              <Link
                href="/downloads"
                className="inline-flex rounded-full border border-[#c8b89d] px-5 py-3 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Open downloads
              </Link>
            </div>
          </HelpSection>

          <HelpSection id="miniblast" title="miniBLAST">
            <p>
              The <strong className="text-[#2a2118]">miniBLAST</strong> tool
              allows users to compare a protein sequence against all protein
              sequences currently available in Cuticulome.org.
            </p>

            <p>
              This tool is useful when users want to check whether a query
              sequence resembles a known cuticular protein, identify possible
              conserved homologs, or find the closest matching proteins already
              present in the database.
            </p>

            <p>
              Paste an amino acid sequence into the input box and run
              miniBLAST. The input can be in FASTA format containing a header,
              or as a simple amino acid sequence.
            </p>

            <HelpTable
              rows={[
                {
                  label: "Status",
                  description:
                    "Indicates whether the matching protein is function-defined in Cuticulome.org.",
                },
                {
                  label: "Protein",
                  description:
                    "Standardized Cuticulome.org protein name, or original protein name if no standardized name is available.",
                },
                {
                  label: "% Identity",
                  description:
                    "Percentage identity between the query and matched protein over the aligned region.",
                },
                {
                  label: "Query coverage",
                  description:
                    "Percentage of the query sequence covered by the alignment.",
                },
                {
                  label: "Alignment length",
                  description: "Length of the BLAST alignment.",
                },
                {
                  label: "E-value",
                  description:
                    "BLAST expectation value. Lower values indicate stronger matches.",
                },
                {
                  label: "Bit score",
                  description:
                    "BLAST score. Higher values generally indicate stronger matches.",
                },
              ]}
            />

            <p>
              The results table can be downloaded as a CSV file for further
              inspection.
            </p>

            <ActionLink href="/tools/miniblast">Open miniBLAST</ActionLink>
          </HelpSection>

          <HelpSection id="classifier" title="Cuticular Protein Classifier">
            <p>
              The{" "}
              <strong className="text-[#2a2118]">
                Cuticular Protein Classifier
              </strong>{" "}
              allows users to query a protein sequence and assess whether it
              resembles one of the defined cuticular protein families
              represented in Cuticulome.org.
            </p>

            <p>
              This tool uses the family-specific profile HMMs developed for
              Cuticulome.org, together with supporting conserved-sequence
              features where relevant. These models are built directly from
              curated cuticular protein sequences in the database and are
              intended to help classify new or unannotated protein sequences.
            </p>

            <p>
              Paste an amino acid sequence into the input box, then run the
              classifier. The input can be in FASTA format containing a header,
              or as a simple amino acid sequence.
            </p>

            <HelpTable
              rows={[
                {
                  label: "Predicted family",
                  description:
                    "The most likely cuticular protein family based on the classifier result.",
                },
                {
                  label: "Confidence",
                  description:
                    "A confidence category based on HMM evidence and family-specific validation rules.",
                },
                {
                  label: "HMM hits",
                  description:
                    "Best-matching profile HMMs, including scores, E-values, and coverage values.",
                },
                {
                  label: "Review notes",
                  description:
                    "Additional interpretation where a sequence shows ambiguous, weak, or cross-family evidence.",
                },
              ]}
            />

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Families covered
              </h3>

              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li>CPR, including RR-1 and RR-2 subclassification.</li>
                <li>CPAP, including CPAP1 and CPAP3 subclassification.</li>
                <li>CPF / CPFL.</li>
                <li>CPT / Tweedle.</li>
                <li>CPG / CPH.</li>
                <li>CPLCA / CPLCG / CPLCP / CPLCW.</li>
                <li>CPCFC.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-5">
              <h3 className="text-sm font-semibold text-[#2a2118]">
                Important note
              </h3>

              <p className="mt-2">
                The classifier is intended as a screening and
                annotation-support tool, not as absolute proof of protein
                identity or biological function. A strong classifier result can
                support family assignment, but users should still seek
                additional evidence such as domain structure, phylogenetic
                analysis, species context, and literature support where
                available.
              </p>
            </div>

            <ActionLink href="/tools/classifier">
              Open Cuticular Protein Classifier
            </ActionLink>
          </HelpSection>

          <HelpSection id="nomenclature" title="Nomenclature standard">
            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                The challenge
              </h3>

              <p className="mt-2">
                Historically, scientists have not had a unified way of naming
                cuticular proteins in arthropods. This has led to inconsistent
                naming conventions across different research groups and
                publications.
              </p>

              <p>
                For example, related proteins might appear in the literature
                using formats such as{" "}
                <code className="rounded bg-[#efe5d4] px-1 py-0.5 text-[#2a2118]">
                  Dmel_CPR1
                </code>
                ,{" "}
                <code className="rounded bg-[#efe5d4] px-1 py-0.5 text-[#2a2118]">
                  apme_cpr1
                </code>
                , or{" "}
                <code className="rounded bg-[#efe5d4] px-1 py-0.5 text-[#2a2118]">
                  MpCpr1
                </code>
                . This inconsistency can make cross-species comparisons more
                difficult.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Our solution
              </h3>

              <p className="mt-2">
                To improve consistency and database searchability,
                Cuticulome.org standardizes protein names using the following
                format:
              </p>

              <div className="rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-5">
                <p className="font-mono text-sm font-semibold text-[#2a2118]">
                  Xxx_ProteinName
                </p>
              </div>

              <ul className="list-disc space-y-2 pl-6">
                <li>First letter: capitalized genus initial.</li>
                <li>Second and third letters: lowercase species initials.</li>
                <li>Underscore: separator.</li>
                <li>Protein name: original protein designation.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Examples
              </h3>

              <div className="mt-3 overflow-hidden rounded-2xl border border-[#d8cbb7]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#eadfca] text-[#2a2118]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Species</th>
                      <th className="px-5 py-4 font-semibold">
                        Old nomenclature
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Standardized name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#e5d9c6] bg-white">
                      <td className="px-5 py-4 italic">
                        Drosophila melanogaster
                      </td>
                      <td className="px-5 py-4">Dmel_CPR1, DMCPR1</td>
                      <td className="px-5 py-4 font-semibold text-[#2a2118]">
                        Dme_CPR1
                      </td>
                    </tr>
                    <tr className="border-t border-[#e5d9c6] bg-white">
                      <td className="px-5 py-4 italic">Myzus persicae</td>
                      <td className="px-5 py-4">MpCpr1, mp-cpr1</td>
                      <td className="px-5 py-4 font-semibold text-[#2a2118]">
                        Mpe_CPR1
                      </td>
                    </tr>
                    <tr className="border-t border-[#e5d9c6] bg-white">
                      <td className="px-5 py-4 italic">Apis mellifera</td>
                      <td className="px-5 py-4">apme_cpr1, AmCPR1</td>
                      <td className="px-5 py-4 font-semibold text-[#2a2118]">
                        Ame_CPR1
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Exceptions to nomenclature
              </h3>

              <p className="mt-2">
                The three-letter species prefix system can lead to naming
                conflicts between different species. For example,{" "}
                <span className="italic">Heliothis virescens</span> and{" "}
                <span className="italic">Heortia vitessoides</span> would both
                generate the same prefix. To avoid ambiguity, the full genus
                name is added as an additional prefix when such conflicts
                occur.
              </p>

              <div className="mt-3 overflow-hidden rounded-2xl border border-[#d8cbb7]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#eadfca] text-[#2a2118]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Species</th>
                      <th className="px-5 py-4 font-semibold">
                        Ambiguous standardized name
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Conflict-resolved name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#e5d9c6] bg-white">
                      <td className="px-5 py-4 italic">Heliothis virescens</td>
                      <td className="px-5 py-4">Hvi_ProteinName</td>
                      <td className="px-5 py-4 font-semibold text-[#2a2118]">
                        Heliothis_Hvi_ProteinName
                      </td>
                    </tr>
                    <tr className="border-t border-[#e5d9c6] bg-white">
                      <td className="px-5 py-4 italic">Heortia vitessoides</td>
                      <td className="px-5 py-4">Hvi_ProteinName</td>
                      <td className="px-5 py-4 font-semibold text-[#2a2118]">
                        Heortia_Hvi_ProteinName
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-5">
              <h3 className="text-sm font-semibold text-[#2a2118]">
                Important notes
              </h3>

              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li>
                  Cuticulome.org is not attempting to officially rename proteins.
                  The standardization applies only within the database for
                  consistency and searchability.
                </li>
                <li>
                  Previous nomenclatures are preserved where available.
                </li>
                <li>
                  Users can search for proteins using standardized
                  Cuticulome.org names or common alternatives.
                </li>
              </ul>
            </div>
          </HelpSection>

          <HelpSection id="contributing" title="Contributing">
            <p>
              If you have identified a missing protein or published new findings
              on arthropod cuticular proteins, please visit the submission page
              to contribute to the database.
            </p>

            <p>
              All submissions are reviewed by the Cuticulome.org curators before
              being added to ensure data quality, consistency, and appropriate
              documentation.
            </p>

            <p>
              For large batches of newly identified proteins, species-level
              datasets, or functional annotations, please contact the
              Cuticulome.org team directly rather than submitting entries one by
              one.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/submit">Submit a protein</ActionLink>
              <Link
                href="/contact"
                className="inline-flex rounded-full border border-[#c8b89d] px-5 py-3 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Contact the team
              </Link>
            </div>
          </HelpSection>

          <HelpSection id="contact" title="Questions or feedback">
            <p>
              For questions, suggestions, corrections, collaborations, or to
              report issues with Cuticulome.org, please visit the contact page.
            </p>

            <ActionLink href="/contact">Contact us</ActionLink>
          </HelpSection>

          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-5 text-sm text-[#6a5d4d]">
            <p>
              <strong className="text-[#2a2118]">Cuticulome.org v0.1</strong> ·
              Latest update: 2026 Q2
            </p>
          </div>
        </div>
      </div>
    </SitePage>
  );
}
