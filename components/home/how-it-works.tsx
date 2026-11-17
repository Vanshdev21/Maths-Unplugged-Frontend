import { Container } from "@/components/ui/misc";

const steps = [
  {
    title: "Learn",
    body: "Watch a short lesson that explains one idea at a time, with a worked example on screen.",
  },
  {
    title: "Attempt",
    body: "Try the questions yourself before looking at the solution. Mistakes here are the point.",
  },
  {
    title: "Improve",
    body: "Ask about anything that didn't click. Replies appear under the lesson and in your inbox.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-surface">
      <Container className="py-20 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">How every lesson works</h2>
          <p className="mt-4 text-lg text-muted">
            The same three steps, in every topic. Repeat them and the hard chapters stop being hard.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* number line behind the steps */}
          <span aria-hidden className="absolute top-5 right-0 left-0 hidden h-0.5 bg-border md:block" />
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-fg font-display text-lg font-bold text-bg ring-8 ring-surface">
                {i + 1}
              </span>
              <h3 className="mt-6 text-2xl font-bold">{step.title}</h3>
              <p className="mt-2 max-w-xs leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
