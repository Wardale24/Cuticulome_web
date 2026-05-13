import SitePage from "../components/SitePage";
import { DeploymentCheck, getDeploymentHealth } from "../lib/deployment-health";

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        ok
          ? "rounded-full bg-[#dfead8] px-3 py-1 text-xs font-semibold text-[#486338]"
          : "rounded-full bg-[#f0ded8] px-3 py-1 text-xs font-semibold text-[#8c3f2b]"
      }
    >
      {ok ? "Available" : "Missing"}
    </span>
  );
}

function CheckRow({ check }: { check: DeploymentCheck }) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-[#e5d9c6] px-5 py-4 last:border-b-0 md:flex-row md:items-center">
      <div>
        <p className="font-semibold text-[#2a2118]">{check.label}</p>
        <p className="mt-1 text-sm leading-6 text-[#6a5d4d]">
          {check.detail}
        </p>
      </div>

      <StatusBadge ok={check.ok} />
    </div>
  );
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DeploymentPage() {
  const health = await getDeploymentHealth();

  const miniBlastReady =
    health.executables.find((check) => check.label === "makeblastdb")?.ok &&
    health.executables.find((check) => check.label === "blastp")?.ok;

  const classifierReady =
    health.files.find((check) => check.label === "Classifier directory")?.ok &&
    health.files.find((check) => check.label === "Classifier script")?.ok &&
    health.executables.find((check) => check.label === "python / python3")?.ok;

  return (
    <SitePage
      eyebrow="Deployment diagnostics"
      title="Deployment health check"
      description="Check whether the database file, server runtime, local binaries, and classifier assets are available in the current environment."
    >
      <div className="space-y-8">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Database
            </p>
            <p className="mt-3 text-4xl font-semibold text-[#2a2118]">
              {health.database.ok ? "Ready" : "Missing"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6a5d4d]">
              {health.database.detail}
            </p>
          </div>

          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Proteins
            </p>
            <p className="mt-3 text-4xl font-semibold text-[#2a2118]">
              {health.database.proteinCount.toLocaleString()}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6a5d4d]">
              Protein records readable from SQLite.
            </p>
          </div>

          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              miniBLAST
            </p>
            <p className="mt-3 text-4xl font-semibold text-[#2a2118]">
              {miniBlastReady ? "Ready" : "Limited"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6a5d4d]">
              Requires makeblastdb and blastp.
            </p>
          </div>

          <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
              Classifier
            </p>
            <p className="mt-3 text-4xl font-semibold text-[#2a2118]">
              {classifierReady ? "Ready" : "Limited"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6a5d4d]">
              Requires Python, classifier files, and usually HMMER.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Runtime environment
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                Vercel
              </p>
              <p className="mt-3 text-sm font-semibold text-[#2a2118]">
                {health.environment.isVercel ? "Detected" : "Not detected"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                Vercel environment
              </p>
              <p className="mt-3 text-sm font-semibold text-[#2a2118]">
                {health.environment.vercelEnvironment}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e5d9c6] bg-[#f7f2e8] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3f2b]">
                Node environment
              </p>
              <p className="mt-3 text-sm font-semibold text-[#2a2118]">
                {health.environment.nodeEnvironment}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
          <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
            <h2 className="text-xl font-semibold text-[#2a2118]">
              Required files
            </h2>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              These files must be available to the server runtime.
            </p>
          </div>

          <div>
            {health.files.map((check) => (
              <CheckRow key={check.label} check={check} />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] shadow-sm">
          <div className="border-b border-[#d8cbb7] bg-[#fffaf1] px-6 py-5">
            <h2 className="text-xl font-semibold text-[#2a2118]">
              External executables
            </h2>
            <p className="mt-1 text-sm text-[#6a5d4d]">
              These are available locally if installed with apt/conda, but may
              not exist on Vercel unless packaged separately.
            </p>
          </div>

          <div>
            {health.executables.map((check) => (
              <CheckRow key={check.label} check={check} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            Recommendations
          </p>

          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-[#6a5d4d]">
            {health.recommendations.map((recommendation) => (
              <li key={recommendation}>{recommendation}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8c3f2b]">
            API check
          </p>

          <p className="mt-3 text-sm leading-7 text-[#6a5d4d]">
            The same information is available as JSON at{" "}
            <code className="rounded bg-[#efe5d4] px-1 py-0.5 text-[#2a2118]">
              /api/health
            </code>
            .
          </p>
        </section>
      </div>
    </SitePage>
  );
}
