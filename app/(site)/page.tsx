import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Trust } from "@/components/home/trust";
import { Faq } from "@/components/home/faq";
import { Cta } from "@/components/home/cta";
import { CourseCard } from "@/components/course/course-card";
import { Container, EmptyState } from "@/components/ui/misc";
import { fetchCourses, fetchLayout } from "@/lib/server-api";

export const revalidate = 60;

export default async function HomePage() {
  const [courses, banner, faq] = await Promise.all([fetchCourses(), fetchLayout("Banner"), fetchLayout("FAQ")]);

  const list = courses ?? [];
  const rated = list.filter((c) => (c.ratings ?? 0) > 0);
  const stats = {
    courses: list.length,
    learners: list.reduce((sum, c) => sum + (c.purchased ?? 0), 0),
    rating: rated.length ? rated.reduce((s, c) => s + (c.ratings ?? 0), 0) / rated.length : 0,
  };

  return (
    <>
      <Hero banner={banner?.banner} stats={stats} />

      <section>
        <Container className="py-20 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Start with a course</h2>
              <p className="mt-3 text-muted">Every course lists its lessons up front, so you know exactly what you&apos;re getting.</p>
            </div>
            {list.length > 6 && (
              <Link href="/courses" className="text-sm font-medium underline underline-offset-4 hover:no-underline">
                View all {list.length} courses
              </Link>
            )}
          </div>

          {list.length ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.slice(0, 6).map((course, i) => (
                <CourseCard key={course._id} course={course} priority={i < 3} />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-10"
              title={courses ? "New courses are on the way" : "Courses couldn't be loaded"}
              description={
                courses
                  ? "We're recording the first lessons now. Create an account and we'll let you know when they're live."
                  : "Refresh the page in a moment. If it keeps happening, the server may be restarting."
              }
            />
          )}
        </Container>
      </section>

      <HowItWorks />
      <Trust />
      <Faq items={faq?.faq} />
      <Cta />
    </>
  );
}
