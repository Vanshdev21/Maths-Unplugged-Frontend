import { Container } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import type { HomeContent } from "@/lib/types";

const COLS: Record<number, string> = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" };

export function HowItWorks({ content }: { content: HomeContent["howItWorks"] }) {
  const { heading, subtitle, steps } = content;
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-surface">
      <Container className="py-20 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{heading}</h2>
          {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
        </div>

        <ol className={cn("relative mt-14 grid gap-10 md:gap-8", COLS[steps.length] ?? "md:grid-cols-3")}>
          {/* number line behind the steps */}
          {steps.length > 1 && <span aria-hidden className="absolute top-5 right-0 left-0 hidden h-0.5 bg-border lg:block" />}
          {steps.map((step, i) => (
            <li key={i} className="relative">
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-fg font-display text-lg font-bold text-bg ring-8 ring-surface">
                {i + 1}
              </span>
              <h3 className="mt-6 text-2xl font-bold">{step.title}</h3>
              {step.text && <p className="mt-2 max-w-xs leading-relaxed text-muted">{step.text}</p>}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
