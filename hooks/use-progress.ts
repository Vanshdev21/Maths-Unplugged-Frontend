"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGetProgressQuery, useUpdateProgressMutation } from "@/redux/api/courseApi";
import { useAuth } from "@/redux/hooks";
import { LEGACY_PROGRESS_KEY } from "@/redux/store";
import { getUserId } from "@/lib/utils";

/** Lesson progress for one course, saved to the learner's account. */
export function useCourseProgress(courseId: string) {
  const { isAuthenticated } = useAuth();
  const { data } = useGetProgressQuery(undefined, { skip: !isAuthenticated });
  const [update] = useUpdateProgressMutation();
  const entry = data?.progress.find((p) => p.courseId === courseId);

  const completed = useMemo(() => new Set<string>(entry?.completed ?? []), [entry]);
  const lastLesson = entry?.lastLesson ?? undefined;

  // Keep the latest "last lesson" in a ref so setLast doesn't resend it.
  const lastRef = useRef(lastLesson);
  useEffect(() => {
    lastRef.current = lastLesson;
  }, [lastLesson]);

  const toggle = useCallback(
    (lessonId: string, done?: boolean) => {
      update({ courseId, lessonId, done: done ?? !completed.has(lessonId) });
    },
    [completed, courseId, update],
  );

  const setLast = useCallback(
    (lessonId: string) => {
      if (lastRef.current === lessonId) return;
      lastRef.current = lessonId;
      update({ courseId, lessonId, last: true });
    },
    [courseId, update],
  );

  return { completed, lastLesson, toggle, setLast, ready: !!data };
}

/** Read-only progress for course lists. */
export function useProgressPercent(courseId: string, totalLessons: number) {
  const { isAuthenticated } = useAuth();
  const { data } = useGetProgressQuery(undefined, { skip: !isAuthenticated });
  const count = data?.progress.find((p) => p.courseId === courseId)?.completed.length ?? 0;
  if (!totalLessons) return 0;
  return Math.min(100, Math.round((count / totalLessons) * 100));
}

/**
 * One-time upload of progress that older versions saved only on this device.
 * Runs after login, then removes the old local copy.
 */
export function useMigrateLocalProgress() {
  const { user, isAuthenticated } = useAuth();
  const [update] = useUpdateProgressMutation();
  const done = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || done.current) return;
    done.current = true;
    try {
      const raw = window.localStorage.getItem(LEGACY_PROGRESS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { completed?: Record<string, string[]> };
      const prefix = `${getUserId(user)}:`;
      const jobs = Object.entries(saved.completed ?? {})
        .filter(([key, ids]) => key.startsWith(prefix) && ids.length)
        .map(([key, ids]) => update({ courseId: key.slice(prefix.length), completed: ids }).unwrap().catch(() => undefined));
      Promise.all(jobs).finally(() => window.localStorage.removeItem(LEGACY_PROGRESS_KEY));
    } catch {
      /* corrupted or unavailable storage: nothing to migrate */
    }
  }, [isAuthenticated, user, update]);
}
