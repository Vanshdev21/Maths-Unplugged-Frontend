import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, BookOpen, Check, Clock, Users } from "lucide-react";
import { Container, Stars } from "@/components/ui/misc";
import { PurchaseCard } from "@/components/course/purchase-card";
import { Curriculum } from "@/components/course/curriculum";
import { ReviewList } from "@/components/course/reviews";
import { fetchCourse } from "@/lib/server-api";
import { coursePrice, courseStats, formatDuration } from "@/lib/utils";
import { site } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await fetchCourse(id);
  if (!course) return { title: "Course not found" };
  const description = course.description.slice(0, 160);
  return {
    title: course.name,
    description,
    alternates: { canonical: `/courses/${id}` },
    openGraph: {
      title: course.name,
      description,
      images: course.thumbnail?.url ? [{ url: course.thumbnail.url }] : undefined,
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const course = await fetchCourse(id);
  if (!course) notFound();

  const { lessons, minutes } = courseStats(course);
  const reviews = course.reviews ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    provider: { "@type": "Organization", name: site.name, sameAs: site.url },
    ...(course.thumbnail?.url ? { image: course.thumbnail.url } : {}),
    offers: { "@type": "Offer", price: coursePrice(course), priceCurrency: "INR", category: coursePrice(course) > 0 ? "Paid" : "Free" },
    ...(reviews.length
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: (course.ratings ?? 0).toFixed(1), reviewCount: reviews.length } }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="border-b border-border bg-surface">
        <Container className="py-10 lg:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/courses" className="hover:text-fg">
              Courses
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-fg">{course.name}</span>
          </nav>
          <div className="mt-5 max-w-2xl lg:max-w-[calc(100%-26rem)]">
            <h1 className="text-4xl leading-tight font-bold sm:text-5xl">{course.name}</h1>
            <p className="mt-4 line-clamp-3 text-lg leading-relaxed text-muted">{course.description}</p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {!!course.ratings && (
                <li className="inline-flex items-center gap-2">
                  <span className="font-semibold text-fg tabular">{course.ratings.toFixed(1)}</span>
                  <Stars value={course.ratings} />
                  <span>({reviews.length})</span>
                </li>
              )}
              <li className="inline-flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" aria-hidden /> {course.level}
              </li>
              {lessons > 0 && (
                <li className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" aria-hidden /> {lessons} lessons
                </li>
              )}
              {minutes > 0 && (
                <li className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden /> {formatDuration(minutes)} of video
                </li>
              )}
              {!!course.purchased && (
                <li className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden /> {course.purchased.toLocaleString("en-IN")} enrolled
                </li>
              )}
            </ul>
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-10 lg:grid-cols-[1fr_22.5rem] lg:gap-14 lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:order-2 lg:-mt-56 lg:self-start">
          <PurchaseCard course={course} />
        </aside>

        <div className="min-w-0 space-y-14 lg:order-1">
          {!!course.benefits?.length && (
            <section>
              <h2 className="text-2xl font-bold">What you&apos;ll learn</h2>
              <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {course.benefits.map((b) => (
                  <li key={b._id ?? b.title} className="flex gap-3 leading-relaxed">
                    <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                    {b.title}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold">Course content</h2>
              {lessons > 0 && (
                <p className="text-sm text-muted">
                  {lessons} lessons{minutes > 0 && `, ${formatDuration(minutes)} total`}
                </p>
              )}
            </div>
            <div className="mt-6">
              <Curriculum lessons={course.courseData ?? []} />
            </div>
          </section>

          {!!course.prerequisites?.length && (
            <section>
              <h2 className="text-2xl font-bold">Before you start</h2>
              <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-fg">
                {course.prerequisites.map((p) => (
                  <li key={p._id ?? p.title}>{p.title}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold">About this course</h2>
            <p className="mt-5 max-w-prose leading-relaxed whitespace-pre-line text-muted">{course.description}</p>
          </section>

          <section id="reviews" className="scroll-mt-24">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">Reviews</h2>
              {!!course.ratings && (
                <span className="inline-flex items-center gap-2 text-muted">
                  <Stars value={course.ratings} /> {course.ratings.toFixed(1)} from {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>
            <div className="mt-6">
              <ReviewList reviews={reviews} courseId={course._id} />
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}
