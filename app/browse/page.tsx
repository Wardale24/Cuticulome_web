import BrowseDatabase from "../components/BrowseDatabase";
import SitePage from "../components/SitePage";

type BrowsePageProps = {
  searchParams?: Promise<{
    q?: string;
    family?: string;
    species?: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;

  const searchTerm = params?.q ?? "";
  const selectedFamily = params?.family ?? "All families";
  const selectedSpecies = params?.species ?? "All species";

  return (
    <SitePage
      eyebrow="Database browser"
      title="Browse the database"
      description="Search and explore curated arthropod cuticular protein entries by species, family, accession, standardized name, and protein length."
    >
      <BrowseDatabase
        searchTerm={searchTerm}
        selectedFamily={selectedFamily}
        selectedSpecies={selectedSpecies}
      />
    </SitePage>
  );
}
