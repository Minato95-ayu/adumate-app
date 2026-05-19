import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = "https://www.adumate.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/services/", "/map/", "/search/"],
        disallow: ["/admin/", "/api/", "/_next/", "/profile/", "/login", "/register-provider"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/register-provider"],
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

