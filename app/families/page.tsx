import FamiliesBrowser from "../components/FamiliesBrowser";
import SitePage from "../components/SitePage";

type FamiliesPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function FamiliesPage({ searchParams }: FamiliesPageProps) {
  const params = await searchParams;
  const searchTerm = params?.q ?? "";

  return (
    <SitePage
      eyebrow="Protein families"
      title="Explore cuticular protein families"
      description="Browse cuticular protein families represented in Cuticulome.db, inspect family-level summaries, view example proteins, and download family-specific FASTA files."
    >
      <FamiliesBrowser searchTerm={searchTerm} />
    </SitePage>
  );
}
