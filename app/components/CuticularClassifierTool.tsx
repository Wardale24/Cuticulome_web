"use client";

import { useState } from "react";

type ClassifierHit = {
  model: string;
  evalue: number;
  bitscore: number;
  model_coverage: number;
  query_coverage: number;
};

type ClassifierResult = {
  prediction: string;
  confidence: string;
  confidenceLabel: string;
  queryLength: number;
  interpretation: string;
  best_hit: ClassifierHit | null;
  all_hits: ClassifierHit[];
  note?: string;
};

function formatEvalue(value: number) {
  if (value === 0) {
    return "0";
  }

  return value.toExponential(2);
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}

function formatPercent(value: number) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "—";
}

function confidenceBadgeClass(confidence: string) {
  if (confidence === "strong") {
    return "rounded-full bg-[#dfead8] px-3 py-1 text-xs font-semibold text-[#486338]";
  }

  if (confidence === "ambiguous") {
    return "rounded-full bg-[#fff0c7] px-3 py-1 text-xs font-semibold text-[#80611c]";
  }

  if (confidence === "weak") {
    return "rounded-full bg-[#f0ded8] px-3 py-1 text-xs font-semibold text-[#8c3f2b]";
  }

  return "rounded-full bg-[#efe5d4] px-3 py-1 text-xs font-semibold text-[#6a5d4d]";
}

export default function CuticularClassifierTool() {
  const [sequenceText, setSequenceText] = useState("");
  const [result, setResult] = useState<ClassifierResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  async function handleClassify() {
    setIsRunning(true);
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/classifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sequence: sequenceText,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "The classifier failed.");
      }

      setResult(payload as ClassifierResult);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The classifier failed.";

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
              htmlFor="classifier-sequence"
              className="block px-4 text-sm font-semibold text-[#2a2118]"
            >
              Paste protein sequence
            </label>

            <textarea
              id="classifier-sequence"
              value={sequenceText}
              onChange={(event) => setSequenceText(event.target.value)}
              placeholder={">query\nMKKLLVVAAALVAAQASA..."}
              className="mt-2 h-[260px] w-full resize-none rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 font-mono text-sm leading-6 text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleClassify}
                disabled={isRunning}
                className="rounded-full bg-[#2a2118] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#453729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRunning ? "Running classifier..." : "Classify protein"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSequenceText("");
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
              Classify proteins using Cuticulome.org HMMs
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#6a5d4d]">
              The classifier compares a submitted amino acid sequence against
              the current Cuticulome.org HMM models and reports the best
              supported cuticular protein family classification.
            </p>
          </div>
        </div>
      </section>

      {errorMessage && (
        <section className="rounded-3xl border border-[#c48a7a] bg-[#fff1ed] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#8c3f2b]">
            Classifier failed
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#6a2f24]">
            {errorMessage}
          </p>
        </section>
      )}

      {result && (
        <section className="space-y-8">
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
                  Classification result
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-[#2a2118]">
                  {result.prediction}
                </h2>
                <p className="mt-2 text-sm text-[#6a5d4d]">
                  Query length: {result.queryLength} aa
                </p>
              </div>

              <span className={confidenceBadgeClass(result.confidence)}>
                {result.confidenceLabel}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-5">
              <h3 className="text-sm font-semibold text-[#2a2118]">
                Interpretation
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#6a5d4d]">
                {result.interpretation}
              </p>
            </div>
          </div>

          {result.best_hit && (
            <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
                Best HMM hit
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                    Model
                  </p>
                  <p className="mt-3 break-words text-sm font-semibold text-[#2a2118]">
                    {result.best_hit.model}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                    E-value
                  </p>
                  <p className="mt-3 font-mono text-sm text-[#2a2118]">
                    {formatEvalue(result.best_hit.evalue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                    Bit score
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[#2a2118]">
                    {formatNumber(result.best_hit.bitscore)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                    Model coverage
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[#2a2118]">
                    {formatPercent(result.best_hit.model_coverage)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                    Query coverage
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[#2a2118]">
                    {formatPercent(result.best_hit.query_coverage)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
            <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
              <h2 className="text-xl font-semibold text-[#2a2118]">
                All HMM hits
              </h2>
              <p className="mt-1 text-sm text-[#6a5d4d]">
                Full list of HMM hits reported by the classifier.
              </p>
            </div>

            {result.all_hits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead className="bg-[#eadfca] text-[#2a2118]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Model</th>
                      <th className="px-6 py-4 font-semibold">E-value</th>
                      <th className="px-6 py-4 font-semibold">Bit score</th>
                      <th className="px-6 py-4 font-semibold">
                        Model coverage
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Query coverage
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.all_hits.map((hit, index) => (
                      <tr
                        key={`${hit.model}-${hit.evalue}-${hit.bitscore}-${index}`}
                        className="border-t border-[#e5d9c6] bg-[#fffdf8] transition hover:bg-[#fff7ea]"
                      >
                        <td className="px-6 py-4 font-semibold text-[#8c3f2b]">
                          {hit.model}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-[#6a5d4d]">
                          {formatEvalue(hit.evalue)}
                        </td>

                        <td className="px-6 py-4 text-[#2a2118]">
                          {formatNumber(hit.bitscore)}
                        </td>

                        <td className="px-6 py-4 text-[#2a2118]">
                          {formatPercent(hit.model_coverage)}
                        </td>

                        <td className="px-6 py-4 text-[#2a2118]">
                          {formatPercent(hit.query_coverage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#2a2118]">
                  No HMM hits were detected.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
