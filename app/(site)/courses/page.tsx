import type { Metadata } from "next";
import { CourseBrowser } from "@/components/course/course-browser";
import { Container, EmptyState } from "@/components/ui/misc";
import { fetchCourses, fetchLayout } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "All courses",
  description: "Browse every Maths Unplugged course. See the full list of lessons before you enrol.",
  alternates: { canonical: "/courses" },
};

export const revalidate = 60;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CoursesPage({ searchParams }: Props) {
  const [params, courses, categoriesLayout] = await Promise.all([searchParams, fetchCourses(), fetchLayout("Categories")]);

  const categories = categoriesLayout?.categories?.map((c) => c.title) ?? [];

  return (
    <Container className="py-12 lg:py-16">
      <h1 className="text-4xl font-bold sm:text-5xl">Courses</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Every course lists its lessons up front, so you can see exactly what&apos;s covered.</p>
      <div className="mt-10">
        {courses ? (
          <CourseBrowser
            courses={courses}
            categories={categories}
            initial={{ q: one(params.q), category: one(params.category), level: one(params.level), sort: one(params.sort) }}
          />
        ) : (
          <EmptyState title="Courses couldn't be loaded" description="Refresh the page in a moment. If it keeps happening, the server may be restarting." />
        )}
      </div>
    </Container>
  );
}
