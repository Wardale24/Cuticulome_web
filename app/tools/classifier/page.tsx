import CuticularClassifierTool from "../../components/CuticularClassifierTool";
import SitePage from "../../components/SitePage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ClassifierPage() {
  return (
    <SitePage
      eyebrow="Protein classification"
      title="Cuticular Protein Classifier"
      description="Classify candidate proteins into cuticular protein families using Cuticulome.org HMM classifier models."
    >
      <CuticularClassifierTool />
    </SitePage>
  );
}
