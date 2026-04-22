import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = "https://www.adumate.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/services/", "/map/", "/search/"],
        disallow: ["/admin/", "/api/", "/_next/", "/profile/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

