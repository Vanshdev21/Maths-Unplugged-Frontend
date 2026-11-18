import { Container } from "@/components/ui/misc";
import { homeIcon } from "./home-icons";
import { cn } from "@/lib/utils";
import type { HomeContent } from "@/lib/types";

export function Trust({ content }: { content: HomeContent["trust"] }) {
  const { heading, subtitle, items } = content;
  return (
    <section>
      <Container className="py-20 lg:py-24">
        <h2 className="max-w-xl text-3xl font-bold sm:text-4xl">{heading}</h2>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-muted">{subtitle}</p>}
        <dl
          className={cn(
            "mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border",
            items.length > 1 && "sm:grid-cols-2",
            (items.length === 3 || items.length >= 5) && items.length % 2 === 1 && "lg:grid-cols-3",
          )}
        >
          {items.map(({ icon, title, text }, i) => {
            const Icon = homeIcon(icon);
            return (
              <div key={i} className="bg-bg p-7 sm:p-8">
                <dt className="flex items-center gap-3 font-semibold">
                  <Icon className="h-5 w-5" aria-hidden />
                  {title}
                </dt>
                {text && <dd className="mt-2 leading-relaxed text-muted">{text}</dd>}
              </div>
            );
          })}
        </dl>
      </Container>
    </section>
  );
}
