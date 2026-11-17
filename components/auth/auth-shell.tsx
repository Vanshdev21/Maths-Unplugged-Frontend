import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo";

export function AuthShell({ title, description, children, footer }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="bg-graph relative flex min-h-[calc(100dvh-4rem)] items-start justify-center px-5 py-14 sm:items-center">
      <div className="w-full max-w-[26rem] rounded-3xl border border-border bg-bg p-7 shadow-xl shadow-black/[0.03] sm:p-9">
        <LogoMark size={40} />
        <h1 className="mt-6 text-3xl font-bold">{title}</h1>
        {description && <p className="mt-2 text-muted">{description}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
