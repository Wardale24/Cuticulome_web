import Link from "next/link";
import { getDownloadsData } from "../lib/cuticulome-db";

export default function DownloadsBrowser() {
  const { totalProteins, totalSpecies, totalFamilies, families, species } =
    getDownloadsData();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalProteins}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Total proteins</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalSpecies}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Species</p>
          </div>

          <div className="rounded-2xl border border-[#d8cbb7] bg-[#f7f2e8] p-5">
            <p className="text-3xl font-semibold text-[#2a2118]">
              {totalFamilies}
            </p>
            <p className="mt-1 text-sm text-[#6a5d4d]">Protein families</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Complete FASTA dataset
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#2a2118]">
              Download all protein sequences
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6a5d4d]">
              Download a FASTA file containing all protein sequences currently
              available in Cuticulome.db.
            </p>

            <Link
              href="/api/downloads/all"
              className="mt-6 inline-flex rounded-full bg-[#2a2118] px-6 py-3 text-sm font-semibold text-white hover:bg-[#453729]"
            >
              Download all FASTA
            </Link>
          </div>

          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Complete CSV datasets
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#2a2118]">
              Download database tables
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6a5d4d]">
              Download structured CSV files for protein metadata and curated
              functional annotations.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/api/downloads/csv/proteins"
                className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729]"
              >
                Protein metadata CSV
              </Link>

              <Link
                href="/api/downloads/csv/annotations"
                className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Functional annotations CSV
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
        <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
          <h2 className="text-xl font-semibold text-[#2a2118]">
            Family-specific FASTA files
          </h2>
          <p className="mt-1 text-sm text-[#6a5d4d]">
            Download proteins grouped by curated cuticular protein family.
          </p>
        </div>

        <div className="divide-y divide-[#e5d9c6]">
          {families.map((family) => (
            <div
              key={family.family}
              className="flex flex-col justify-between gap-4 px-6 py-5 md:flex-row md:items-center"
            >
              <div>
                <p className="font-semibold text-[#2a2118]">{family.family}</p>
                <p className="mt-1 text-sm text-[#6a5d4d]">
                  {family.proteinCount} proteins
                </p>
              </div>

              <Link
                href={`/api/downloads/family?family=${encodeURIComponent(
                  family.family
                )}`}
                className="rounded-full border border-[#c8b89d] px-5 py-2 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Download FASTA
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
        <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
          <h2 className="text-xl font-semibold text-[#2a2118]">
            Species-specific FASTA files
          </h2>
          <p className="mt-1 text-sm text-[#6a5d4d]">
            Download proteins grouped by species.
          </p>
        </div>

        <div className="divide-y divide-[#e5d9c6]">
          {species.map((entry) => (
            <div
              key={`${entry.id}-${entry.species}`}
              className="flex flex-col justify-between gap-4 px-6 py-5 md:flex-row md:items-center"
            >
              <div>
                <p className="font-semibold text-[#2a2118]">
                  <span className="italic">{entry.species}</span>
                </p>
                <p className="mt-1 text-sm text-[#6a5d4d]">
                  {entry.speciesCode} · {entry.proteinCount} proteins
                </p>
              </div>

              <Link
                href={`/api/downloads/species/${entry.id}`}
                className="rounded-full border border-[#c8b89d] px-5 py-2 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
              >
                Download FASTA
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
