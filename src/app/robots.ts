import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/dashboard", "/test", "/search", "/login", "/partner", "/map"],
        disallow: ["/admin", "/api/", "/_next/", "/profile/", "/test/"],
      },
    ],
    sitemap: "https://www.adumate.in/sitemap.xml",
    host: "https://www.adumate.in",
  };
}
