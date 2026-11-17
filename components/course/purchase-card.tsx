"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Infinity as InfinityIcon, MessagesSquare, PlayCircle, ShieldCheck, Smartphone } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/misc";
import { CourseThumb } from "./course-card";
import { VideoPlayer } from "./video-player";
import { useEnroll } from "@/hooks/use-razorpay";
import { useAuth } from "@/redux/hooks";
import { coursePrice, discountPercent, formatPrice, isEnrolled } from "@/lib/utils";
import type { Course } from "@/lib/types";

export function PurchaseCard({ course }: { course: Course }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const { enroll, busy } = useEnroll();
  const [preview, setPreview] = useState(false);

  const enrolled = isEnrolled(user, course._id);
  const price = coursePrice(course);
  const off = price ? discountPercent(price, course.estimatedPrice) : 0;
  const accessHref = `/course-access/${course._id}`;

  const onEnroll = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${course._id}`)}`);
      return;
    }
    enroll({ ...course, price }, user, () => router.push(accessHref));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg">
      <div className="relative">
        <CourseThumb course={course} priority />
        {course.demoUrl && (
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 text-white transition hover:bg-black/45"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium backdrop-blur">
              <PlayCircle className="h-5 w-5" aria-hidden /> Watch preview
            </span>
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular">{formatPrice(price)}</span>
          {off > 0 && (
            <>
              <span className="text-subtle line-through tabular">{formatPrice(course.estimatedPrice)}</span>
              <span className="text-sm font-semibold text-success">{off}% off</span>
            </>
          )}
        </div>

        <div className="mt-5">
          {status === "loading" ? (
            <Skeleton className="h-13 w-full rounded-xl" />
          ) : enrolled ? (
            <ButtonLink href={accessHref} size="lg" variant="dark" className="w-full">
              Go to course
            </ButtonLink>
          ) : (
            <Button size="lg" className="w-full" loading={busy} onClick={onEnroll}>
              {price > 0 ? (user ? "Buy now" : "Log in to buy") : user ? "Enrol for free" : "Log in to enrol"}
            </Button>
          )}
        </div>

        {enrolled && (
          <p className="mt-3 flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> You&apos;re enrolled in this course
          </p>
        )}

        <ul className="mt-6 space-y-3 text-sm text-muted">
          <li className="flex items-center gap-3">
            <InfinityIcon className="h-4 w-4 text-fg" aria-hidden /> Unlimited access to all lessons
          </li>
          <li className="flex items-center gap-3">
            <MessagesSquare className="h-4 w-4 text-fg" aria-hidden /> Ask questions under every lesson
          </li>
          <li className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-fg" aria-hidden /> Watch on phone, tablet or laptop
          </li>
          {price > 0 && (
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-fg" aria-hidden /> Secure checkout by Razorpay
            </li>
          )}
        </ul>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} title={course.name} description="Free preview" className="max-w-3xl">
        <VideoPlayer url={course.demoUrl} title={`${course.name} preview`} autoPlay />
      </Modal>
    </div>
  );
}
