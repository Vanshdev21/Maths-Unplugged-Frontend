import Image from "next/image";
import { BookOpen, ShieldCheck, Star, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";
import { ProgressGraph } from "./progress-graph";
import { HeroSecondaryCta } from "./hero-cta";
import type { Layout } from "@/lib/types";

interface HeroProps {
  banner?: Layout["banner"];
  stats: { courses: number; learners: number; rating: number };
}

export function Hero({ banner, stats }: HeroProps) {
  const title = banner?.title || "Maths that finally makes sense.";
  const subtitle =
    banner?.subTitle ||
    "Short video lessons and worked examples, then questions you try yourself. When you get stuck, ask the teacher right under the lesson.";

  return (
    <section className="relative overflow-hidden">
      <div className="bg-graph pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
      <Container className="relative grid items-center gap-12 pt-14 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-20 lg:gap-16 lg:pb-28">
        <div>
          <h1 className="text-[2.6rem] leading-[1.05] font-bold sm:text-6xl lg:text-[4.25rem]">{title}</h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">{subtitle}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/courses" size="lg">
              Browse courses
            </ButtonLink>
            <HeroSecondaryCta />
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
            {stats.learners > 0 && (
              <li className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-fg" aria-hidden />
                <span>
                  <strong className="font-semibold text-fg tabular">{stats.learners.toLocaleString("en-IN")}</strong> enrolments
                </span>
              </li>
            )}
            {stats.courses > 0 && (
              <li className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-fg" aria-hidden />
                <span>
                  <strong className="font-semibold text-fg tabular">{stats.courses}</strong> {stats.courses === 1 ? "course" : "courses"}
                </span>
              </li>
            )}
            {stats.rating > 0 && (
              <li className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 fill-brand text-brand-line" aria-hidden />
                <span>
                  <strong className="font-semibold text-fg tabular">{stats.rating.toFixed(1)}</strong> average rating
                </span>
              </li>
            )}
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-fg" aria-hidden />
              Secure payments via Razorpay
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          {banner?.image?.url ? (
            <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-surface-2">
              <Image src={banner.image.url} alt="" fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </div>
          ) : (
            <ProgressGraph />
          )}
        </div>
      </Container>
    </section>
  );
}
