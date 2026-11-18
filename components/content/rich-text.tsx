import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tiny, safe formatter for admin-written text. No HTML is ever injected:
 *   blank line   → new paragraph
 *   "- " / "* "  → bullet list      "1. " → numbered list
 *   "### Title"  → small heading
 *   **bold**, _italic_, [text](/link or https://…)
 */

const INLINE = /(\*\*[^*]+\*\*|(?<!\w)_[^_\s][^_]*_(?!\w)|\[[^\]]+\]\([^)\s]+\))/g;

function safeHref(href: string) {
  if (/^\/(?!\/)/.test(href) || /^#/.test(href)) return { href, internal: true };
  if (/^(https?:|mailto:|tel:)/i.test(href)) return { href, internal: false };
  return null;
}

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="font-semibold text-fg">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const target = safeHref(link[2]!);
      if (!target) return <Fragment key={i}>{link[1]}</Fragment>;
      const cls = "font-medium text-fg underline underline-offset-4 hover:text-muted";
      return target.internal ? (
        <Link key={i} href={target.href} className={cls}>{link[1]}</Link>
      ) : (
        <a key={i} href={target.href} className={cls} target="_blank" rel="noopener noreferrer">{link[1]}</a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return (
    <div className={cn("space-y-4 leading-relaxed text-muted", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 marker:text-subtle">
              {lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>)}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-2 pl-5 marker:text-subtle">
              {lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>)}
            </ol>
          );
        }
        if (lines.length === 1 && /^#{2,4}\s+/.test(lines[0]!)) {
          return <h3 key={i} className="pt-2 font-sans text-base font-semibold text-fg">{lines[0]!.replace(/^#{2,4}\s+/, "")}</h3>;
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
