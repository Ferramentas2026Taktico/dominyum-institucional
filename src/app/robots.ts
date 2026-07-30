import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.dominyum.com.br/sitemap.xml", // TROQUE pelo domínio real
  };
}