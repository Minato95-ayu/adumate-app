import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/dashboard", "/test", "/search", "/login", "/partner"],
        disallow: ["/admin", "/api/", "/_next/", "/profile/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: "https://adumate.app/sitemap.xml",
    host: "https://adumate.app",
  };
}
