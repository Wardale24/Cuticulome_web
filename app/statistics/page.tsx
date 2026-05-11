import SitePage from "../components/SitePage";
import StatisticsDashboard from "../components/StatisticsDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function StatisticsPage() {
  return (
    <SitePage
      eyebrow="Database statistics"
      title="Cuticulome.org statistics"
      description="Explore Cuticulome.org summary statistics."
    >
      <StatisticsDashboard />
    </SitePage>
  );
}
