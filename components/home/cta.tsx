import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";

export function Cta() {
  return (
    <Container>
      <div className="flex flex-col items-start justify-between gap-8 rounded-[28px] bg-black px-8 py-12 text-white sm:px-12 md:flex-row md:items-center dark:border dark:border-border dark:bg-surface dark:text-fg">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">Pick a topic. Start today.</h2>
          <p className="mt-3 max-w-lg text-white/70 dark:text-muted">
            Browse the full list of lessons on any course page before you enrol.
          </p>
        </div>
        <ButtonLink
          href="/courses"
          size="lg"
          className="bg-brand text-brand-ink"
        >
          See all courses
        </ButtonLink>
      </div>
    </Container>
  );
}
