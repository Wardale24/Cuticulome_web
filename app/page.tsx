import Link from "next/link";

const databaseStats = [
  { label: "Species", value: "50+" },
  { label: "Proteins", value: "2,200+" },
  { label: "Protein families", value: "Curated" },
  { label: "Analysis tools", value: "2" },
];

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
      "Compare a protein sequence against all curated Cuticulome.db proteins.",
    href: "/tools/miniblast",
  },
  {
    title: "Cuticular Classifier",
    description:
      "Classify candidate proteins into cuticular protein families using curated HMM models.",
    href: "/tools/classifier",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1d1d1b]">
      <header className="border-b border-[#d8d2c4] bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Cuticulome.db
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#4f4a42] md:flex">
            <Link href="/browse" className="hover:text-black">
              Browse
            </Link>
            <Link href="/families" className="hover:text-black">
              Families
            </Link>
            <Link href="/species" className="hover:text-black">
              Species
            </Link>
            <Link href="/tools/miniblast" className="hover:text-black">
              miniBLAST
            </Link>
            <Link href="/tools/classifier" className="hover:text-black">
              Classifier
            </Link>
            <Link href="/help" className="hover:text-black">
              Help
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-[#d8d2c4] bg-[#fbfaf6]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#7a5c2e]">
              Arthropod cuticular protein resource
            </p>

            <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              A curated database of arthropod cuticular proteins.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#59544b]">
              Cuticulome.db provides curated cuticular protein entries,
              standardized nomenclature, family classifications, references,
              downloadable FASTA files, and sequence analysis tools for
              comparative cuticle biology.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/browse"
                className="rounded-full bg-[#1d1d1b] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#3a3834]"
              >
                Browse database
              </Link>
              <Link
                href="/tools/classifier"
                className="rounded-full border border-[#bbb29f] px-6 py-3 text-center text-sm font-semibold text-[#1d1d1b] hover:bg-[#eee8dc]"
              >
                Classify a protein
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8d2c4] bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-[#f0eadf] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a5c2e]">
                Database overview
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {databaseStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#d8d2c4] bg-[#fbfaf6] p-5"
                  >
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-sm text-[#655f55]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#d8d2c4] p-5">
              <p className="text-sm font-semibold text-[#1d1d1b]">
                Example search
              </p>
              <div className="mt-3 rounded-xl border border-[#d8d2c4] bg-[#fbfaf6] px-4 py-3 text-sm text-[#655f55]">
                Try: <span className="font-medium text-[#1d1d1b]">CPR RR-2</span>,{" "}
                <span className="font-medium text-[#1d1d1b]">CPAP3</span>,{" "}
                <span className="font-medium text-[#1d1d1b]">Drosophila</span>, or{" "}
                <span className="font-medium text-[#1d1d1b]">protein accession</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a5c2e]">
              Explore
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Database sections
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[#655f55]">
            Designed as a structured reference resource for browsing,
            downloading, and comparing arthropod cuticular proteins.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {mainSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group rounded-3xl border border-[#d8d2c4] bg-[#fbfaf6] p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#655f55]">
                {section.description}
              </p>
              <p className="mt-6 text-sm font-semibold text-[#7a5c2e]">
                Open section →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d8d2c4] bg-[#ebe3d4]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a5c2e]">
              Tools
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Sequence analysis tools
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="rounded-3xl border border-[#c8bda9] bg-[#fbfaf6] p-7 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <h3 className="text-2xl font-semibold">{tool.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#655f55]">
                  {tool.description}
                </p>
                <p className="mt-6 text-sm font-semibold text-[#7a5c2e]">
                  Launch tool →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-[#d8d2c4] bg-[#fbfaf6] p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a5c2e]">
            Contributions
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Submit new cuticular protein annotations
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#655f55]">
            Researchers may submit individual protein entries through the
            submission form. For large batches of newly identified proteins,
            species-level datasets, or functional annotations, please contact
            the Cuticulome.db team directly.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/submit"
              className="rounded-full bg-[#1d1d1b] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#3a3834]"
            >
              Submit protein
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#bbb29f] px-6 py-3 text-center text-sm font-semibold hover:bg-[#eee8dc]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d8d2c4] bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-[#655f55] md:flex-row">
          <p>© Cuticulome.db</p>
          <p>Curated arthropod cuticular protein database</p>
        </div>
      </footer>
    </main>
  );
}
