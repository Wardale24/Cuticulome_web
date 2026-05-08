import DownloadsBrowser from "../components/DownloadsBrowser";
import SitePage from "../components/SitePage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function DownloadsPage() {
  return (
    <SitePage
      eyebrow="Downloads"
      title="Download curated datasets"
      description="Access FASTA files for all curated proteins, species-specific protein sets, and family-specific datasets from Cuticulome.db."
    >
      <DownloadsBrowser />
    </SitePage>
  );
}
