import Link from "next/link";
import SitePage from "../components/SitePage";

type HelpTableRow = {
  label: string;
  description: string;
};

type ThreeColumnTableRow = {
  first: string;
  second: string;
  third: string;
  firstItalic?: boolean;
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
      className="min-w-0 scroll-mt-24 rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-4 shadow-sm md:p-8"
    >
      <h2 className="text-xl font-semibold tracking-tight text-[#2a2118] md:text-2xl">
        {title}
      </h2>
      <div className="mt-5 min-w-0 space-y-5 break-words text-sm leading-7 text-[#6a5d4d]">
        {children}
      </div>
    </section>
  );
}

function HelpTable({ rows }: { rows: HelpTableRow[] }) {
  return (
    <div className="min-w-0">
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-[#d8cbb7] bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
              Field
            </p>
            <p className="mt-1 font-semibold text-[#2a2118]">{row.label}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
              Description
            </p>
            <p className="mt-1 text-[#6a5d4d]">{row.description}</p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-[#d8cbb7] sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#eadfca] text-[#2a2118]">
            <tr>
              <th className="w-1/3 px-5 py-4 font-semibold">Field</th>
              <th className="px-5 py-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-[#e5d9c6] bg-white">
                <td className="px-5 py-4 font-semibold text-[#2a2118]">
                  {row.label}
                </td>
                <td className="px-5 py-4 text-[#6a5d4d]">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThreeColumnTable({
  columns,
  rows,
}: {
  columns: [string, string, string];
  rows: ThreeColumnTableRow[];
}) {
  return (
    <div className="min-w-0">
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={`${row.first}-${row.third}`}
            className="rounded-2xl border border-[#d8cbb7] bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
              {columns[0]}
            </p>
            <p
              className={`mt-1 text-[#2a2118] ${
                row.firstItalic ? "italic" : ""
              }`}
            >
              {row.first}
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
              {columns[1]}
            </p>
            <p className="mt-1 break-all text-[#6a5d4d]">{row.second}</p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8c3f2b]">
              {columns[2]}
            </p>
            <p className="mt-1 break-all font-semibold text-[#2a2118]">
              {row.third}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-[#d8cbb7] sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#eadfca] text-[#2a2118]">
            <tr>
              <th className="px-5 py-4 font-semibold">{columns[0]}</th>
              <th className="px-5 py-4 font-semibold">{columns[1]}</th>
              <th className="px-5 py-4 font-semibold">{columns[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.first}-${row.third}`}
                className="border-t border-[#e5d9c6] bg-white"
              >
                <td className={`px-5 py-4 ${row.firstItalic ? "italic" : ""}`}>
                  {row.first}
                </td>
                <td className="px-5 py-4">{row.second}</td>
                <td className="px-5 py-4 font-semibold text-[#2a2118]">
                  {row.third}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      className="inline-flex justify-center rounded-full bg-[#2a2118] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
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
      description="Learn how to browse the database, interpret protein records, filter and download datasets, use miniBLAST, run the Cuticular Protein Classifier, understand standardized nomenclature, and contribute new annotations."
    >
      <div className="grid min-w-0 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-8 lg:self-start">
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
              <a href="#protein-families" className="hover:text-[#2a2118]">
                Protein Families
              </a>
              <a href="#downloads" className="hover:text-[#2a2118]">
                Downloads
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

        <div className="min-w-0 space-y-8">
          <HelpSection id="overview" title="Overview">
            <p>
              <strong className="text-[#2a2118]">Cuticulome.org</strong>{" "}
              compiles curated information on arthropod cuticular proteins,
              including protein sequences, protein family assignments, species
              information, functional annotations, and supporting references.
            </p>

            <p>
              The goal of Cuticulome.org is to centralize cuticular protein
              information across arthropod species to support comparative
              studies, sequence searches, family classification, functional
              annotation, and broader cuticle biology analyses.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/browse">Browse database</ActionLink>
              <Link
                href="/downloads"
                className="inline-flex justify-center rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Build downloads
              </Link>
            </div>
          </HelpSection>

          <HelpSection id="database-structure" title="Database structure">
            <p>
              The database is organized around curated cuticular protein records
              linked to species information, standardized protein names, protein
              family assignments, source publications, and functional
              annotations.
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
                        "Cuticulome.org standardized name of the cuticular protein. The standardized name is only used for consistency on this platform.",
                    },
                    {
                      label: "Protein family",
                      description:
                        "Cuticular protein family or group to which the protein belongs, such as CPR, CPAP, CPF, CPFL, Tweedle, CPG, CPH, or other cuticular-related families.",
                    },
                    {
                      label: "Species",
                      description:
                        "Species associated with the protein record, including a standardized species code used internally by the database.",
                    },
                    {
                      label: "Protein sequence",
                      description:
                        "Amino acid sequence used for browsing, FASTA downloads, miniBLAST, and classifier support.",
                    },
                    {
                      label: "Function-defined status",
                      description:
                        "Indicates whether the protein is associated with at least one curated functional annotation entry.",
                    },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Functional annotation information
              </h3>

              <div className="mt-3">
                <HelpTable
                  rows={[
                    {
                      label: "Expression timing",
                      description:
                        "Expression-related details from the source annotation.",
                    },
                    {
                      label: "Defined function",
                      description:
                        "Curated functional description associated with the protein.",
                    },
                    {
                      label: "Molecular function",
                      description: "Molecular-level functional annotation.",
                    },
                    {
                      label: "Biological process",
                      description:
                        "Biological process or broader functional context.",
                    },
                    {
                      label: "Reference",
                      description:
                        "Source publication or curated reference supporting the annotation.",
                    },
                  ]}
                />
              </div>
            </div>
          </HelpSection>

          <HelpSection id="protein-families" title="Protein Families">
            <p>
              The Protein Families page summarizes cuticular protein families
              represented in Cuticulome.org.
            </p>

            <p>
              Protein families are not limited to only cuticular protein
              families, but also include families directly associated with
              cuticular proteins or cuticle function, such as Yellow,
              chitinases, and other cuticle-related groups.
            </p>

            <p>
              Each family also includes a section titled{" "}
              <strong className="text-[#2a2118]">
                Cuticular proteins with defined functions
              </strong>
              . This section displays representative function-defined proteins
              from that family.
            </p>

            <ActionLink href="/families">Open Protein Families</ActionLink>
          </HelpSection>

          <HelpSection id="downloads" title="Downloads">
            <p>
              The Downloads page is essentially a custom dataset builder. Users
              can filter the database to create a tailored dataset, then
              download matching proteins as FASTA or metadata as CSV for
              downstream implementation and analyses.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Available filters
              </h3>

              <div className="mt-3">
                <HelpTable
                  rows={[
                    {
                      label: "Search proteins",
                      description:
                        "Search by protein name, accession, species, species code, or protein family.",
                    },
                    {
                      label: "Function or expression keyword",
                      description:
                        "Search curated function, expression timing, tissue, biological process, or molecular function.",
                    },
                    {
                      label: "Protein family",
                      description:
                        "Restrict the dataset to a selected cuticular protein family.",
                    },
                    {
                      label: "Function status",
                      description:
                        "Download all proteins, only function-defined proteins, or proteins lacking defined function.",
                    },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2a2118]">
                Download formats
              </h3>

              <p className="mt-2">
                Download FASTA for downstream sequence analysis. CSV is
                available for metadata inspection, filtering in spreadsheets,
                and dataset documentation.
              </p>
            </div>

            <ActionLink href="/downloads">Open Downloads</ActionLink>
          </HelpSection>

          <HelpSection id="miniblast" title="miniBLAST">
            <p>
              The <strong className="text-[#2a2118]">miniBLAST</strong> tool
              allows users to compare a protein sequence against all protein
              sequences currently available in Cuticulome.org.
            </p>

            <p>
              Paste an amino acid sequence into the input box and run miniBLAST.
              The input can be in FASTA format containing a header, or as a
              simple amino acid sequence.
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
                    "Standardized Cuticulome.org protein name, linked to the individual protein record.",
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
              This tool uses the current Cuticulome.org HMM classifier models
              and reports the best supported cuticular protein family
              classification, along with confidence, interpretation, best HMM
              hit, and all detected HMM hits.
            </p>

            <p>
              Paste an amino acid sequence into the input box, then run the
              classifier. The input can be in FASTA format containing a header,
              or as a simple amino acid sequence.
            </p>

            <HelpTable
              rows={[
                {
                  label: "Prediction",
                  description:
                    "The most likely cuticular protein family based on classifier evidence.",
                },
                {
                  label: "Confidence",
                  description:
                    "A confidence category based on HMM evidence and supporting classifier logic.",
                },
                {
                  label: "Best HMM hit",
                  description:
                    "The strongest HMM match, including model, E-value, bit score, model coverage, and query coverage.",
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

            <div className="rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[#2a2118]">
                Important note
              </h3>

              <p className="mt-2">
                The classifier is intended as a screening and annotation-support
                tool, not as absolute proof of protein identity or biological
                function. A strong classifier result can support family
                assignment, but users should still seek additional evidence such
                as domain structure, phylogenetic analysis, species context, and
                literature support.
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

              <div className="rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-4 md:p-5">
                <p className="break-all font-mono text-sm font-semibold text-[#2a2118] sm:break-normal">
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
              <h3 className="text-lg font-semibold text-[#2a2118]">Examples</h3>

              <div className="mt-3">
                <ThreeColumnTable
                  columns={[
                    "Species",
                    "Old nomenclature",
                    "Standardized name",
                  ]}
                  rows={[
                    {
                      first: "Drosophila melanogaster",
                      second: "Dmel_CPR1, DMCPR1",
                      third: "Dme_CPR1",
                      firstItalic: true,
                    },
                    {
                      first: "Myzus persicae",
                      second: "MpCpr1, mp-cpr1",
                      third: "Mpe_CPR1",
                      firstItalic: true,
                    },
                    {
                      first: "Apis mellifera",
                      second: "apme_cpr1, AmCPR1",
                      third: "Ame_CPR1",
                      firstItalic: true,
                    },
                  ]}
                />
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
                name is added as an additional prefix when such conflicts occur.
              </p>

              <div className="mt-3">
                <ThreeColumnTable
                  columns={[
                    "Species",
                    "Ambiguous standardized name",
                    "Conflict-resolved name",
                  ]}
                  rows={[
                    {
                      first: "Heliothis virescens",
                      second: "Hvi_ProteinName",
                      third: "Heliothis_Hvi_ProteinName",
                      firstItalic: true,
                    },
                    {
                      first: "Heortia vitessoides",
                      second: "Hvi_ProteinName",
                      third: "Heortia_Hvi_ProteinName",
                      firstItalic: true,
                    },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[#2a2118]">
                Important notes
              </h3>

              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li>
                  Cuticulome.org is not attempting to officially rename
                  proteins. The standardization applies only within the database
                  for consistency and searchability.
                </li>
                <li>Previous nomenclatures are preserved.</li>
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
                className="inline-flex justify-center rounded-full border border-[#c8b89d] px-5 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
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
        </div>
      </div>
    </SitePage>
  );
}
