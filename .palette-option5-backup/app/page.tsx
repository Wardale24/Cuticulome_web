import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import { getDatabaseStatistics } from "./lib/statistics";

const mainSections = [
  {
    title: "Browse the database",
    description:
      "Search curated arthropod cuticular proteins by species, family, accession, and standardized nomenclature.",
    href: "/browse",
  },
  {
    title: "Protein families",
    description:
      "Explore cuticular protein families, conserved domains, HMM-supported classifications, and literature references.",
    href: "/families",
  },
  {
    title: "Species",
    description:
      "View species-specific protein sets, taxonomy, available annotations, and downloadable FASTA files.",
    href: "/species",
  },
  {
    title: "Statistics",
    description:
      "View database-wide summaries, including family distribution, top species, and functional annotation coverage.",
    href: "/statistics",
  },
  {
    title: "Downloads",
    description:
      "Download curated protein sequences, family-specific FASTA files, species datasets, and reference tables.",
    href: "/downloads",
  },
];

const tools = [
  {
    title: "miniBLAST",
    description:
      "Compare a protein sequence against all curated Cuticulome.org proteins.",
    href: "/tools/miniblast",
  },
  {
    title: "Cuticular Protein Classifier",
    description:
      "Classify candidate proteins into cuticular protein families using curated HMM models.",
    href: "/tools/classifier",
  },
];

function roundedDownCount(value: number, interval: number) {
  if (value <= 0) {
    return "0";
  }

  if (value < interval) {
    return `${value.toLocaleString()}+`;
  }

  const roundedValue = Math.floor(value / interval) * interval;

  return `${roundedValue.toLocaleString()}+`;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function Home() {
  const statistics = getDatabaseStatistics();

  const databaseStats = [
    {
      label: "Cuticular proteins",
      value: roundedDownCount(statistics.totalProteins, 100),
    },
    {
      label: "Species",
      value: roundedDownCount(statistics.totalSpecies, 10),
    },
    {
      label: "Protein families",
      value: statistics.totalRepresentedFamilies.toLocaleString(),
    },
    {
      label: "Function-defined",
      value: roundedDownCount(statistics.functionDefinedProteins, 10),
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#221d18]">
      <SiteHeader />

      <section className="border-b border-[#d8cbb7] bg-[#fffaf1]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#8c3f2b]">
              Arthropod cuticular protein resource
            </p>

            <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-[#2a2118] md:text-6xl">
              A curated database of arthropod cuticular proteins.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6a5d4d]">
              Cuticulome.org provides curated cuticular protein entries,
              cuticular protein family classification, downloadable FASTA files,
              and sequence analysis tools for comparative cuticle biology.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/browse"
                className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
              >
                Browse database
              </Link>

              <Link
                href="/tools/miniblast"
                className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                BLAST protein
              </Link>

              <Link
                href="/tools/classifier"
                className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Classify protein
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
            <div className="rounded-2xl bg-[#efe5d4] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
                Database overview
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {databaseStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-5"
                  >
                    <p className="text-3xl font-semibold text-[#2a2118]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-[#6a5d4d]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Explore
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2a2118]">
            Database sections
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {mainSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#bfa98a] hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-[#2a2118]">
                {section.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6a5d4d]">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d8cbb7] bg-[#eadfca]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Tools
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2a2118]">
              Sequence analysis tools
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="rounded-3xl border border-[#cdbb9e] bg-[#fffdf8] p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#bfa98a] hover:shadow-md"
              >
                <h3 className="text-2xl font-semibold text-[#2a2118]">
                  {tool.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6a5d4d]">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Contributions
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2a2118]">
            Submit new cuticular protein annotations
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6a5d4d]">
            Researchers may submit individual protein entries through the
            submission form. For large batches of newly identified proteins,
            species-level datasets, or functional annotations, please contact
            the Cuticulome.org team directly.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/submit"
              className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
            >
              Submit protein
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d8cbb7] bg-[#fffaf1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-8 text-sm text-[#6a5d4d]">
          <p>© Cuticulome.org</p>

          <Link href="/contact" className="underline hover:text-[#2a2118]">
            Contact us
          </Link>
        </div>
      </footer>
    </main>
  );
}
