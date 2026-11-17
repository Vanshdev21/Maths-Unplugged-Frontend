"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, ExternalLink, Lock, Menu, X } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { Tabs } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { VideoPlayer } from "@/components/course/video-player";
import { DocumentViewer } from "@/components/course/document-viewer";
import { LessonList } from "@/components/player/lesson-list";
import { QnA } from "@/components/player/qna";
import { ReviewForm } from "@/components/player/review-form";
import { useGetCourseContentQuery } from "@/redux/api/courseApi";
import { useCourseProgress } from "@/hooks/use-progress";
import { cn, formatDuration, getErrorMessage } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

type Tab = "overview" | "resources" | "qna" | "review";

export function Player() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useGetCourseContentQuery(id);
  const { completed, lastLesson, toggle, setLast, ready: progressReady } = useCourseProgress(id);
  const [tab, setTab] = useState<Tab>("overview");
  const [drawer, setDrawer] = useState(false);

  const lessons = useMemo(() => data?.course.courseData ?? [], [data]);
  const requested = searchParams.get("lesson");
  const currentIndex = useMemo(() => {
    const target = requested ?? lastLesson;
    const i = lessons.findIndex((l) => l._id === target);
    return i >= 0 ? i : 0;
  }, [lessons, requested, lastLesson]);
  const lesson = lessons[currentIndex];

  // Wait for saved progress before recording, so we don't overwrite it.
  useEffect(() => {
    if (lesson && progressReady) setLast(lesson._id);
  }, [lesson, progressReady, setLast]);

  const go = useCallback(
    (target?: Lesson) => {
      if (!target) return;
      setDrawer(false);
      router.replace(`/course-access/${id}?lesson=${target._id}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [id, router],
  );

  const percent = lessons.length ? Math.round((lessons.filter((l) => completed.has(l._id)).length / lessons.length) * 100) : 0;

  const status = (error as { status?: number } | undefined)?.status;

  if (isError) {
    return (
      <Shell title="Course" percent={0}>
        <div className="mx-auto max-w-xl px-5 py-20">
          {status === 403 ? (
            <EmptyState
              icon={<Lock className="h-5 w-5" />}
              title="You're not enrolled in this course"
              description="Enrol to unlock every lesson, the Q&A and course resources."
              action={<ButtonLink href={`/courses/${id}`}>View course</ButtonLink>}
            />
          ) : (
            <EmptyState
              title={status === 404 ? "Course not found" : "This course couldn't be loaded"}
              description={status === 404 ? "It may have been removed." : getErrorMessage(error)}
              action={
                status === 404 ? (
                  <ButtonLink href="/my-courses">Go to my courses</ButtonLink>
                ) : (
                  <Button variant="outline" onClick={() => refetch()}>
                    Try again
                  </Button>
                )
              }
            />
          )}
        </div>
      </Shell>
    );
  }

  if (isLoading || !data) {
    return (
      <Shell title="Loading…" percent={0}>
        <div className="grid gap-6 p-4 lg:grid-cols-[1fr_380px] lg:p-6">
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="hidden h-[60vh] rounded-2xl lg:block" />
        </div>
      </Shell>
    );
  }

  if (!lesson) {
    return (
      <Shell title={data.course.name} percent={0}>
        <div className="mx-auto max-w-xl px-5 py-20">
          <EmptyState title="No lessons yet" description="The first lessons are being uploaded. Check back soon." />
        </div>
      </Shell>
    );
  }

  const prev = lessons[currentIndex - 1];
  const next = lessons[currentIndex + 1];
  const isDone = completed.has(lesson._id);

  const list = (
    <LessonList lessons={lessons} currentId={lesson._id} completed={completed} onSelect={go} onToggle={(lid) => toggle(lid)} />
  );

  return (
    <Shell title={data.course.name} percent={percent} onOpenLessons={() => setDrawer(true)}>
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 px-4 pt-4 pb-16 sm:px-6 lg:pt-6">
          {lesson.contentType === "document" ? (
            <DocumentViewer key={lesson._id} courseId={id} lesson={lesson} />
          ) : (
            <VideoPlayer
              url={lesson.videoUrl}
              player={lesson.videoPlayer}
              title={lesson.title}
              onEnded={() => {
                toggle(lesson._id, true);
                if (next) go(next);
              }}
            />
          )}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-muted">
                {lesson.videoSection}
                <span className="mx-2" aria-hidden>
                  /
                </span>
                Lesson {currentIndex + 1} of {lessons.length}
                {lesson.videoLength > 0 &&
                  `, ${formatDuration(lesson.videoLength)}${lesson.contentType === "document" ? " read" : ""}`}
              </p>
              <h1 className="mt-1.5 text-2xl leading-tight font-bold sm:text-3xl">{lesson.title}</h1>
            </div>
            <Button
              variant={isDone ? "soft" : "outline"}
              size="sm"
              onClick={() => toggle(lesson._id)}
              aria-pressed={isDone}
              className={cn("self-start", isDone && "text-success")}
            >
              <Check className="h-4 w-4" aria-hidden /> {isDone ? "Completed" : "Mark as complete"}
            </Button>
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => go(prev)} disabled={!prev}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
            </Button>
            <Button
              variant="dark"
              size="sm"
              onClick={() => {
                toggle(lesson._id, true);
                go(next);
              }}
              disabled={!next}
            >
              Next lesson <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          <div className="mt-10">
            <Tabs
              label="Lesson sections"
              value={tab}
              onChange={setTab}
              items={[
                { value: "overview", label: "Overview" },
                { value: "resources", label: `Resources${lesson.links?.length ? ` (${lesson.links.length})` : ""}` },
                { value: "qna", label: `Q&A${lesson.questions?.length ? ` (${lesson.questions.length})` : ""}` },
                { value: "review", label: "Review" },
              ]}
            />
            <div className="pt-8">
              {tab === "overview" && (
                <div className="max-w-prose space-y-6">
                  <p className="leading-relaxed whitespace-pre-line text-fg/90">{lesson.description || "No notes for this lesson."}</p>
                  {lesson.suggestion && (
                    <div className="rounded-xl border-l-4 border-brand-line bg-brand-soft px-5 py-4">
                      <p className="text-sm font-semibold">Teacher&apos;s tip</p>
                      <p className="mt-1 leading-relaxed whitespace-pre-line">{lesson.suggestion}</p>
                    </div>
                  )}
                </div>
              )}
              {tab === "resources" &&
                (lesson.links?.length ? (
                  <ul className="max-w-xl divide-y divide-border rounded-2xl border border-border">
                    {lesson.links.map((link) => (
                      <li key={link._id ?? link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface"
                        >
                          <span className="font-medium">{link.title}</span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-muted" aria-label="Opens in a new tab" />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">This lesson has no extra resources.</p>
                ))}
              {tab === "qna" && <QnA courseId={id} lesson={lesson} />}
              {tab === "review" && <ReviewForm courseId={id} />}
            </div>
          </div>
        </div>

        <aside className="hidden border-l border-border lg:block">
          <div className="scrollbar-thin sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">{list}</div>
        </aside>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Lessons">
          <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} aria-label="Close lessons" />
          <div className="absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col bg-bg shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <p className="font-semibold">Lessons</p>
              <button type="button" onClick={() => setDrawer(false)} className="rounded-lg p-2 hover:bg-surface" aria-label="Close lessons">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto">{list}</div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({
  title,
  percent,
  onOpenLessons,
  children,
}: {
  title: string;
  percent: number;
  onOpenLessons?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Maths Unplugged home">
            <LogoMark size={30} />
          </Link>
          <Link
            href="/my-courses"
            className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:text-fg sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> My courses
          </Link>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <p className="min-w-0 flex-1 truncate font-medium">{title}</p>
          <div className="hidden items-center gap-3 md:flex" title="Your progress">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-brand-line" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-sm text-muted tabular">{percent}%</span>
          </div>
          <ThemeToggle />
          {onOpenLessons && (
            <button type="button" onClick={onOpenLessons} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-surface lg:hidden">
              <Menu className="h-4 w-4" aria-hidden /> Lessons
            </button>
          )}
        </div>
      </header>
      <main id="main">{children}</main>
    </div>
  );
}
