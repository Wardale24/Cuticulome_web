import { getDeploymentHealth } from "../../lib/deployment-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getDeploymentHealth();

  return Response.json(health, {
    status: health.database.ok ? 200 : 500,
  });
}
