import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0 rounded-[22%] ring-1 ring-transparent dark:ring-white/15", className)}
    >
      <rect width="160" height="160" rx="0" fill="#000" />
      <path fill="#FDE700" d="M33 36H63.5L80 62.5 96.5 36H127V121H105V73H104L80 121 56 73H55V121H33Z" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="Maths Unplugged home">
      <LogoMark size={34} />
      <span className="font-display text-[19px] leading-none font-bold tracking-tight">
        Maths <span className="font-semibold text-muted">Unplugged</span>
      </span>
    </Link>
  );
}
