import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/*": [
      "./data/cuticulome.db",
      "./data/**/*",
      "./db_working_classifier/**/*",
    ],
  },
};

export default nextConfig;
