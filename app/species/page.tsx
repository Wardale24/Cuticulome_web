import SitePage from "../components/SitePage";
import SpeciesBrowser from "../components/SpeciesBrowser";

type SpeciesPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SpeciesPage({ searchParams }: SpeciesPageProps) {
  const params = await searchParams;
  const searchTerm = params?.q ?? "";

  return (
    <SitePage
      eyebrow="Species"
      title="Browse species"
      description="View species represented in Cuticulome.db, inspect available cuticular protein sets, and access species-specific protein records."
    >
      <SpeciesBrowser searchTerm={searchTerm} />
    </SitePage>
  );
}
