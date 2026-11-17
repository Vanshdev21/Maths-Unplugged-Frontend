"use client";

import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import { CourseCardSkeleton, CourseThumb } from "@/components/course/course-card";
import { ButtonLink, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { useGetMyCoursesQuery } from "@/redux/api/courseApi";
import { useProgressPercent } from "@/hooks/use-progress";
import { courseStats, formatDuration, getErrorMessage } from "@/lib/utils";
import type { Course } from "@/lib/types";

function EnrolledCard({ course }: { course: Course }) {
  const { lessons, minutes } = courseStats(course);
  const percent = useProgressPercent(course._id, lessons);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border transition hover:border-fg/30">
      <CourseThumb course={course} />
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-sans text-lg leading-snug font-semibold">
          <Link href={`/course-access/${course._id}`} className="after:absolute after:inset-0">
            {course.name}
          </Link>
        </h2>
        <p className="mt-2 text-sm text-muted">
          {lessons} lessons{minutes > 0 && `, ${formatDuration(minutes)}`}
        </p>
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{percent === 100 ? "Completed" : percent ? "In progress" : "Not started"}</span>
            <span className="font-medium tabular">{percent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${course.name} progress`}>
            <div className="h-full rounded-full bg-brand-line transition-all" style={{ width: `${percent}%` }} />
          </div>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
            <PlayCircle className="h-4 w-4" aria-hidden /> {percent ? "Continue learning" : "Start course"}
          </span>
        </div>
      </div>
    </article>
  );
}

export function MyCourses() {
  const { data, isLoading, isError, error, refetch } = useGetMyCoursesQuery();

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Your courses couldn't be loaded"
        description={getErrorMessage(error)}
        action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
      />
    );
  }

  if (!data?.courses.length) {
    return (
      <EmptyState
        icon={<BookOpen className="h-5 w-5" />}
        title="You haven't enrolled in a course yet"
        description="Browse the catalogue and preview any course before you enrol."
        action={<ButtonLink href="/courses">Browse courses</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.courses.map((course) => (
        <EnrolledCard key={course._id} course={course} />
      ))}
    </div>
  );
}
