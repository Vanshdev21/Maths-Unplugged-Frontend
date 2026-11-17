import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";

export function Cta() {
  return (
    <Container>
      <div className="flex flex-col items-start justify-between gap-8 rounded-[28px] bg-black px-8 py-12 text-white sm:px-12 md:flex-row md:items-center dark:bg-brand dark:text-black">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">Pick a topic. Start today.</h2>
          <p className="mt-3 max-w-lg text-white/70 dark:text-black/70">
            Browse the full list of lessons on any course page before you enrol.
          </p>
        </div>
        <ButtonLink
          href="/courses"
          size="lg"
          className="bg-brand text-black dark:bg-black dark:text-brand"
        >
          See all courses
        </ButtonLink>
      </div>
    </Container>
  );
}
