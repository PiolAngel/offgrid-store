import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/checkout", "/api/"] }],
    sitemap: "https://offgrid-store-rho.vercel.app/sitemap.xml",
  };
}
