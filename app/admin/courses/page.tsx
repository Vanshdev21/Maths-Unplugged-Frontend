"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-shell";
import { Table, TableSkeleton, Td, Th } from "@/components/admin/table";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { EmptyState, Stars } from "@/components/ui/misc";
import { useDeleteCourseMutation, useGetAdminCoursesQuery } from "@/redux/api/courseApi";
import { formatDate, formatPrice, getErrorMessage } from "@/lib/utils";
import type { Course } from "@/lib/types";

export default function AdminCoursesPage() {
  const { data, isLoading } = useGetAdminCoursesQuery();
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation();
  const [target, setTarget] = useState<Course | null>(null);

  const onDelete = async () => {
    if (!target) return;
    try {
      await deleteCourse(target._id).unwrap();
      toast.success(`Deleted "${target.name}"`);
      setTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Courses"
        description="Create, edit and remove courses."
        action={
          <ButtonLink href="/admin/courses/new">
            <Plus className="h-4 w-4" aria-hidden /> New course
          </ButtonLink>
        }
      />

      {isLoading ? (
        <TableSkeleton />
      ) : !data?.courses.length ? (
        <EmptyState
          icon={<BookOpen className="h-5 w-5" />}
          title="No courses yet"
          description="Create your first course. You can add lessons now or come back later."
          action={<ButtonLink href="/admin/courses/new">Create a course</ButtonLink>}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Course</Th>
              <Th>Price</Th>
              <Th>Enrolled</Th>
              <Th>Rating</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.courses.map((c) => (
              <tr key={c._id} className="hover:bg-surface/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      {c.thumbnail?.url && <Image src={c.thumbnail.url} alt="" fill sizes="64px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-xs truncate font-medium">{c.name}</p>
                      <p className="text-xs text-muted">{c.level}</p>
                    </div>
                  </div>
                </Td>
                <Td className="tabular">{formatPrice(c.price)}</Td>
                <Td className="tabular">{c.purchased ?? 0}</Td>
                <Td>
                  {c.ratings ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Stars value={c.ratings} size={12} /> <span className="tabular">{c.ratings.toFixed(1)}</span>
                      <span className="text-muted">({c.reviews?.length ?? 0})</span>
                    </span>
                  ) : (
                    <span className="text-muted">No reviews</span>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-muted">{formatDate(c.createdAt)}</Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Link href={`/courses/${c._id}`} target="_blank" className="rounded-lg p-2 text-muted hover:bg-surface hover:text-fg" aria-label={`View ${c.name}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link href={`/admin/courses/${c._id}/edit`} className="rounded-lg p-2 text-muted hover:bg-surface hover:text-fg" aria-label={`Edit ${c.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button type="button" onClick={() => setTarget(c)} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${c.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmModal
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete this course?"
        description={`"${target?.name ?? ""}" will be removed for everyone, including enrolled learners, and its orders will be deleted. This can't be undone.`}
        confirmLabel="Delete course"
      />
    </>
  );
}
