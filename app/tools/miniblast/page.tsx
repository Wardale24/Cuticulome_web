import MiniBlastTool from "../../components/MiniBlastTool";
import SitePage from "../../components/SitePage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function MiniBlastPage() {
  return (
    <SitePage
      eyebrow="Sequence search"
      title="miniBLAST"
      description="Compare a protein sequence against curated Cuticulome.org proteins using a lightweight BLASTP search."
    >
      <MiniBlastTool />
    </SitePage>
  );
}
