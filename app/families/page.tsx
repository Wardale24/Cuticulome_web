import FamiliesBrowser from "../components/FamiliesBrowser";
import SitePage from "../components/SitePage";

type FamiliesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function FamiliesPage({ searchParams }: FamiliesPageProps) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.q ?? "";

  return (
    <SitePage
      eyebrow="Protein families"
      title="Explore cuticular protein families"
      description="Browse cuticular protein families represented in Cuticulome.org, including protein counts per family, average sequence length, and function-defined proteins."
    >
      <FamiliesBrowser searchTerm={searchTerm} />
    </SitePage>
  );
}
