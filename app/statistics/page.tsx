import SitePage from "../components/SitePage";
import StatisticsDashboard from "../components/StatisticsDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function StatisticsPage() {
  return (
    <SitePage
      eyebrow="Database statistics"
      title="Cuticulome.org statistics"
      description="Explore summary statistics generated directly from the Cuticulome.org SQLite database, including protein counts, species representation, family distribution, functional annotation coverage, and sequence availability."
    >
      <StatisticsDashboard />
    </SitePage>
  );
}
