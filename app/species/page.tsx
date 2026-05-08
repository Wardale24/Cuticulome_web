import SitePage from "../components/SitePage";
import SpeciesBrowser from "../components/SpeciesBrowser";

type SpeciesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SpeciesPage({ searchParams }: SpeciesPageProps) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.q ?? "";

  return (
    <SitePage
      eyebrow="Species"
      title="Browse species"
      description="Explore arthropod species represented in Cuticulome.org, including protein counts, family coverage, average sequence length, and species-specific FASTA downloads."
    >
      <SpeciesBrowser searchTerm={searchTerm} />
    </SitePage>
  );
}
