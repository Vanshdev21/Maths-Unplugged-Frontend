import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CommentAuthor, Course, Lesson, User } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(amount?: number | null) {
  if (!amount || amount <= 0) return "Free";
  return inr.format(amount);
}

export function discountPercent(price?: number, estimatedPrice?: number) {
  if (!price || !estimatedPrice || estimatedPrice <= price) return 0;
  return Math.round(((estimatedPrice - price) / estimatedPrice) * 100);
}

/** Lesson lengths are stored in minutes. */
export function formatDuration(minutes?: number) {
  const total = Math.max(0, Math.round(minutes ?? 0));
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function courseStats(course: Pick<Course, "courseData">) {
  const lessons = course.courseData ?? [];
  const minutes = lessons.reduce((sum, l) => sum + (Number(l.videoLength) || 0), 0);
  return { lessons: lessons.length, minutes };
}

export function formatDate(value?: string | Date, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

export function timeAgo(value?: string) {
  if (!value) return "";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [size, unit] of units) {
    if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit);
  }
  return "just now";
}

export function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function getUserId(user?: Pick<User, "id" | "_id"> | null) {
  return user?.id ?? user?._id ?? "";
}

export function isEnrolled(user: User | null | undefined, courseId: string) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.courses?.some((c) => String(c.courseId) === courseId) ?? false;
}

export function authorOf(author: CommentAuthor) {
  if (author && typeof author === "object") {
    return { id: String(author._id), name: author.name || "Learner", avatar: author.avatar, role: author.role };
  }
  return { id: String(author), name: "Learner", avatar: undefined, role: undefined };
}

export function splitTags(tags?: string) {
  return (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export interface LessonSection<T> {
  title: string;
  lessons: (T & { index: number })[];
  minutes: number;
}

/** Groups lessons by `videoSection`, preserving their original order. */
export function groupBySection<T extends Partial<Lesson>>(lessons: T[] = []): LessonSection<T>[] {
  const sections: LessonSection<T>[] = [];
  lessons.forEach((lesson, index) => {
    const title = lesson.videoSection?.trim() || "Lessons";
    let section = sections.find((s) => s.title === title);
    if (!section) {
      section = { title, lessons: [], minutes: 0 };
      sections.push(section);
    }
    section.lessons.push({ ...lesson, index });
    section.minutes += Number(lesson.videoLength) || 0;
  });
  return sections;
}

/** Extracts a readable message from RTK Query / fetch errors. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Try again.") {
  if (!error) return fallback;
  if (typeof error === "object") {
    const e = error as { data?: { message?: string }; error?: string; status?: unknown; message?: string };
    if (e.data && typeof e.data === "object" && e.data.message) return e.data.message;
    if (e.status === "FETCH_ERROR") return "Can't reach the server. Check your connection and try again.";
    if (typeof e.error === "string") return e.error;
    if (typeof e.message === "string") return e.message;
  }
  return fallback;
}

/** Resizes an image in the browser and returns a JPEG/PNG data URL. */
export function compressImage(file: File, maxSize = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Choose an image file (JPG, PNG or WebP)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That image couldn't be opened."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const type = file.type === "image/png" ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(type, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
