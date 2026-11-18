import "server-only";
import { SERVER_API_URL } from "./site";
import type { Course, HomeContent, Layout, PageSlug, SitePage } from "./types";

/**
 * Public data for server components (SEO + fast first paint).
 * Errors resolve to `null` so a backend hiccup never breaks the build.
 */
async function getJSON<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCourses() {
  const data = await getJSON<{ courses: Course[] }>("/course/get-courses");
  return data?.courses ?? null;
}

export async function fetchCourse(id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  const data = await getJSON<{ course: Course }>(`/course/get-course/${id}`);
  return data?.course ?? null;
}

export async function fetchLayout(type: Layout["type"]) {
  const data = await getJSON<{ layout: Layout | null }>(`/get-layout/${type}`, 300);
  return data?.layout ?? null;
}

/** An editable content page, or null if the admin hasn't saved one yet. */
export async function fetchPage(slug: PageSlug) {
  const data = await getJSON<{ page: SitePage | null }>(`/page/${slug}`, 60);
  return data?.page ?? null;
}

/** Homepage section text, or null if the admin hasn't saved any yet. */
export async function fetchHomeContent() {
  const data = await getJSON<{ content: HomeContent | null }>("/page/home", 60);
  return data?.content ?? null;
}
