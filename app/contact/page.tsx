import Link from "next/link";
import SitePage from "../components/SitePage";

function ContactCard({
  name,
  role,
  email,
  href,
  linkLabel,
}: {
  name: string;
  role: string;
  email: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <article className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
        Curator
      </p>

      <h2 className="mt-3 text-2xl font-semibold text-[#2a2118]">{name}</h2>

      <p className="mt-2 text-sm italic text-[#6a5d4d]">{role}</p>

      <div className="mt-5 rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
          Email
        </p>
        <p className="mt-2 font-mono text-sm text-[#2a2118]">{email}</p>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex rounded-full border border-[#c8b89d] px-5 py-3 text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
      >
        {linkLabel}
      </a>
    </article>
  );
}

function ResourceLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-[#e5d9c6] bg-white p-5 transition hover:-translate-y-1 hover:bg-[#fff7ea] hover:shadow-sm"
    >
      <p className="font-semibold text-[#2a2118]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#6a5d4d]">{description}</p>
    </Link>
  );
}

export default function ContactPage() {
  return (
    <SitePage
      eyebrow="Contact"
      title="Contact the Cuticulome.db team"
      description="We welcome questions, feedback, database corrections, contribution inquiries, and collaboration requests."
    >
      <div className="space-y-8">
        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Direct contact
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2a2118]">
            Curators
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6a5d4d]">
            Please reach out directly for questions about Cuticulome.db,
            suggested corrections, batch protein submissions, collaboration
            inquiries, or issues with database tools.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <ContactCard
              name="Alex Wardale"
              role="Data Manager and Bioinformatics Lead"
              email="alex.wardale [at] oist.jp"
              href="https://www.linkedin.com/in/alex-wardale-a428a6114/"
              linkLabel="LinkedIn"
            />

            <ContactCard
              name="Cédric Finet"
              role="Group Leader"
              email="cedric.finet [at] oist.jp"
              href="https://cfinet.github.io/research/index.html"
              linkLabel="Website"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Institution
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2a2118]">
            Biological Design Unit
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#6a5d4d]">
            Okinawa Institute of Science and Technology Graduate University
            &#40;OIST&#41;
          </p>

          <div className="mt-5 rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
            <p className="text-sm leading-7 text-[#6a5d4d]">
              1919-1 Tancha, Onna-son,
              <br />
              Okinawa 904-0495, Japan
            </p>
          </div>

          <a
            href="https://www.oist.jp/research/research-units/bde"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full bg-[#2a2118] px-5 py-3 text-sm font-semibold text-white hover:bg-[#453729]"
          >
            Biological Design Unit
          </a>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Database resources
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#2a2118]">
              Helpful links
            </h2>

            <div className="mt-6 grid gap-4">
              <ResourceLink
                href="/help"
                title="Help and documentation"
                description="Learn how to browse the database, use miniBLAST, run the classifier, download datasets, and interpret records."
              />

              <ResourceLink
                href="/submit"
                title="Submit a protein"
                description="Submit an individual cuticular protein annotation for curator review."
              />

              <ResourceLink
                href="/downloads"
                title="Downloads"
                description="Download all proteins, species-specific FASTA files, and family-specific FASTA files."
              />

              <ResourceLink
                href="/species"
                title="Species"
                description="Browse species represented in Cuticulome.db and access species-level protein sets."
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Cite this database
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#2a2118]">
              Citation
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#6a5d4d]">
              If you use Cuticulome.db in your research, please cite:
            </p>

            <blockquote className="mt-5 rounded-2xl border-l-4 border-[#8c3f2b] bg-[#fffaf1] p-5 text-sm leading-7 text-[#2a2118]">
              Wardale, A. &amp; Finet, C. &#40;2026&#41;.{" "}
              <span className="italic">
                Cuticulome.db: A database of function-defined arthropod
                cuticular proteins
              </span>{" "}
              &#40;in preparation&#41;.
            </blockquote>

            <div className="mt-6 rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
              <p className="text-sm leading-7 text-[#6a5d4d]">
                For questions about citation format, database versioning, or
                manuscript status, please contact the curators directly.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-5 text-sm text-[#6a5d4d]">
          <p>
            <strong className="text-[#2a2118]">Cuticulome.db v0.1</strong> ·
            Latest update: 2026 Q2
          </p>
        </section>
      </div>
    </SitePage>
  );
}
