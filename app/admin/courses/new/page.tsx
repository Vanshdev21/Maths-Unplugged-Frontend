import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "@/components/admin/course-form";
import { PageHeader } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: "New course" };

export default function NewCoursePage() {
  return (
    <>
      <Link href="/admin/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Courses
      </Link>
      <PageHeader title="New course" description="You can save now and add more lessons later." />
      <CourseForm />
    </>
  );
}
