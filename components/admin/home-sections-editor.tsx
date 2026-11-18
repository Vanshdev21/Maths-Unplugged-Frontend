"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { HOME_ICONS } from "@/components/home/home-icons";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useGetHomeContentQuery, useSaveHomeContentMutation } from "@/redux/api/adminApi";
import { defaultHomeContent } from "@/lib/page-defaults";
import { cn, getErrorMessage } from "@/lib/utils";
import type { HomeContent, HomeIcon } from "@/lib/types";

type Part = "howItWorks" | "trust";

/** Edits one homepage section; both share one saved record, so we save the whole thing. */
export function HomeSectionEditor({ part }: { part: Part }) {
  const { data, isLoading } = useGetHomeContentQuery();
  if (isLoading) return <Skeleton className="h-80 w-full rounded-2xl" />;
  const saved = data?.content ?? null;
  return <HomeSectionForm key={`${part}-${saved?.updatedAt ?? "default"}`} part={part} saved={saved} />;
}

function move<T>(list: T[], index: number, by: -1 | 1) {
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(index + by, 0, item!);
  return next;
}

function RowControls({ index, count, onMove, onDelete, min }: { index: number; count: number; onMove: (by: -1 | 1) => void; onDelete: () => void; min: number }) {
  return (
    <div className="flex gap-1">
      <Button type="button" variant="ghost" size="icon" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="Delete" disabled={count <= min} onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function HomeSectionForm({ part, saved }: { part: Part; saved: HomeContent | null }) {
  const [content, setContent] = useState<HomeContent>(() => structuredClone(saved ?? defaultHomeContent()));
  const [save, { isLoading: saving }] = useSaveHomeContentMutation();
  const how = content.howItWorks;
  const trust = content.trust;
  const setHow = (patch: Partial<HomeContent["howItWorks"]>) => setContent((c) => ({ ...c, howItWorks: { ...c.howItWorks, ...patch } }));
  const setTrust = (patch: Partial<HomeContent["trust"]>) => setContent((c) => ({ ...c, trust: { ...c.trust, ...patch } }));

  return (
    <form
      className="max-w-3xl space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const { howItWorks, trust: t } = content;
        if (!howItWorks.heading.trim() || !t.heading.trim()) return toast.error("Add a heading");
        if (howItWorks.steps.some((s) => !s.title.trim())) return toast.error("Every step needs a title");
        if (t.items.some((s) => !s.title.trim())) return toast.error("Every card needs a title");
        try {
          await save({ howItWorks, trust: t }).unwrap();
          await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/" }) }).catch(() => null);
          toast.success("Saved. The homepage is updated.");
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <span>{saved ? "Showing your saved text." : "Showing the default text. Nothing saved yet."}</span>
        <a href={part === "howItWorks" ? "/#how-it-works" : "/"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-fg underline-offset-4 hover:underline">
          View homepage <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>

      {part === "howItWorks" ? (
        <>
          <Field label="Heading">{(id) => <Input id={id} value={how.heading} maxLength={120} onChange={(e) => setHow({ heading: e.target.value })} />}</Field>
          <Field label="Intro (optional)">{(id) => <Textarea id={id} rows={2} maxLength={400} value={how.subtitle} onChange={(e) => setHow({ subtitle: e.target.value })} />}</Field>

          <div className="space-y-4">
            <p className="text-sm font-semibold">Steps (1 to 4, numbered automatically)</p>
            {how.steps.map((s, i) => (
              <fieldset key={i} className="space-y-3 rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <legend className="text-sm font-semibold">Step {i + 1}</legend>
                  <RowControls
                    index={i}
                    count={how.steps.length}
                    min={1}
                    onMove={(by) => setHow({ steps: move(how.steps, i, by) })}
                    onDelete={() => setHow({ steps: how.steps.filter((_, j) => j !== i) })}
                  />
                </div>
                <Field label="Title">{(id) => <Input id={id} value={s.title} maxLength={60} onChange={(e) => setHow({ steps: how.steps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />}</Field>
                <Field label="Text">{(id) => <Textarea id={id} rows={2} maxLength={300} value={s.text} onChange={(e) => setHow({ steps: how.steps.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />}</Field>
              </fieldset>
            ))}
            {how.steps.length < 4 && (
              <Button type="button" variant="outline" size="sm" onClick={() => setHow({ steps: [...how.steps, { title: "", text: "" }] })}>
                <Plus className="h-4 w-4" aria-hidden /> Add step
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <Field label="Heading">{(id) => <Input id={id} value={trust.heading} maxLength={120} onChange={(e) => setTrust({ heading: e.target.value })} />}</Field>
          <Field label="Intro (optional)">{(id) => <Textarea id={id} rows={2} maxLength={400} value={trust.subtitle} onChange={(e) => setTrust({ subtitle: e.target.value })} />}</Field>

          <div className="space-y-4">
            <p className="text-sm font-semibold">Cards (1 to 8)</p>
            {trust.items.map((s, i) => (
              <fieldset key={i} className="space-y-3 rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <legend className="text-sm font-semibold">Card {i + 1}</legend>
                  <RowControls
                    index={i}
                    count={trust.items.length}
                    min={1}
                    onMove={(by) => setTrust({ items: move(trust.items, i, by) })}
                    onDelete={() => setTrust({ items: trust.items.filter((_, j) => j !== i) })}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium">Icon</p>
                  <div role="radiogroup" aria-label={`Icon for card ${i + 1}`} className="flex flex-wrap gap-1.5">
                    {HOME_ICONS.map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={s.icon === value}
                        title={label}
                        aria-label={label}
                        onClick={() => setTrust({ items: trust.items.map((x, j) => (j === i ? { ...x, icon: value as HomeIcon } : x)) })}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                          s.icon === value ? "border-fg bg-fg text-bg" : "border-border text-muted hover:text-fg",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Title">{(id) => <Input id={id} value={s.title} maxLength={60} onChange={(e) => setTrust({ items: trust.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />}</Field>
                <Field label="Text">{(id) => <Textarea id={id} rows={2} maxLength={300} value={s.text} onChange={(e) => setTrust({ items: trust.items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />}</Field>
              </fieldset>
            ))}
            {trust.items.length < 8 && (
              <Button type="button" variant="outline" size="sm" onClick={() => setTrust({ items: [...trust.items, { icon: "check", title: "", text: "" }] })}>
                <Plus className="h-4 w-4" aria-hidden /> Add card
              </Button>
            )}
          </div>
        </>
      )}

      <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-3 border-t border-border bg-bg/95 px-1 py-4 backdrop-blur">
        <Button type="submit" loading={saving}>
          Save and publish
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (!window.confirm("Put back the default text for this section? Nothing is saved until you click Save.")) return;
            const d = defaultHomeContent();
            setContent((c) => (part === "howItWorks" ? { ...c, howItWorks: d.howItWorks } : { ...c, trust: d.trust }));
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Load default text
        </Button>
      </div>
    </form>
  );
}
