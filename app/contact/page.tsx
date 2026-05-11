import SitePage from "../components/SitePage";

function ContactCard({
  name,
  email,
  buttonLabel,
  buttonHref,
}: {
  name: string;
  email: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <div className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[#2a2118]">{name}</h2>

      <p className="mt-4 inline-flex rounded-full border border-[#c8b89d] px-5 py-3 text-sm font-semibold text-[#2a2118]">
        {email}
      </p>

      <div className="mt-4">
        <a
          href={buttonHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full bg-[#2a2118] px-5 py-3 text-sm font-semibold text-white hover:bg-[#453729]"
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <SitePage
      eyebrow="Contact"
      title="Contact us"
      description="We welcome all questions, feedback, and contribution inquiries."
    >
      <div className="space-y-8">
        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[#2a2118]">
            Direct contact
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ContactCard
              name="Alex Wardale"
              email="alex.wardale [@] oist.jp"
              buttonLabel="LinkedIn"
              buttonHref="https://www.linkedin.com/in/alex-wardale-a428a6114/"
            />

            <ContactCard
              name="Cédric Finet"
              email="cedric.finet [@] oist.jp"
              buttonLabel="The Finet Lab"
              buttonHref="https://cfinet.github.io/research/index.html"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[#2a2118]">
            Institution
          </h2>

          <div className="mt-5 rounded-3xl border border-[#d8cbb7] bg-[#fffaf1] p-6">
            <h3 className="text-xl font-semibold text-[#2a2118]">
              Okinawa Institute of Science and Technology Graduate University
              (OIST)
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#6a5d4d]">
              1919-1 Tancha, Onna-son
              <br />
              Okinawa 904-0495, Japan
            </p>

            <a
              href="https://groups.oist.jp/bdu"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full bg-[#2a2118] px-5 py-3 text-sm font-semibold text-white hover:bg-[#453729]"
            >
              Biological Design Unit Website
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8cbb7] bg-[#fffdf8] p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[#2a2118]">
            Cite this database
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#6a5d4d]">
            If Cuticulome.org supports your research, please cite our
            publication:
          </p>

          <div className="mt-6 rounded-2xl border border-[#d8cbb7] bg-[#fffaf1] p-5">
            <p className="text-sm leading-7 text-[#6a5d4d]">
              <span className="italic">
                Cuticulome.org: a curated database of arthropod cuticular
                proteins.
              </span>{" "}
              Wardale A. &amp; Finet C. (2026) [in preparation]
            </p>
          </div>
        </section>
      </div>
    </SitePage>
  );
}
