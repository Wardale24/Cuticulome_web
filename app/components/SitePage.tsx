import Link from "next/link";
import SiteHeader from "./SiteHeader";

type SitePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function SitePage({
  title,
  description,
  children,
}: SitePageProps) {
  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#221d18]">
      <SiteHeader />

      <section className="border-b border-[#d8cbb7] bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-16">
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
              can connect this page to the Cuticulome.org database and analysis
              tools.
            </p>
          </div>
        )}
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
