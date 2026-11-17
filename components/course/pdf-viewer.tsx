"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Spinner } from "@/components/ui/misc";

/**
 * Renders a PDF with PDF.js onto canvases, so it looks the same on every
 * device (Android Chrome can't show PDFs inside a page on its own).
 * Pages render only when scrolled near, to keep long notes fast.
 */

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // Copied to /public by scripts/copy-pdf-worker.mjs on install.
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];

function PdfPage({ doc, pageNumber, width }: { doc: PDFDocumentProxy; pageNumber: number; width: number }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(pageNumber <= 2);
  const [ratio, setRatio] = useState(1.414); // A4 until measured

  // Start rendering when the page is near the viewport.
  useEffect(() => {
    const el = holderRef.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !width) return;
    let cancelled = false;
    let task: { cancel: () => void; promise: Promise<unknown> } | null = null;

    doc.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      setRatio(base.height / base.width);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: (width / base.width) * dpr });
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const renderTask = page.render({ canvasContext: ctx, canvas, viewport } as Parameters<typeof page.render>[0]);
      task = renderTask;
      renderTask.promise.catch(() => {
        /* cancelled while scrolling or zooming */
      });
    });

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, width, visible]);

  return (
    <div
      ref={holderRef}
      className="relative mx-auto bg-white shadow-sm ring-1 ring-black/5"
      style={{ width, height: width * ratio }}
      data-page={pageNumber}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        onContextMenu={(e) => e.preventDefault()}
        aria-label={`Page ${pageNumber}`}
      />
      {!visible && <span className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden />}
    </div>
  );
}

export function PdfViewer({ data, title }: { data: ArrayBuffer; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState("");
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    loadPdfJs()
      .then((pdfjs) => pdfjs.getDocument({ data: new Uint8Array(data.slice(0)) }).promise)
      .then((pdf) => {
        loaded = pdf;
        if (!cancelled) setDoc(pdf);
      })
      .catch(() => {
        if (!cancelled) setError("This PDF couldn't be opened.");
      });
    return () => {
      cancelled = true;
      loaded?.destroy();
    };
  }, [data]);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (el) setContainerWidth(el.clientWidth);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const zoom = ZOOMS[zoomIndex] ?? 1;
  const pageWidth = Math.max(0, Math.round((containerWidth - 32) * zoom));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-bg px-4 py-2.5">
        <p className="min-w-0 truncate text-sm font-medium">{title}</p>
        <div className="flex shrink-0 items-center gap-1 text-sm text-muted">
          {doc && <span className="mr-2 tabular">{doc.numPages} {doc.numPages === 1 ? "page" : "pages"}</span>}
          <button
            type="button"
            onClick={() => setZoomIndex((z) => Math.max(0, z - 1))}
            disabled={zoomIndex === 0}
            className="rounded-lg p-1.5 hover:bg-surface hover:text-fg disabled:opacity-40"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center tabular">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoomIndex((z) => Math.min(ZOOMS.length - 1, z + 1))}
            disabled={zoomIndex === ZOOMS.length - 1}
            className="rounded-lg p-1.5 hover:bg-surface hover:text-fg disabled:opacity-40"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="scrollbar-thin h-[75vh] min-h-[420px] overflow-auto">
        {error ? (
          <p className="p-10 text-center text-sm text-muted">{error}</p>
        ) : !doc || !pageWidth ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : (
          <div className="space-y-4 p-4" style={{ width: pageWidth + 32 }}>
            {Array.from({ length: doc.numPages }, (_, i) => (
              <PdfPage key={i} doc={doc} pageNumber={i + 1} width={pageWidth} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
