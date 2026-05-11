import BrowseDatabase from "../components/BrowseDatabase";
import SitePage from "../components/SitePage";

type BrowsePageProps = {
  searchParams: Promise<{
    q?: string;
    family?: string;
    species?: string;
    page?: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const resolvedSearchParams = await searchParams;

  const searchTerm = resolvedSearchParams.q ?? "";
  const selectedFamily = resolvedSearchParams.family ?? "All families";
  const selectedSpecies = resolvedSearchParams.species ?? "All species";
  const currentPage = Number(resolvedSearchParams.page ?? "1");

  return (
    <SitePage
      eyebrow="Browse"
      title="Browse Cuticulome.org"
      description="Search curated arthropod cuticular proteins by standardized name, protein name, accession, species, or cuticular protein family."
    >
      <BrowseDatabase
        searchTerm={searchTerm}
        selectedFamily={selectedFamily}
        selectedSpecies={selectedSpecies}
        currentPage={
          Number.isInteger(currentPage) && currentPage > 0 ? currentPage : 1
        }
      />
    </SitePage>
  );
}
