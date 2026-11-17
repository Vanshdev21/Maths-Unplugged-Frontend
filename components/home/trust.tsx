import { InfinityIcon, MessagesSquare, ShieldCheck, Star } from "lucide-react";
import { Container } from "@/components/ui/misc";

const points = [
  {
    icon: InfinityIcon,
    title: "Yours to keep",
    body: "Pay once and keep access to every lesson in the course. Rewatch before every exam.",
  },
  {
    icon: MessagesSquare,
    title: "A teacher who replies",
    body: "Each lesson has its own question thread, and you get an email when someone answers.",
  },
  {
    icon: ShieldCheck,
    title: "Safe checkout",
    body: "Pay with UPI, cards or net banking through Razorpay. We never see your card details.",
  },
  {
    icon: Star,
    title: "Honest reviews",
    body: "Only enrolled students can rate a course, so every review comes from someone who took it.",
  },
];

export function Trust() {
  return (
    <section>
      <Container className="py-20 lg:py-24">
        <h2 className="max-w-xl text-3xl font-bold sm:text-4xl">What you can count on</h2>
        <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {points.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-bg p-7 sm:p-8">
              <dt className="flex items-center gap-3 font-semibold">
                <Icon className="h-5 w-5" aria-hidden />
                {title}
              </dt>
              <dd className="mt-2 leading-relaxed text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
