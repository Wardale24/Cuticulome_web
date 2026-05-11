import DownloadsBrowser from "../components/DownloadsBrowser";
import SitePage from "../components/SitePage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function DownloadsPage() {
  return (
    <SitePage
      eyebrow="Downloads"
      title="Downloads"
      description="Download curated Cuticulome.org protein sequences, metadata tables, functional annotation tables, species-specific FASTA files, and family-specific FASTA files."
    >
      <DownloadsBrowser />
    </SitePage>
  );
}
