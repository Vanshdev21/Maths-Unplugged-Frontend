"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonClass } from "@/components/ui/button";
import { Spinner } from "@/components/ui/misc";
import { downloadFile, fetchWithRefresh, formatBytes, resolveDocument, lessonFileUrl } from "@/lib/document";
import type { Lesson } from "@/lib/types";

// PDF.js is large; only load it when a PDF lesson is opened.
const PdfViewer = dynamic(() => import("./pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-border">
      <Spinner className="h-7 w-7" />
    </div>
  ),
});

type Loaded = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: ArrayBuffer; objectUrl?: string };

/** Loads a protected lesson file with the learner's session. */
function useProtectedFile(src: string | null, asObjectUrl: boolean): Loaded {
  // Results are tagged with their src, so switching lessons shows "loading"
  // straight away without resetting state inside the effect.
  const [state, setState] = useState<Loaded & { src: string | null }>({ status: "loading", src: null });

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    let objectUrl: string | undefined;

    fetchWithRefresh(src)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(body?.message ?? "This file couldn't be loaded.");
        }
        const blob = await res.blob();
        const data = await blob.arrayBuffer();
        if (asObjectUrl) objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setState({ status: "ready", data, objectUrl, src });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ status: "error", message: err.message, src });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, asObjectUrl]);

  return state.src === src ? state : { status: "loading" };
}

function FileCard({
  name,
  meta,
  action,
}: {
  name: string;
  meta?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-ink">
        <FileText className="h-6 w-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{name}</p>
        {meta && <p className="text-sm text-muted">{meta}</p>}
      </div>
      {action}
    </div>
  );
}

export function DocumentViewer({ courseId, lesson }: { courseId: string; lesson: Lesson }) {
  const source = resolveDocument(courseId, lesson);
  const isFile = source.kind === "file";
  const isPdf = isFile && source.mimeType === "application/pdf";
  const isImage = isFile && source.mimeType.startsWith("image/");
  const file = useProtectedFile(isPdf || isImage ? (source as { src: string }).src : null, isImage);
  const [downloading, setDownloading] = useState(false);

  const download =
    isFile && source.allowDownload ? (
      <Button
        variant="outline"
        size="sm"
        loading={downloading}
        onClick={async () => {
          setDownloading(true);
          try {
            await downloadFile(lessonFileUrl(courseId, lesson._id, true), source.name);
          } catch (err) {
            toast.error((err as Error).message);
          } finally {
            setDownloading(false);
          }
        }}
      >
        <Download className="h-4 w-4" aria-hidden /> Download
      </Button>
    ) : null;

  if (source.kind === "none") {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-border bg-surface text-sm text-muted">
        This document isn&apos;t available yet.
      </div>
    );
  }

  if (source.kind === "drive") {
    return (
      <div className="space-y-3">
        <div className="relative h-[75vh] min-h-[420px] overflow-hidden rounded-2xl border border-border bg-surface">
          <iframe src={source.embedUrl} title={lesson.title} className="absolute inset-0 h-full w-full" allow="autoplay" loading="lazy" />
        </div>
        <a href={source.openUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "sm")}>
          <ExternalLink className="h-4 w-4" aria-hidden /> Open in Google Drive
        </a>
      </div>
    );
  }

  if (source.kind === "pdf-url" || source.kind === "link") {
    return (
      <FileCard
        name={lesson.title}
        meta={source.kind === "pdf-url" ? "PDF document" : "Opens in a new tab"}
        action={
          <a href={source.url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "sm")}>
            <ExternalLink className="h-4 w-4" aria-hidden /> Open document
          </a>
        }
      />
    );
  }

  // Uploaded file
  const meta = [source.mimeType === "application/pdf" ? "PDF" : source.name.split(".").pop()?.toUpperCase(), formatBytes(source.bytes)]
    .filter(Boolean)
    .join(", ");

  if (isPdf || isImage) {
    if (file.status === "loading") {
      return (
        <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-border">
          <Spinner className="h-7 w-7" />
        </div>
      );
    }
    if (file.status === "error") {
      return <FileCard name={source.name} meta={file.message} action={download} />;
    }
    return (
      <div className="space-y-3">
        {isPdf ? (
          <PdfViewer data={file.data} title={source.name} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.objectUrl} alt={lesson.title} className="mx-auto max-h-[80vh] rounded-2xl border border-border" />
        )}
        {download && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">{meta}</p>
            {download}
          </div>
        )}
      </div>
    );
  }

  return (
    <FileCard
      name={source.name}
      meta={meta}
      action={download ?? <p className="text-sm text-muted">Downloads are turned off for this file.</p>}
    />
  );
}
