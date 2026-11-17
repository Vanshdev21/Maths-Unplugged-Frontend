"use client";

import { CheckCircle2, Circle, FileText, PlayCircle } from "lucide-react";
import { cn, formatDuration, groupBySection } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

interface Props {
  lessons: Lesson[];
  currentId?: string;
  completed: Set<string>;
  onSelect: (lesson: Lesson) => void;
  onToggle: (lessonId: string) => void;
}

export function LessonList({ lessons, currentId, completed, onSelect, onToggle }: Props) {
  const sections = groupBySection(lessons);

  return (
    <nav aria-label="Course lessons" className="divide-y divide-border">
      {sections.map((section) => {
        const done = section.lessons.filter((l) => completed.has(l._id)).length;
        return (
          <div key={section.title}>
            <div className="sticky top-0 z-10 flex items-baseline justify-between gap-3 bg-surface px-4 py-3">
              <h3 className="font-sans text-sm font-semibold">{section.title}</h3>
              <span className="shrink-0 text-xs text-muted tabular">
                {done}/{section.lessons.length}
              </span>
            </div>
            <ul>
              {section.lessons.map((lesson) => {
                const active = lesson._id === currentId;
                const isDone = completed.has(lesson._id);
                return (
                  <li key={lesson._id} className={cn("flex items-start gap-1 border-l-2", active ? "border-brand-line bg-brand-soft" : "border-transparent")}>
                    <button
                      type="button"
                      onClick={() => onToggle(lesson._id)}
                      className="mt-2.5 ml-2 shrink-0 rounded-full p-1 text-muted hover:text-fg"
                      aria-label={isDone ? `Mark "${lesson.title}" as not done` : `Mark "${lesson.title}" as done`}
                      aria-pressed={isDone}
                    >
                      {isDone ? <CheckCircle2 className="h-[18px] w-[18px] text-success" /> : <Circle className="h-[18px] w-[18px]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelect(lesson)}
                      aria-current={active ? "true" : undefined}
                      className="flex flex-1 flex-col items-start gap-1 py-3 pr-4 pl-1.5 text-left"
                    >
                      <span className={cn("text-sm leading-snug", active ? "font-semibold" : "text-fg/90")}>
                        {lesson.index + 1}. {lesson.title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        {lesson.contentType === "document" ? (
                          <>
                            <FileText className="h-3 w-3" aria-hidden />
                            {lesson.videoLength > 0 ? `${formatDuration(lesson.videoLength)} read` : "Notes"}
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-3 w-3" aria-hidden /> {formatDuration(lesson.videoLength)}
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
