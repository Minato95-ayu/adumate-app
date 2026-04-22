import { blogs } from "@/data/blogs";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = "https://www.adumate.in";
  const now = new Date();

  // Core pages
  const routes = [
    "",
    "/dashboard",
    "/test",
    "/search",
    "/login",
    "/map",
    "/register-provider",
    "/partner",
    "/blog",
    "/vidwan",
    "/services",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Blog post pages
  const blogRoutes = blogs.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes];
}

