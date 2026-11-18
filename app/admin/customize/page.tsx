"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-shell";
import { HomeSectionEditor } from "@/components/admin/home-sections-editor";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { Tabs } from "@/components/ui/tabs";
import { useGetLayoutQuery, useSaveLayoutMutation } from "@/redux/api/adminApi";
import { compressImage, getErrorMessage } from "@/lib/utils";
import type { Layout } from "@/lib/types";

function BannerEditor() {
  const { data, isLoading } = useGetLayoutQuery("Banner");
  if (isLoading) return <Skeleton className="h-80 w-full rounded-2xl" />;
  return <BannerForm key={data?.layout?._id ?? "new"} layout={data?.layout ?? null} />;
}

function BannerForm({ layout }: { layout: Layout | null }) {
  const [save, { isLoading: saving }] = useSaveLayoutMutation();
  const banner = layout?.banner;
  const [title, setTitle] = useState(banner?.title ?? "");
  const [subTitle, setSubTitle] = useState(banner?.subTitle ?? "");
  const [image, setImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exists = !!layout;
  const preview = image ?? (removeImage ? undefined : banner?.image?.url);

  return (
    <form
      className="max-w-2xl space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim() || !subTitle.trim()) return toast.error("Add a headline and a subheading");
        try {
          await save({ type: "Banner", exists, title, subTitle, ...(image ? { image } : removeImage ? { removeImage: true } : {}) }).unwrap();
          setImage(null);
          setRemoveImage(false);
          await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/" }) }).catch(() => null);
          toast.success("Homepage hero saved and published.");
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      <p className="text-sm text-muted">
        Until you save a hero, the homepage shows the default headline. Without an image, it shows the learning-curve illustration.
      </p>
      <Field label="Headline">{(id) => <Input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Maths that finally makes sense." />}</Field>
      <Field label="Subheading">{(id) => <Textarea id={id} rows={3} value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />}</Field>
      <div>
        <p className="mb-1.5 text-sm font-medium">Image (optional)</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex aspect-[5/4] w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface text-sm text-muted hover:border-fg/40"
        >
          {preview ? (
            <Image src={preview} alt="Hero image" fill sizes="384px" className="object-cover" unoptimized={!!image} />
          ) : (
            <span className="flex flex-col items-center gap-2 px-6 text-center">
              <ImagePlus className="h-6 w-6" aria-hidden /> Upload image
              <span className="text-xs text-subtle">No image: the homepage shows the learning-curve illustration</span>
            </span>
          )}
        </button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setImage(null);
              setRemoveImage(true);
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden /> Remove image (use the learning-curve illustration)
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setImage(await compressImage(file, 1600));
              setRemoveImage(false);
            } catch (err) {
              toast.error(getErrorMessage(err));
            }
          }}
        />
      </div>
      <Button type="submit" loading={saving}>
        Save hero
      </Button>
    </form>
  );
}

function FaqEditor() {
  const { data, isLoading } = useGetLayoutQuery("FAQ");
  if (isLoading) return <Skeleton className="h-80 w-full rounded-2xl" />;
  return <FaqForm key={data?.layout?._id ?? "new"} layout={data?.layout ?? null} />;
}

function FaqForm({ layout }: { layout: Layout | null }) {
  const [save, { isLoading: saving }] = useSaveLayoutMutation();
  const [items, setItems] = useState<{ question: string; answer: string }[]>(
    () => layout?.faq?.map(({ question, answer }) => ({ question, answer })) ?? [{ question: "", answer: "" }],
  );

  const update = (i: number, key: "question" | "answer", value: string) =>
    setItems((prev) => prev.map((item, j) => (j === i ? { ...item, [key]: value } : item)));

  return (
    <form
      className="max-w-3xl space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const faq = items.filter((i) => i.question.trim() || i.answer.trim());
        if (!faq.length || faq.some((i) => !i.question.trim() || !i.answer.trim())) {
          return toast.error("Every question needs an answer");
        }
        try {
          await save({ type: "FAQ", exists: !!layout, faq }).unwrap();
          toast.success("FAQ saved");
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex gap-2">
            <Input value={item.question} onChange={(e) => update(i, "question", e.target.value)} placeholder="Question" aria-label={`Question ${i + 1}`} className="font-medium" />
            <Button variant="ghost" size="icon" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} aria-label="Remove question">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea rows={3} value={item.answer} onChange={(e) => update(i, "answer", e.target.value)} placeholder="Answer" aria-label={`Answer ${i + 1}`} />
        </div>
      ))}
      <div className="flex gap-3">
        <Button variant="soft" onClick={() => setItems((p) => [...p, { question: "", answer: "" }])}>
          <Plus className="h-4 w-4" aria-hidden /> Add question
        </Button>
        <Button type="submit" loading={saving}>
          Save FAQ
        </Button>
      </div>
    </form>
  );
}

function CategoriesEditor() {
  const { data, isLoading } = useGetLayoutQuery("Categories");
  if (isLoading) return <Skeleton className="h-60 w-full rounded-2xl" />;
  return <CategoriesForm key={data?.layout?._id ?? "new"} layout={data?.layout ?? null} />;
}

function CategoriesForm({ layout }: { layout: Layout | null }) {
  const [save, { isLoading: saving }] = useSaveLayoutMutation();
  const [items, setItems] = useState<string[]>(() => layout?.categories?.map((c) => c.title) ?? []);
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) return toast.error("That category already exists");
    setItems((p) => [...p, value]);
    setDraft("");
  };

  return (
    <div className="max-w-xl space-y-5">
      <p className="text-sm text-muted">Categories appear as filters on the courses page. A course shows under a category when one of its tags matches.</p>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. Algebra"
          aria-label="New category"
        />
        <Button variant="soft" onClick={add}>
          Add
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((c) => (
            <li key={c} className="inline-flex items-center gap-1 rounded-full border border-border py-1 pr-1.5 pl-3.5 text-sm">
              {c}
              <button type="button" onClick={() => setItems((p) => p.filter((i) => i !== c))} className="rounded-full p-1 text-muted hover:bg-surface hover:text-fg" aria-label={`Remove ${c}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button
        loading={saving}
        onClick={async () => {
          if (!items.length) return toast.error("Add at least one category");
          try {
            await save({ type: "Categories", exists: !!layout, categories: items.map((title) => ({ title })) }).unwrap();
            toast.success("Categories saved");
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        }}
      >
        Save categories
      </Button>
    </div>
  );
}

export default function CustomizePage() {
  const [tab, setTab] = useState<"banner" | "steps" | "trust" | "faq" | "categories">("banner");
  return (
    <>
      <PageHeader title="Homepage" description="Edit the hero, the homepage sections, FAQ and course categories." />
      <Tabs
        label="Homepage sections"
        value={tab}
        onChange={setTab}
        items={[
          { value: "banner", label: "Hero" },
          { value: "steps", label: "How it works" },
          { value: "trust", label: "What you can count on" },
          { value: "faq", label: "FAQ" },
          { value: "categories", label: "Categories" },
        ]}
      />
      <div className="pt-8">
        {tab === "banner" && <BannerEditor />}
        {tab === "steps" && <HomeSectionEditor key="steps" part="howItWorks" />}
        {tab === "trust" && <HomeSectionEditor key="trust" part="trust" />}
        {tab === "faq" && <FaqEditor />}
        {tab === "categories" && <CategoriesEditor />}
      </div>
    </>
  );
}
