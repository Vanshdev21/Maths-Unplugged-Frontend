import { Plus } from "lucide-react";
import { Container } from "@/components/ui/misc";
import type { FaqItem } from "@/lib/types";
import { PAYMENTS_ENABLED } from "@/lib/site";

export const DEFAULT_FAQ: FaqItem[] = [
  {
    question: "How long do I have access to a course?",
    answer: "For as long as the course is available. Watch lessons as many times as you like, on any device.",
  },
  PAYMENTS_ENABLED
    ? {
        question: "How do I pay?",
    answer: "Checkout is handled by Razorpay. You can pay with UPI, debit or credit card, or net banking. Access is unlocked as soon as the payment is confirmed.",
      }
    : {
        question: "Are the courses free?",
        answer: "Yes. Every course is free to enrol in right now. Create an account, open a course and press Enrol for free.",
      },
  {
    question: "What if I get stuck on a question?",
    answer: "Post it in the Q&A tab under the lesson. You'll get an email when someone replies.",
  },
  {
    question: "Can I watch a lesson before buying?",
    answer: "Most courses have a free preview video on the course page, along with the full list of lessons.",
  },
];

export function Faq({ items }: { items?: FaqItem[] }) {
  const faq = items?.length ? items : DEFAULT_FAQ;
  return (
    <section id="faq" className="scroll-mt-20">
      <Container className="grid gap-10 py-20 md:grid-cols-[1fr_1.6fr] lg:py-24">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">Questions, answered</h2>
          <p className="mt-4 text-muted">Can&apos;t find what you need? Email us and we&apos;ll reply within a day.</p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {faq.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-45" aria-hidden />
              </summary>
              <p className="pr-10 pb-5 leading-relaxed whitespace-pre-line text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
