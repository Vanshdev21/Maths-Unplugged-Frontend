import { ChevronDown, FileText, Lock, PlayCircle } from "lucide-react";
import { formatDuration, groupBySection } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

export function Curriculum({ lessons }: { lessons: Partial<Lesson>[] }) {
  const sections = groupBySection(lessons);
  if (!sections.length) return <p className="text-muted">Lessons will be listed here soon.</p>;

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {sections.map((section, i) => (
        <details key={section.title} open={i === 0} className="group border-b border-border last:border-b-0">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-surface px-5 py-4 [&::-webkit-details-marker]:hidden">
            <span className="font-semibold">{section.title}</span>
            <span className="flex items-center gap-3 text-sm text-muted">
              <span className="hidden tabular sm:inline">
                {section.lessons.length} {section.lessons.length === 1 ? "lesson" : "lessons"}
                {section.minutes > 0 && `, ${formatDuration(section.minutes)}`}
              </span>
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden />
            </span>
          </summary>
          <ul>
            {section.lessons.map((lesson) => (
              <li key={lesson._id ?? lesson.index} className="flex items-center gap-3 border-t border-border px-5 py-3.5 text-[15px]">
                {lesson.contentType === "document" ? (
                  <FileText className="h-4 w-4 shrink-0 text-muted" aria-label="Notes" />
                ) : (
                  <PlayCircle className="h-4 w-4 shrink-0 text-muted" aria-label="Video" />
                )}
                <span className="flex-1">{lesson.title}</span>
                {!!lesson.videoLength && <span className="text-sm text-muted tabular">{formatDuration(lesson.videoLength)}</span>}
                <Lock className="h-3.5 w-3.5 text-subtle" aria-label="Unlocks after enrolment" />
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
