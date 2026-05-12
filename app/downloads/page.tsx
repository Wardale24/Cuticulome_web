import DownloadsBrowser from "../components/DownloadsBrowser";
import SitePage from "../components/SitePage";
import {
  DownloadFilters,
  getDefaultDownloadFilters,
} from "../lib/download-filters";

type DownloadsPageProps = {
  searchParams: Promise<{
    q?: string;
    genus?: string;
    speciesId?: string;
    family?: string;
    functionStatus?: string;
    functionQuery?: string;
  }>;
};

function resolveDownloadFilters(
  searchParams: Awaited<DownloadsPageProps["searchParams"]>
): DownloadFilters {
  const defaultFilters = getDefaultDownloadFilters();
  const functionStatus = searchParams.functionStatus;

  return {
    query: searchParams.q ?? defaultFilters.query,
    genus: searchParams.genus ?? defaultFilters.genus,
    speciesId: searchParams.speciesId ?? defaultFilters.speciesId,
    family: searchParams.family ?? defaultFilters.family,
    functionStatus:
      functionStatus === "defined" || functionStatus === "lacking"
        ? functionStatus
        : defaultFilters.functionStatus,
    functionQuery: searchParams.functionQuery ?? defaultFilters.functionQuery,
  };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DownloadsPage({
  searchParams,
}: DownloadsPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = resolveDownloadFilters(resolvedSearchParams);

  return (
    <SitePage
      eyebrow="Downloads"
      title="Downloads"
      description="Build and download custom datasets by filtering proteins by taxonomy, species, protein family, functional annotation status, and curated function."
    >
      <DownloadsBrowser filters={filters} />
    </SitePage>
  );
}
