import { API_URL } from "./site";
import type { Lesson } from "./types";

export type DocumentSource =
  | { kind: "file"; src: string; name: string; mimeType: string; bytes: number; allowDownload: boolean }
  | { kind: "drive"; embedUrl: string; openUrl: string }
  | { kind: "pdf-url"; url: string }
  | { kind: "link"; url: string }
  | { kind: "none" };

const DRIVE_FILE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]{20,})/i;
const GOOGLE_DOC = /docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]{20,})/i;

export function lessonFileUrl(courseId: string, lessonId: string, download = false) {
  return `${API_URL}/course/${courseId}/lesson/${lessonId}/file${download ? "?download=1" : ""}`;
}

/** Works out how to show a document lesson. */
export function resolveDocument(courseId: string, lesson: Lesson): DocumentSource {
  if (lesson.file?.public_id) {
    return {
      kind: "file",
      src: lessonFileUrl(courseId, lesson._id),
      name: lesson.file.name,
      mimeType: lesson.file.mimeType,
      bytes: lesson.file.bytes,
      allowDownload: lesson.allowDownload !== false,
    };
  }

  const url = lesson.documentUrl?.trim();
  if (!url || !/^https?:\/\//i.test(url)) return { kind: "none" };

  const drive = url.match(DRIVE_FILE);
  if (drive?.[1]) {
    return {
      kind: "drive",
      embedUrl: `https://drive.google.com/file/d/${drive[1]}/preview`,
      openUrl: `https://drive.google.com/file/d/${drive[1]}/view`,
    };
  }

  const gdoc = url.match(GOOGLE_DOC);
  if (gdoc?.[1] && gdoc[2]) {
    return {
      kind: "drive",
      embedUrl: `https://docs.google.com/${gdoc[1]}/d/${gdoc[2]}/preview`,
      openUrl: url,
    };
  }

  if (/\.pdf(\?|#|$)/i.test(url)) return { kind: "pdf-url", url };
  return { kind: "link", url };
}

/**
 * fetch() for protected files: if the short-lived login has expired,
 * refresh it once and try again.
 */
export async function fetchWithRefresh(url: string): Promise<Response> {
  let res = await fetch(url, { credentials: "include" });
  if (res.status === 401) {
    const refreshed = await fetch(`${API_URL}/user/refresh`, { credentials: "include" });
    if (refreshed.ok) res = await fetch(url, { credentials: "include" });
  }
  return res;
}

export async function downloadFile(url: string, name: string) {
  const res = await fetchWithRefresh(url);
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message ?? "The file couldn't be downloaded.");
  }
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

export function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
