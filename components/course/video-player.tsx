"use client";

import { useEffect, useRef } from "react";
import { PlayCircle } from "lucide-react";
import { resolveVideo } from "@/lib/video";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  url?: string;
  player?: string;
  title: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
}

export function VideoPlayer({ url, player, title, autoPlay, onEnded, className }: VideoPlayerProps) {
  const source = resolveVideo(url, player);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reload the <video> element when switching lessons.
  useEffect(() => {
    videoRef.current?.load();
  }, [url]);

  const frame = cn("relative aspect-video w-full overflow-hidden rounded-2xl bg-black", className);

  if (source.kind === "none") {
    return (
      <div className={cn(frame, "flex flex-col items-center justify-center gap-3 text-white/70")}>
        <PlayCircle className="h-10 w-10" aria-hidden />
        <p className="text-sm">This video isn&apos;t available yet.</p>
      </div>
    );
  }

  if (source.kind === "file") {
    return (
      <div className={frame}>
        <video
          ref={videoRef}
          className="h-full w-full"
          controls
          playsInline
          preload="metadata"
          autoPlay={autoPlay}
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          onEnded={onEnded}
          aria-label={title}
        >
          <source src={source.url} />
          Your browser can&apos;t play this video.
        </video>
      </div>
    );
  }

  const src =
    source.kind === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${source.id}?rel=0&modestbranding=1&playsinline=1${autoPlay ? "&autoplay=1" : ""}`
      : source.kind === "vimeo"
        ? `https://player.vimeo.com/video/${source.id}?dnt=1&title=0&byline=0&portrait=0${autoPlay ? "&autoplay=1" : ""}`
        : source.url;

  return (
    <div className={frame}>
      <iframe
        key={src}
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    </div>
  );
}
