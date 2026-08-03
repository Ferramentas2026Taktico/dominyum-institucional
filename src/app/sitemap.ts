import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.dominyum.com.br", // TROQUE pelo domínio real
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}