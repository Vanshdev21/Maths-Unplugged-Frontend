import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";
import { RichText } from "./rich-text";
import { DEFAULT_UPDATED } from "@/lib/page-defaults";
import { site } from "@/lib/site";
import { cn, formatDate } from "@/lib/utils";
import type { SitePage } from "@/lib/types";

function Contact() {
  return (
    <p className="leading-relaxed text-muted">
      Questions? Email{" "}
      <a className="font-medium text-fg underline underline-offset-4" href={`mailto:${site.supportEmail}`}>
        {site.supportEmail}
      </a>
      .
    </p>
  );
}

/** Terms, Privacy, Refund policy: a calm single column. */
export function PolicyPage({ page }: { page: SitePage }) {
  return (
    <Container className="max-w-3xl py-14 lg:py-20">
      <h1 className="text-4xl font-bold sm:text-5xl">{page.title}</h1>
      {page.subtitle && <p className="mt-4 text-lg text-muted">{page.subtitle}</p>}
      <p className="mt-3 text-sm text-subtle">
        Last updated {formatDate(page.updatedAt ?? DEFAULT_UPDATED, { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <div className="mt-12 space-y-10">
        {page.sections.map((s, i) => (
          <section key={s._id ?? i}>
            <h2 className="font-sans text-lg font-semibold">{s.heading}</h2>
            <RichText text={s.body} className="mt-3" />
          </section>
        ))}
        {page.showContact && (
          <section>
            <h2 className="font-sans text-lg font-semibold">Contact</h2>
            <div className="mt-3">
              <Contact />
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}

/** About: hero, highlights, alternating sections with optional images, call to action. */
export function AboutPage({ page }: { page: SitePage }) {
  return (
    <>
      <section className="border-b border-border bg-graph">
        <Container className={cn("grid items-center gap-10 py-16 lg:py-24", page.heroImage && "lg:grid-cols-[1.1fr_1fr]")}>
          <div className={cn(!page.heroImage && "max-w-3xl")}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{page.title}</h1>
            {page.subtitle && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{page.subtitle}</p>}
            {page.cta && (
              <div className="mt-8">
                <ButtonLink href={page.cta.href} size="lg">
                  {page.cta.text}
                </ButtonLink>
              </div>
            )}
          </div>
          {page.heroImage && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-surface">
              <Image src={page.heroImage.url} alt="" fill priority sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
            </div>
          )}
        </Container>
      </section>

      {page.highlights.length > 0 && (
        <Container className="py-12">
          <ul className={cn("grid gap-4", page.highlights.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2", page.highlights.length > 3 && "lg:grid-cols-4")}>
            {page.highlights.map((h, i) => (
              <li key={i} className="rounded-2xl border border-border bg-surface px-6 py-5">
                <p className="font-display text-2xl font-bold">{h.value}</p>
                <p className="mt-1 text-sm text-muted">{h.label}</p>
              </li>
            ))}
          </ul>
        </Container>
      )}

      <Container className="space-y-16 py-12 lg:space-y-24 lg:py-16">
        {page.sections.map((s, i) => (
          <section
            key={s._id ?? i}
            className={cn("grid items-center gap-8", s.image ? "lg:grid-cols-2 lg:gap-14" : "max-w-3xl")}
          >
            <div className={cn(s.image && i % 2 === 1 && "lg:order-2")}>
              <h2 className="text-2xl font-bold sm:text-3xl">{s.heading}</h2>
              <RichText text={s.body} className="mt-4 text-[17px]" />
            </div>
            {s.image && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-surface">
                <Image src={s.image.url} alt="" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
              </div>
            )}
          </section>
        ))}
      </Container>

      {(page.cta || page.showContact) && (
        <Container className="pb-20">
          <div className="rounded-3xl border border-border bg-surface px-6 py-10 text-center sm:px-12">
            <h2 className="text-2xl font-bold">Questions about Maths Unplugged?</h2>
            {page.showContact && (
              <div className="mx-auto mt-3 max-w-md">
                <Contact />
              </div>
            )}
            {page.cta && (
              <div className="mt-6">
                <ButtonLink href={page.cta.href} variant="dark">
                  {page.cta.text}
                </ButtonLink>
              </div>
            )}
          </div>
        </Container>
      )}
    </>
  );
}
