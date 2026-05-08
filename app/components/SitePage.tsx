import Link from "next/link";

type SitePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function SitePage({
  eyebrow,
  title,
  description,
  children,
}: SitePageProps) {
  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#221d18]">
      <header className="border-b border-[#d8cbb7] bg-[#fffaf1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-[#2a2118]"
          >
            Cuticulome.db
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#6a5d4d] md:flex">
            <Link href="/browse" className="hover:text-[#2a2118]">
              Browse
            </Link>
            <Link href="/families" className="hover:text-[#2a2118]">
              Families
            </Link>
            <Link href="/species" className="hover:text-[#2a2118]">
              Species
            </Link>
            <Link href="/tools/miniblast" className="hover:text-[#2a2118]">
              miniBLAST
            </Link>
            <Link href="/tools/classifier" className="hover:text-[#2a2118]">
              Classifier
            </Link>
            <Link href="/help" className="hover:text-[#2a2118]">
              Help
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-[#d8cbb7] bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#8c3f2b]">
            {eyebrow}
          </p>

          <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-[#2a2118] md:text-6xl">
            {title}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#6a5d4d]">
            {description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {children ?? (
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-8 shadow-sm">
            <p className="text-sm leading-7 text-[#6a5d4d]">
              This section is currently a design placeholder. The next version
              can connect this page to the Cuticulome.db database and analysis
              tools.
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-[#d8cbb7] bg-[#fffaf1]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-[#6a5d4d] md:flex-row">
          <p>© Cuticulome.db</p>
          <p>Curated arthropod cuticular protein database</p>
        </div>
      </footer>
    </main>
  );
}
