"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, Link2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { VideoPlayer } from "@/components/course/video-player";
import { useCreateCourseMutation, useEditCourseMutation, type CoursePayload } from "@/redux/api/courseApi";
import { cn, compressImage, formatDuration, getErrorMessage } from "@/lib/utils";
import { LEVELS } from "@/lib/site";
import type { Course } from "@/lib/types";

const url = z.string().trim().url("Enter a full URL starting with https://");

const lessonSchema = z.object({
  _id: z.string().optional(),
  // Kept as-is so editing a lesson never drops learner questions.
  questions: z.array(z.unknown()).optional(),
  title: z.string().trim().min(1, "Lesson title is required"),
  description: z.string().trim().min(1, "Add a short description"),
  videoSection: z.string().trim().min(1, "Section is required"),
  videoUrl: z.string().trim().min(1, "Video URL is required"),
  videoPlayer: z.string().min(1),
  videoLength: z.number({ error: "Enter minutes" }).min(0, "Can't be negative"),
  suggestion: z.string().optional(),
  links: z.array(z.object({ title: z.string().trim().min(1, "Title required"), url })),
});

const schema = z
  .object({
    name: z.string().trim().min(3, "Course name is required"),
    description: z.string().trim().min(20, "Write at least a couple of sentences"),
    price: z.number({ error: "Enter a price (0 for free)" }).min(0, "Can't be negative"),
    estimatedPrice: z.number().min(0).optional().or(z.nan().transform(() => undefined)),
    tags: z.string().trim().min(1, "Add at least one tag"),
    level: z.string().min(1, "Choose a level"),
    demoUrl: z.string().trim().min(1, "Add a preview video URL"),
    benefits: z.array(z.object({ title: z.string().trim().min(1, "Can't be empty") })),
    prerequisites: z.array(z.object({ title: z.string().trim().min(1, "Can't be empty") })),
    courseData: z.array(lessonSchema),
  })
  .refine((d) => d.estimatedPrice === undefined || d.estimatedPrice === 0 || d.estimatedPrice >= d.price, {
    path: ["estimatedPrice"],
    message: "Original price should be higher than the selling price",
  });

type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

const emptyLesson = (section = ""): Values["courseData"][number] => ({
  title: "",
  description: "",
  videoSection: section,
  videoUrl: "",
  videoPlayer: "youtube",
  videoLength: 0,
  suggestion: "",
  links: [],
});

function toDefaults(course?: Course): Values {
  return {
    name: course?.name ?? "",
    description: course?.description ?? "",
    price: course?.price ?? 0,
    estimatedPrice: course?.estimatedPrice ?? undefined,
    tags: course?.tags ?? "",
    level: course?.level ?? "Beginner",
    demoUrl: course?.demoUrl ?? "",
    benefits: course?.benefits?.map((b) => ({ title: b.title })) ?? [{ title: "" }],
    prerequisites: course?.prerequisites?.map((p) => ({ title: p.title })) ?? [],
    courseData:
      course?.courseData?.map((l) => ({
        ...l,
        _id: l._id,
        title: l.title ?? "",
        description: l.description ?? "",
        videoSection: l.videoSection ?? "",
        videoUrl: l.videoUrl ?? "",
        videoPlayer: l.videoPlayer ?? "youtube",
        videoLength: Number(l.videoLength) || 0,
        suggestion: l.suggestion ?? "",
        links: l.links?.map((k) => ({ title: k.title, url: k.url })) ?? [],
      })) ?? [],
  };
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-border py-10 first:border-t-0 first:pt-0 lg:grid-cols-[260px_1fr]">
      <div>
        <h2 className="font-sans text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

function ListField({
  control,
  register,
  name,
  errors,
  placeholder,
  addLabel,
}: {
  control: Control<Values, unknown, Output>;
  register: UseFormRegister<Values>;
  name: "benefits" | "prerequisites";
  errors?: FieldErrors<Values>["benefits"];
  placeholder: string;
  addLabel: string;
}) {
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <div className="space-y-2.5">
      {fields.map((f, i) => (
        <div key={f.id}>
          <div className="flex gap-2">
            <Input placeholder={placeholder} aria-label={`${addLabel} ${i + 1}`} aria-invalid={!!errors?.[i]?.title} {...register(`${name}.${i}.title`)} />
            <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {errors?.[i]?.title && <p className="mt-1 text-sm text-danger">{errors[i]?.title?.message}</p>}
        </div>
      ))}
      <Button variant="soft" size="sm" onClick={() => append({ title: "" })}>
        <Plus className="h-4 w-4" aria-hidden /> {addLabel}
      </Button>
    </div>
  );
}

