import type { MetadataRoute } from "next";

const siteUrl = "https://www.cuticulome.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/browse",
    "/families",
    "/species",
    "/statistics",
    "/downloads",
    "/tools/miniblast",
    "/tools/classifier",
    "/help",
    "/submit",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
