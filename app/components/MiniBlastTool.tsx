"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type MiniBlastHit = {
  proteinId: number;
  status: "Function-defined" | "Non-function-defined";
  protein: string;
  accession: string;
  species: string;
  speciesCode: string;
  percentIdentity: number;
  queryCoverage: number;
  alignmentLength: number;
  evalue: number;
  bitScore: number;
};

type MiniBlastResult = {
  queryLength: number;
  databaseProteinCount: number;
  hitCount: number;
  hits: MiniBlastHit[];
};

function formatEvalue(value: number) {
  if (value === 0) {
    return "0";
  }

  return value.toExponential(2);
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

function buildCsv(result: MiniBlastResult) {
  const header = [
    "Status",
    "Protein",
    "Accession",
    "Species",
    "Species code",
    "% Identity",
    "Query Coverage (%)",
    "Alignment Length",
    "E-value",
    "Bit Score",
    "Protein URL",
  ];

  const rows = result.hits.map((hit) => [
    hit.status,
    hit.protein,
    hit.accession,
    hit.species,
    hit.speciesCode,
    String(hit.percentIdentity),
    String(hit.queryCoverage),
    String(hit.alignmentLength),
    String(hit.evalue),
    String(hit.bitScore),
    `/protein/${hit.proteinId}`,
  ]);

  const escapeCsvCell = (value: string) => {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");
}

export default function MiniBlastTool() {
  const [queryText, setQueryText] = useState("");
  const [result, setResult] = useState<MiniBlastResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const csvDownloadHref = useMemo(() => {
    if (!result || result.hits.length === 0) {
      return "";
    }

    const csv = buildCsv(result);
    const encodedCsv = encodeURIComponent(csv);

    return `data:text/csv;charset=utf-8,${encodedCsv}`;
  }, [result]);

  async function handleRunMiniBlast() {
    setIsRunning(true);
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/miniblast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: queryText,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "miniBLAST failed.");
      }

      setResult(payload as MiniBlastResult);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "miniBLAST failed.";
      setErrorMessage(message);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
        <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <label
              htmlFor="miniblast-query"
              className="block px-4 text-sm font-semibold text-[#2a2118]"
            >
              Paste protein sequence
            </label>

            <textarea
              id="miniblast-query"
              value={queryText}
              onChange={(event) => setQueryText(event.target.value)}
              placeholder={">query\nMKKLLVVAAALVAAQASA..."}
              className="mt-2 h-[260px] w-full resize-none rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 font-mono text-sm leading-6 text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRunMiniBlast}
                disabled={isRunning}
                className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRunning ? "Running miniBLAST..." : "Run miniBLAST"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setQueryText("");
                  setResult(null);
                  setErrorMessage("");
                }}
                disabled={isRunning}
                className="rounded-full border border-[#c8b89d] px-6 py-3 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6 lg:mt-7 lg:h-[260px]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              How it works
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-[#2a2118]">
              Search against Cuticulome.org proteins
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#6a5d4d]">
              miniBLAST compares your pasted protein sequence against protein
              entries stored in Cuticulome.org using BLASTP. Results are ranked by bit score,
              identity, query coverage, and E-value.
            </p>
          </div>
        </div>
      </section>

      {errorMessage && (
        <section className="rounded-3xl border border-[#c48a7a] bg-[#fff1ed] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#8c3f2b]">
            miniBLAST failed
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#6a2f24]">
            {errorMessage}
          </p>
        </section>
      )}

      {result && (
        <section className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
          <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-[#2a2118]">
                  miniBLAST results
                </h2>
                <p className="mt-1 text-sm text-[#6a5d4d]">
                  Query length: {result.queryLength} aa · Database proteins:{" "}
                  {result.databaseProteinCount} · Hits: {result.hitCount}
                </p>
              </div>

              {result.hits.length > 0 && csvDownloadHref && (
                <a
                  href={csvDownloadHref}
                  download="miniBLAST_results.csv"
                  className="rounded-full border border-[#c8b89d] px-5 py-2 text-center text-sm font-semibold text-[#2a2118] hover:bg-[#efe5d4]"
                >
                  Download CSV
                </a>
              )}
            </div>
          </div>

          {result.hits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead className="bg-[#eadfca] text-[#2a2118]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Protein</th>
                    <th className="px-6 py-4 font-semibold">Accession</th>
                    <th className="px-6 py-4 font-semibold">Species</th>
                    <th className="px-6 py-4 font-semibold">% Identity</th>
                    <th className="px-6 py-4 font-semibold">
                      Query coverage
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Alignment length
                    </th>
                    <th className="px-6 py-4 font-semibold">E-value</th>
                    <th className="px-6 py-4 font-semibold">Bit score</th>
                  </tr>
                </thead>

                <tbody>
                  {result.hits.map((hit, index) => (
                    <tr
                      key={`${hit.proteinId}-${hit.bitScore}-${hit.evalue}-${index}`}
                      className="border-t border-[#e5d9c6] bg-[#fffdf8] transition hover:bg-[#fff7ea]"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={
                            hit.status === "Function-defined"
                              ? "rounded-full bg-[#dfead8] px-3 py-1 text-xs font-semibold text-[#486338]"
                              : "rounded-full bg-[#f0ded8] px-3 py-1 text-xs font-semibold text-[#8c3f2b]"
                          }
                        >
                          {hit.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        <Link
                          href={`/protein/${hit.proteinId}`}
                          className="text-[#8c3f2b] hover:underline"
                        >
                          {hit.protein}
                        </Link>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-[#6a5d4d]">
                        {hit.accession}
                      </td>

                      <td className="px-6 py-4">
                        <span className="italic text-[#2a2118]">
                          {hit.species}
                        </span>
                        <span className="ml-2 rounded-full bg-[#efe5d4] px-2 py-1 text-xs font-semibold not-italic text-[#6a5d4d]">
                          {hit.speciesCode}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[#2a2118]">
                        {formatNumber(hit.percentIdentity)}
                      </td>

                      <td className="px-6 py-4 text-[#2a2118]">
                        {formatNumber(hit.queryCoverage)}
                      </td>

                      <td className="px-6 py-4 text-[#6a5d4d]">
                        {hit.alignmentLength}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-[#6a5d4d]">
                        {formatEvalue(hit.evalue)}
                      </td>

                      <td className="px-6 py-4 text-[#2a2118]">
                        {formatNumber(hit.bitScore)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#2a2118]">
                No BLAST hits found.
              </p>
              <p className="mt-2 text-sm text-[#6a5d4d]">
                Try a longer query or a protein sequence closer to entries in
                Cuticulome.org.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
