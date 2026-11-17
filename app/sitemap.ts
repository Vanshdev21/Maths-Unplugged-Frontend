import type { MetadataRoute } from "next";
import { fetchCourses } from "@/lib/server-api";
import { PAYMENTS_ENABLED, site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = (await fetchCourses()) ?? [];
  const staticPages = ["", "/courses", "/terms", "/privacy", ...(PAYMENTS_ENABLED ? ["/refund-policy"] : [])].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
  return [
    ...staticPages,
    ...courses.map((c) => ({
      url: `${site.url}/courses/${c._id}`,
      lastModified: c.updatedAt ?? c.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
