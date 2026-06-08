import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/deployment"],
    },
    sitemap: "https://www.cuticulome.org/sitemap.xml",
  };
}
