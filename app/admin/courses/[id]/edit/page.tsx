"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CourseForm } from "@/components/admin/course-form";
import { PageHeader } from "@/components/admin/admin-shell";
import { EmptyState, PageLoader } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { useGetAdminCourseQuery } from "@/redux/api/courseApi";
import { getErrorMessage } from "@/lib/utils";

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useGetAdminCourseQuery(id, { refetchOnMountOrArgChange: true });

  return (
    <>
      <Link href="/admin/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Courses
      </Link>
      {isLoading ? (
        <PageLoader />
      ) : isError || !data ? (
        <EmptyState title="Course couldn't be loaded" description={getErrorMessage(error)} action={<ButtonLink href="/admin/courses">Back to courses</ButtonLink>} />
      ) : (
        <>
          <PageHeader
            title={data.course.name}
            description="Edit details and lessons. Learners see changes straight away."
            action={
              <ButtonLink href={`/courses/${id}`} target="_blank" variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" aria-hidden /> View course page
              </ButtonLink>
            }
          />
          <CourseForm key={data.course.updatedAt ?? id} course={data.course} />
        </>
      )}
    </>
  );
}
