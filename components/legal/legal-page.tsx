import { Container } from "@/components/ui/misc";
import { site } from "@/lib/site";

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { heading: string; body: string[] }[] }) {
  return (
    <Container className="max-w-3xl py-14 lg:py-20">
      <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
      <div className="mt-12 space-y-10">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-sans text-lg font-semibold">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 32)} className="mt-3 leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </section>
        ))}
        <section>
          <h2 className="font-sans text-lg font-semibold">Contact</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Questions about this policy? Email{" "}
            <a className="font-medium text-fg underline underline-offset-4" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