function LessonLinks({ control, register, index, errors }: { control: Control<Values, unknown, Output>; register: UseFormRegister<Values>; index: number; errors?: FieldErrors<Values>["courseData"] }) {
  const { fields, append, remove } = useFieldArray({ control, name: `courseData.${index}.links` });
  const linkErrors = errors?.[index]?.links;
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium">Resources</p>
      {fields.map((f, j) => (
        <div key={f.id} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
          <Input placeholder="Title, e.g. Practice sheet" aria-label="Resource title" aria-invalid={!!linkErrors?.[j]?.title} {...register(`courseData.${index}.links.${j}.title`)} />
          <Input placeholder="https://" aria-label="Resource URL" aria-invalid={!!linkErrors?.[j]?.url} {...register(`courseData.${index}.links.${j}.url`)} />
          <Button variant="ghost" size="icon" onClick={() => remove(j)} aria-label="Remove resource">
            <Trash2 className="h-4 w-4" />
          </Button>
          {(linkErrors?.[j]?.title || linkErrors?.[j]?.url) && (
            <p className="text-sm text-danger sm:col-span-3">{linkErrors[j]?.title?.message ?? linkErrors[j]?.url?.message}</p>
          )}
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => append({ title: "", url: "" })}>
        <Link2 className="h-4 w-4" aria-hidden /> Add resource link
      </Button>
    </div>
  );
}

export function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const isEdit = !!course;
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [previewLesson, setPreviewLesson] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [editCourse, { isLoading: saving }] = useEditCourseMutation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isDirty },
  } = useForm<Values, unknown, Output>({ resolver: zodResolver(schema), defaultValues: toDefaults(course) });

  const lessons = useFieldArray({ control, name: "courseData" });
  const openNewLesson = useRef(false);

  // Expand a lesson right after it's added.
  useEffect(() => {
    const last = lessons.fields.at(-1);
    if (openNewLesson.current && last) {
      openNewLesson.current = false;
      setExpanded((prev) => new Set(prev).add(last.id));
    }
  }, [lessons.fields]);
  const demoUrl = watch("demoUrl");

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onThumb = async (file?: File) => {
    if (!file) return;
    try {
      setThumbnail(await compressImage(file, 1600, 0.85));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onSubmit = handleSubmit(
    async (values) => {
      const payload = { ...values } as CoursePayload;
      if (thumbnail) payload.thumbnail = thumbnail;
      try {
        if (isEdit && course) {
          await editCourse({ id: course._id, data: payload }).unwrap();
          toast.success("Course saved");
        } else {
          const res = await createCourse(payload).unwrap();
          toast.success("Course created");
          router.replace(`/admin/courses/${res.course._id}/edit`);
          return;
        }
        setThumbnail(null);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    },
    (formErrors) => {
      // Open every lesson that has a problem so it's visible.
      if (formErrors.courseData) {
        const lessonErrors = formErrors.courseData as unknown as unknown[];
        const ids = lessons.fields.filter((_, i) => lessonErrors[i]).map((f) => f.id);
        setExpanded((prev) => new Set([...prev, ...ids]));
      }
      toast.error("Some fields need attention");
    },
  );

  const thumbSrc = thumbnail ?? course?.thumbnail?.url;
  const busy = creating || saving;

  return (
    <form onSubmit={onSubmit} noValidate className="pb-28">
      <Section title="Basics" description="What learners see first in the catalogue and on the course page.">
        <Field label="Course name" error={errors.name?.message}>
          {(id, d) => <Input id={id} aria-invalid={!!errors.name} aria-describedby={d} {...register("name")} />}
        </Field>
        <Field label="Description" error={errors.description?.message}>
          {(id, d) => <Textarea id={id} rows={6} aria-invalid={!!errors.description} aria-describedby={d} {...register("description")} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Level" error={errors.level?.message}>
            {(id) => (
              <Select id={id} {...register("level")}>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Tags" error={errors.tags?.message} hint="Comma separated. Match homepage categories to show in filters.">
            {(id, d) => <Input id={id} placeholder="Algebra, Class 10" aria-invalid={!!errors.tags} aria-describedby={d} {...register("tags")} />}
          </Field>
        </div>
      </Section>

      <Section title="Pricing" description="Set the price to 0 to make the course free.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Selling price (₹)" error={errors.price?.message}>
            {(id, d) => <Input id={id} type="number" min={0} inputMode="numeric" aria-invalid={!!errors.price} aria-describedby={d} {...register("price", { valueAsNumber: true })} />}
          </Field>
          <Field label="Original price (₹)" error={errors.estimatedPrice?.message} hint="Optional. Shown crossed out.">
            {(id, d) => <Input id={id} type="number" min={0} inputMode="numeric" aria-invalid={!!errors.estimatedPrice} aria-describedby={d} {...register("estimatedPrice", { valueAsNumber: true })} />}
          </Field>
        </div>
      </Section>

      <Section title="Media" description="A 16:9 thumbnail and a free preview video.">
        <div>
          <p className="mb-1.5 text-sm font-medium">Thumbnail</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex aspect-video w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface text-muted transition hover:border-fg/40"
          >
            {thumbSrc ? (
              <Image src={thumbSrc} alt="Course thumbnail" fill sizes="448px" className="object-cover" unoptimized={!!thumbnail} />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm">
                <ImagePlus className="h-6 w-6" aria-hidden /> Upload image (JPG, PNG or WebP)
              </span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => onThumb(e.target.files?.[0])} />
          {thumbSrc && (
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-sm font-medium text-muted hover:text-fg">
              Replace image
            </button>
          )}
        </div>
        <Field label="Preview video URL" error={errors.demoUrl?.message} hint="YouTube, Vimeo or a direct .mp4 link. Anyone can watch this.">
          {(id, d) => <Input id={id} placeholder="https://youtu.be/…" aria-invalid={!!errors.demoUrl} aria-describedby={d} {...register("demoUrl")} />}
        </Field>
        {demoUrl && <VideoPlayer url={demoUrl} title="Preview video" className="max-w-md" />}
      </Section>

      <Section title="Outcomes" description="Short, specific statements. Shown as a checklist on the course page.">
        <div>
          <p className="mb-2 text-sm font-medium">What learners will be able to do</p>
          <ListField control={control} register={register} name="benefits" errors={errors.benefits} placeholder="Solve quadratic equations by factorising" addLabel="Add outcome" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Prerequisites</p>
          <ListField control={control} register={register} name="prerequisites" errors={errors.prerequisites} placeholder="Comfortable with basic algebra" addLabel="Add prerequisite" />
        </div>
      </Section>

      <Section title="Lessons" description="Lessons with the same section name are grouped together, in this order. Video length is in minutes.">
        {lessons.fields.length === 0 && <p className="rounded-xl bg-surface px-5 py-6 text-sm text-muted">No lessons yet. Add the first one below.</p>}
        <ol className="space-y-3">
          {lessons.fields.map((field, i) => {
            const open = expanded.has(field.id);
            const lessonErrors = errors.courseData?.[i];
            const values = watch(`courseData.${i}`);
            return (
              <li key={field.id} className={cn("rounded-2xl border", lessonErrors ? "border-danger" : "border-border")}>
                <div className="flex items-center gap-2 px-4 py-3">
                  <button type="button" onClick={() => toggle(field.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold tabular">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{values?.title || "Untitled lesson"}</span>
                      <span className="block truncate text-xs text-muted">
                        {values?.videoSection || "No section"}
                        {Number(values?.videoLength) > 0 && `, ${formatDuration(Number(values?.videoLength))}`}
                      </span>
                    </span>
                    <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-muted transition", open && "rotate-180")} aria-hidden />
                  </button>
                  <div className="flex shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => lessons.move(i, i - 1)} disabled={i === 0} aria-label="Move lesson up">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => lessons.move(i, i + 1)} disabled={i === lessons.fields.length - 1} aria-label="Move lesson down">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-danger"
                      onClick={() => {
                        const hasQuestions = getValues(`courseData.${i}.questions`)?.length;
                        if (hasQuestions && !window.confirm("This lesson has learner questions. Remove it anyway?")) return;
                        lessons.remove(i);
                      }}
                      aria-label="Remove lesson"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {open && (
                  <div className="space-y-5 border-t border-border p-4 sm:p-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Lesson title" error={lessonErrors?.title?.message}>
                        {(id) => <Input id={id} aria-invalid={!!lessonErrors?.title} {...register(`courseData.${i}.title`)} />}
                      </Field>
                      <Field label="Section" error={lessonErrors?.videoSection?.message}>
                        {(id) => <Input id={id} placeholder="Chapter 1: Basics" aria-invalid={!!lessonErrors?.videoSection} {...register(`courseData.${i}.videoSection`)} />}
                      </Field>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-[1fr_160px_140px]">
                      <Field label="Video URL" error={lessonErrors?.videoUrl?.message}>
                        {(id) => <Input id={id} placeholder="https://youtu.be/…" aria-invalid={!!lessonErrors?.videoUrl} {...register(`courseData.${i}.videoUrl`)} />}
                      </Field>
                      <Field label="Player">
                        {(id) => (
                          <Select id={id} {...register(`courseData.${i}.videoPlayer`)}>
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                            <option value="url">Video file URL</option>
                          </Select>
                        )}
                      </Field>
                      <Field label="Length (min)" error={lessonErrors?.videoLength?.message}>
                        {(id) => <Input id={id} type="number" min={0} aria-invalid={!!lessonErrors?.videoLength} {...register(`courseData.${i}.videoLength`, { valueAsNumber: true })} />}
                      </Field>
                    </div>
                    {values?.videoUrl && (
                      <div>
                        <button type="button" className="text-sm font-medium text-muted hover:text-fg" onClick={() => setPreviewLesson(previewLesson === field.id ? null : field.id)}>
                          {previewLesson === field.id ? "Hide video preview" : "Check video"}
                        </button>
                        {previewLesson === field.id && <VideoPlayer url={values.videoUrl} player={values.videoPlayer} title="Lesson preview" className="mt-3 max-w-md" />}
                      </div>
                    )}
                    <Field label="Description" error={lessonErrors?.description?.message}>
                      {(id) => <Textarea id={id} rows={3} aria-invalid={!!lessonErrors?.description} {...register(`courseData.${i}.description`)} />}
                    </Field>
                    <Field label="Teacher's tip" hint="Optional. Highlighted under the lesson.">
                      {(id) => <Textarea id={id} rows={2} {...register(`courseData.${i}.suggestion`)} />}
                    </Field>
                    <LessonLinks control={control} register={register} index={i} errors={errors.courseData} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <Button
          variant="outline"
          onClick={() => {
            const last = getValues("courseData").at(-1);
            lessons.append(emptyLesson(last?.videoSection ?? ""));
            openNewLesson.current = true;
          }}
        >
          <Plus className="h-4 w-4" aria-hidden /> Add lesson
        </Button>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 backdrop-blur lg:left-[248px]">
        <div className="flex items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <p className="mr-auto hidden text-sm text-muted sm:block">{isDirty || thumbnail ? "You have unsaved changes" : isEdit ? "All changes saved" : ""}</p>
          <Button variant="ghost" onClick={() => router.push("/admin/courses")}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {isEdit ? "Save changes" : "Create course"}
          </Button>
        </div>
      </div>
    </form>
  );
}
