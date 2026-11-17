import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Users } from "lucide-react";
import { Badge, Stars } from "@/components/ui/misc";
import { coursePrice, courseStats, discountPercent, formatDuration, formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/types";

export function CourseThumb({ course, priority, className }: { course: Course; priority?: boolean; className?: string }) {
  return (
    <div className={`relative aspect-video overflow-hidden bg-surface-2 ${className ?? ""}`}>
      {course.thumbnail?.url ? (
        <Image
          src={course.thumbnail.url}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="bg-graph flex h-full w-full items-end p-4">
          <span className="font-display text-2xl leading-tight font-bold">{course.name}</span>
        </div>
      )}
    </div>
  );
}

export function CourseCard({
  course,
  priority,
  showEnrolled = true,
}: {
  course: Course;
  priority?: boolean;
  showEnrolled?: boolean;
}) {
  const { lessons, minutes } = courseStats(course);
  const price = coursePrice(course);
  const off = price ? discountPercent(price, course.estimatedPrice) : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg transition hover:border-fg/30">
      <CourseThumb course={course} priority={priority} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>{course.level}</Badge>
          {off > 0 && <Badge tone="brand">{off}% off</Badge>}
        </div>
        <h3 className="font-sans text-lg leading-snug font-semibold">
          <Link href={`/courses/${course._id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {course.name}
          </Link>
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
          {lessons > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" aria-hidden /> {lessons} lessons
            </span>
          )}
          {minutes > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {formatDuration(minutes)}
            </span>
          )}
          {showEnrolled && !!course.purchased && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden /> {course.purchased.toLocaleString("en-IN")} enrolled
            </span>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold tabular">{formatPrice(price)}</span>
            {off > 0 && (
              <span className="text-sm text-subtle line-through tabular">{formatPrice(course.estimatedPrice)}</span>
            )}
          </div>
          {!!course.ratings && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              <Stars value={course.ratings} size={13} />
              <span className="tabular">{course.ratings.toFixed(1)}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="aspect-video animate-pulse bg-surface-2" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-20 animate-pulse rounded bg-surface-2" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
