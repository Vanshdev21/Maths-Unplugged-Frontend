"use client";

import { useCallback, useMemo } from "react";
import { setLastLesson, toggleLesson } from "@/redux/features/progressSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUserId } from "@/lib/utils";

export function useCourseProgress(courseId: string) {
  const user = useAppSelector((s) => s.auth.user);
  const key = `${getUserId(user)}:${courseId}`;
  const completedList = useAppSelector((s) => s.progress.completed[key]);
  const lastLesson = useAppSelector((s) => s.progress.lastLesson[key]);
  const dispatch = useAppDispatch();

  const completed = useMemo(() => new Set<string>(completedList ?? []), [completedList]);

  const toggle = useCallback(
    (lessonId: string, done?: boolean) => dispatch(toggleLesson({ key, lessonId, done })),
    [dispatch, key],
  );
  const setLast = useCallback((lessonId: string) => dispatch(setLastLesson({ key, lessonId })), [dispatch, key]);

  return { completed, lastLesson, toggle, setLast };
}

/** Read-only progress for course lists. */
export function useProgressPercent(courseId: string, totalLessons: number) {
  const user = useAppSelector((s) => s.auth.user);
  const count = useAppSelector((s) => s.progress.completed[`${getUserId(user)}:${courseId}`]?.length ?? 0);
  if (!totalLessons) return 0;
  return Math.min(100, Math.round((count / totalLessons) * 100));
}
