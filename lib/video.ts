export type VideoSource =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "file"; url: string }
  | { kind: "embed"; url: string }
  | { kind: "none" };

const YT = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i;
const VIMEO = /vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/)?(\d+)/i;
const FILE = /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i;

/**
 * Works out how to play a lesson. `player` comes from the course's
 * `videoPlayer` field ("youtube", "vimeo", "url"...), but the URL wins
 * when it is unambiguous.
 */
export function resolveVideo(url?: string, player?: string): VideoSource {
  const value = url?.trim();
  if (!value) return { kind: "none" };

  const yt = value.match(YT);
  if (yt?.[1]) return { kind: "youtube", id: yt[1] };

  const vimeo = value.match(VIMEO);
  if (vimeo?.[1]) return { kind: "vimeo", id: vimeo[1] };

  const hint = player?.toLowerCase() ?? "";
  if (/^[\w-]{11}$/.test(value) && hint.includes("youtube")) return { kind: "youtube", id: value };
  if (/^\d+$/.test(value) && hint.includes("vimeo")) return { kind: "vimeo", id: value };

  if (!/^https?:\/\//i.test(value)) return { kind: "none" };
  if (FILE.test(value) || /res\.cloudinary\.com\/.+\/video\//i.test(value)) return { kind: "file", url: value };
  return { kind: "embed", url: value };
}

export function videoThumbnail(url?: string) {
  const src = resolveVideo(url);
  return src.kind === "youtube" ? `https://i.ytimg.com/vi/${src.id}/hqdefault.jpg` : undefined;
}
