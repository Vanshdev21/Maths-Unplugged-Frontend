"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useGetPageQuery, useSavePageMutation, type PageImageInput } from "@/redux/api/adminApi";
import { defaultPage } from "@/lib/page-defaults";
import { PAYMENTS_ENABLED } from "@/lib/site";
import { compressImage, getErrorMessage } from "@/lib/utils";
import type { PageSlug, SitePage } from "@/lib/types";

interface SectionDraft {
  key: string;
  heading: string;
  body: string;
  image: PageImageInput;
}

const newKey = () => crypto.randomUUID();

function toDraft(page: SitePage) {
  return {
    title: page.title,
    subtitle: page.subtitle ?? "",
    heroImage: (page.heroImage ?? null) as PageImageInput,
    highlights: page.highlights.map((h) => ({ ...h })),
    sections: page.sections.map<SectionDraft>((s) => ({ key: s._id ?? newKey(), heading: s.heading, body: s.body, image: s.image ?? null })),
    cta: { text: page.cta?.text ?? "", href: page.cta?.href ?? "" },
    showContact: page.showContact,
  };
}

const imageSrc = (img: PageImageInput) => (typeof img === "string" ? img : img?.url ?? null);

/* ------------------------------------------------------------- image picker */

function ImagePicker({ value, onChange, label, aspect = "aspect-[4/3]" }: { value: PageImageInput; onChange: (v: PageImageInput) => void; label: string; aspect?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const src = imageSrc(value);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="relative w-full max-w-xs">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className={`relative flex ${aspect} w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface text-sm text-muted hover:border-fg/40`}
        >
          {src ? (
            <Image src={src} alt="" fill sizes="320px" className="object-cover" unoptimized={typeof value === "string"} />
          ) : (
            <span className="flex flex-col items-center gap-2">
              <ImagePlus className="h-5 w-5" aria-hidden /> {busy ? "Preparing…" : "Add image (optional)"}
            </span>
          )}
        </button>
        {src && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg text-muted shadow-sm hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onChange(await compressImage(file, 1800, 0.85, true));
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ editor */

export function PageEditor({ slug }: { slug: PageSlug }) {
  const { data, isLoading } = useGetPageQuery(slug);
  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  const saved = data?.page ?? null;
  return <PageForm key={`${slug}-${saved?.updatedAt ?? "default"}`} slug={slug} saved={saved} />;
}

function PageForm({ slug, saved }: { slug: PageSlug; saved: SitePage | null }) {
  const isAbout = slug === "about";
  const [draft, setDraft] = useState(() => toDraft(saved ?? defaultPage(slug)));
  const [savePage, { isLoading: saving }] = useSavePageMutation();
  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const updateSection = (key: string, patch: Partial<SectionDraft>) =>
    set("sections", draft.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const moveSection = (index: number, by: -1 | 1) => {
    const next = [...draft.sections];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item!);
    set("sections", next);
  };

  const path = `/${slug}`;

  return (
    <form
      className="max-w-3xl space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!draft.title.trim()) return toast.error("Add a page title");
        if (draft.sections.some((s) => !s.heading.trim())) return toast.error("Every section needs a heading");
        if ((draft.cta.text.trim() && !draft.cta.href.trim()) || (!draft.cta.text.trim() && draft.cta.href.trim())) {
          return toast.error("Fill in both the button text and its link, or leave both empty");
        }
        try {
          await savePage({
            slug,
            page: {
              title: draft.title,
              subtitle: draft.subtitle,
              heroImage: isAbout ? draft.heroImage : null,
              highlights: isAbout ? draft.highlights.filter((h) => h.value.trim() || h.label.trim()) : [],
              sections: draft.sections.map((s) => ({ heading: s.heading, body: s.body, image: isAbout ? s.image : null })),
              cta: isAbout ? draft.cta : { text: "", href: "" },
              showContact: draft.showContact,
            },
          }).unwrap();
          // Refresh the public page now instead of waiting for the cache.
          await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }) }).catch(() => null);
          toast.success("Page saved and published");
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className={saved ? "text-muted" : "rounded-full bg-surface px-3 py-1 text-muted"}>
          {saved ? `Last saved ${new Date(saved.updatedAt ?? "").toLocaleString("en-IN")}` : "Showing the default text. Nothing saved yet."}
        </span>
        <a href={path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline">
          View page <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        {slug === "refund-policy" && !PAYMENTS_ENABLED && (
          <span className="text-muted">This page is hidden on the site while payments are off.</span>
        )}
      </div>

      {/* ----- Top of page ----- */}
      <fieldset className="space-y-5 rounded-2xl border border-border p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold">Top of the page</legend>
        <Field label="Title">{(id) => <Input id={id} value={draft.title} maxLength={120} onChange={(e) => set("title", e.target.value)} />}</Field>
        <Field label="Short intro (optional)" hint="Shown under the title and used by Google as the page description.">
          {(id, d) => <Textarea id={id} aria-describedby={d} rows={3} maxLength={400} value={draft.subtitle} onChange={(e) => set("subtitle", e.target.value)} />}
        </Field>
        {isAbout && <ImagePicker label="Hero image" value={draft.heroImage} onChange={(v) => set("heroImage", v)} />}
      </fieldset>

      {/* ----- Highlights (About) ----- */}
      {isAbout && (
        <fieldset className="space-y-4 rounded-2xl border border-border p-5 sm:p-6">
          <legend className="px-2 text-sm font-semibold">Highlights</legend>
          <p className="text-sm text-muted">Up to 6 short facts shown as cards, e.g. &quot;2,000+&quot; / &quot;students taught&quot;.</p>
          {draft.highlights.map((h, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label={i === 0 ? "Big text" : " "} className="w-36 shrink-0">
                {(id) => <Input id={id} value={h.value} maxLength={20} onChange={(e) => set("highlights", draft.highlights.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />}
              </Field>
              <Field label={i === 0 ? "Label" : " "} className="flex-1">
                {(id) => <Input id={id} value={h.label} maxLength={60} onChange={(e) => set("highlights", draft.highlights.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />}
              </Field>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove highlight" onClick={() => set("highlights", draft.highlights.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {draft.highlights.length < 6 && (
            <Button type="button" variant="outline" size="sm" onClick={() => set("highlights", [...draft.highlights, { value: "", label: "" }])}>
              <Plus className="h-4 w-4" aria-hidden /> Add highlight
            </Button>
          )}
        </fieldset>
      )}

      {/* ----- Sections ----- */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Sections</h2>
          <p className="mt-1 text-sm text-muted">
            Formatting: leave an empty line for a new paragraph, start lines with <code>- </code> for bullets, <code>**bold**</code>, <code>_italic_</code>, and{" "}
            <code>[link text](/courses)</code> for links.
          </p>
        </div>

        {draft.sections.map((s, i) => (
          <fieldset key={s.key} className="space-y-4 rounded-2xl border border-border p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <legend className="text-sm font-semibold">Section {i + 1}</legend>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} onClick={() => moveSection(i, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Move down" disabled={i === draft.sections.length - 1} onClick={() => moveSection(i, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete section"
                  onClick={() => {
                    if (s.body.trim() && !window.confirm(`Delete the section "${s.heading || "Untitled"}"?`)) return;
                    set("sections", draft.sections.filter((x) => x.key !== s.key));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Field label="Heading">{(id) => <Input id={id} value={s.heading} maxLength={160} onChange={(e) => updateSection(s.key, { heading: e.target.value })} />}</Field>
            <Field label="Text">{(id) => <Textarea id={id} rows={7} value={s.body} maxLength={20000} onChange={(e) => updateSection(s.key, { body: e.target.value })} />}</Field>
            {isAbout && <ImagePicker label="Image beside this section" value={s.image} onChange={(v) => updateSection(s.key, { image: v })} />}
          </fieldset>
        ))}

        <Button type="button" variant="outline" onClick={() => set("sections", [...draft.sections, { key: newKey(), heading: "", body: "", image: null }])}>
          <Plus className="h-4 w-4" aria-hidden /> Add section
        </Button>
      </div>

      {/* ----- Button + contact ----- */}
      <fieldset className="space-y-5 rounded-2xl border border-border p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold">End of the page</legend>
        {isAbout && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button text (optional)">{(id) => <Input id={id} value={draft.cta.text} maxLength={60} placeholder="Browse courses" onChange={(e) => set("cta", { ...draft.cta, text: e.target.value })} />}</Field>
            <Field label="Button link">{(id) => <Input id={id} value={draft.cta.href} maxLength={300} placeholder="/courses" onChange={(e) => set("cta", { ...draft.cta, href: e.target.value })} />}</Field>
          </div>
        )}
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" checked={draft.showContact} onChange={(e) => set("showContact", e.target.checked)} />
          Show the support email at the end
        </label>
      </fieldset>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-3 border-t border-border bg-bg/95 px-1 py-4 backdrop-blur">
        <Button type="submit" loading={saving}>
          Save and publish
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (window.confirm("Replace the form with the default text? Nothing is saved until you click Save.")) setDraft(toDraft(defaultPage(slug)));
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Load default text
        </Button>
      </div>
    </form>
  );
}
