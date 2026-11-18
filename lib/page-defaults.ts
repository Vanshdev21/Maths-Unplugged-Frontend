import { PAYMENTS_ENABLED } from "./site";
import type { HomeContent, PageSlug, SitePage } from "./types";

/**
 * What each page shows until an admin saves their own version
 * (Admin → Pages). The editor also starts from these.
 */
const defaults: Record<PageSlug, SitePage> = {
  about: {
    slug: "about",
    title: "About Maths Unplugged",
    subtitle:
      "Maths that finally makes sense: short lessons, questions you try yourself, and a teacher who answers when you get stuck.",
    highlights: [
      { value: "Learn", label: "One idea at a time" },
      { value: "Attempt", label: "Try it before the solution" },
      { value: "Improve", label: "Ask under every lesson" },
    ],
    sections: [
      {
        heading: "Why we started",
        body: "Most students don't struggle with maths because it's hard. They struggle because nobody stops to explain the one step that didn't click.\n\nMaths Unplugged puts every lesson, the notes and a place to ask doubts in one spot, so no question goes unanswered.",
      },
      {
        heading: "How we teach",
        body: "- **Learn:** short lessons that explain one idea at a time, with a worked example.\n- **Attempt:** you try the questions yourself before seeing the solution.\n- **Improve:** ask about anything that didn't click, right under the lesson.",
      },
      {
        heading: "Who it's for",
        body: "Students who want to understand maths, not just memorise steps. Every course lists its lessons up front, so you know exactly what you're getting.",
      },
    ],
    cta: { text: "Browse courses", href: "/courses" },
    showContact: true,
  },
  terms: {
    slug: "terms",
    title: "Terms of use",
    highlights: [],
    sections: [
      {
        heading: "Your account",
        body: "You need an account to enrol in a course. Keep your password private; you're responsible for activity on your account.\n\nOne account is for one learner. Sharing logins or course videos with others isn't allowed and may lead to the account being suspended.",
      },
      {
        heading: "Course access",
        body: "When you enrol, you get personal, non-transferable access to the course for as long as it's offered on Maths Unplugged.\n\nLessons, notes and other materials remain the property of Maths Unplugged. Don't download, copy or redistribute them.",
      },
      PAYMENTS_ENABLED
        ? {
            heading: "Payments",
            body: "Prices are shown in Indian Rupees and include applicable taxes unless stated otherwise. Payments are processed by Razorpay.\n\nSee the [refund policy](/refund-policy) for when you can ask for your money back.",
          }
        : {
            heading: "Free courses",
            body: "Courses are currently free to enrol in. If we introduce paid courses later, we'll show the price clearly before you enrol.",
          },
      {
        heading: "Community",
        body: "Be respectful in questions and reviews. We may remove content that is abusive, off-topic or shares answers to assessments.",
      },
    ],
    showContact: true,
  },
  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    highlights: [],
    sections: [
      {
        heading: "What we collect",
        body:
          "Your name, email address and password (stored only as a secure hash), your profile picture if you add one, the courses you enrol in, your lesson progress, and the questions, photos and reviews you post." +
          (PAYMENTS_ENABLED
            ? "\n\nWe don't receive or store your card or bank details. Razorpay handles payment information under its own privacy policy."
            : ""),
      },
      {
        heading: "How we use it",
        body: "To run your account, give you access to courses, send verification codes, enrolment confirmations and replies to your questions, and to improve our courses.\n\nWe don't sell your personal data.",
      },
      {
        heading: "Cookies",
        body: "We use essential cookies to keep you logged in. Your lesson progress is saved to your account, so you can continue on any device.",
      },
      {
        heading: "Your choices",
        body: "You can update your name, email and picture from your profile. To delete your account, email us and we'll remove it.",
      },
    ],
    showContact: true,
  },
  "refund-policy": {
    slug: "refund-policy",
    title: "Refund policy",
    highlights: [],
    sections: [
      {
        heading: "7-day refunds",
        body: "If a course isn't right for you, email us within 7 days of purchase with your registered email and Razorpay payment ID. We'll refund the full amount if you've watched less than 30% of the lessons.",
      },
      {
        heading: "How refunds are paid",
        body: "Approved refunds go back to the original payment method through Razorpay, usually within 5 to 7 working days. Course access ends once the refund is issued.",
      },
      {
        heading: "Failed or duplicate payments",
        body: "If money was deducted but the course didn't unlock, or you were charged twice, email us with the payment ID. We'll either unlock the course or refund the payment.",
      },
    ],
    showContact: true,
  },
};

export const DEFAULT_UPDATED = "2026-11-13";

export function defaultPage(slug: PageSlug): SitePage {
  return structuredClone(defaults[slug]);
}

/** The saved page, or the default one if nothing has been saved yet. */
export function pageOrDefault(slug: PageSlug, saved: SitePage | null): SitePage {
  return saved ?? defaultPage(slug);
}

export const PAGE_LABELS: Record<PageSlug, string> = {
  about: "About",
  terms: "Terms of use",
  privacy: "Privacy policy",
  "refund-policy": "Refund policy",
};

/* ---------- Homepage text defaults (Admin → Homepage) ---------- */

export function defaultHomeContent(): HomeContent {
  return {
    howItWorks: {
      heading: "How every lesson works",
      subtitle: "The same three steps, in every topic. Repeat them and the hard chapters stop being hard.",
      steps: [
        { title: "Learn", text: "Watch a short lesson that explains one idea at a time, with a worked example on screen." },
        { title: "Attempt", text: "Try the questions yourself before looking at the solution. Mistakes here are the point." },
        { title: "Improve", text: "Ask about anything that didn't click. Replies appear under the lesson and in your inbox." },
      ],
    },
    trust: {
      heading: "What you can count on",
      subtitle: "",
      items: [
        { icon: "infinity", title: "Yours to keep", text: "Keep access to every lesson in the course. Rewatch before every exam." },
        { icon: "messages", title: "A teacher who replies", text: "Each lesson has its own question thread, and you get an email when someone answers." },
        PAYMENTS_ENABLED
          ? { icon: "shield", title: "Safe checkout", text: "Pay with UPI, cards or net banking through Razorpay. We never see your card details." }
          : { icon: "shield", title: "Free to start", text: "Every course is free to enrol in right now. Create an account and start the first lesson in under a minute." },
        { icon: "star", title: "Honest reviews", text: "Only enrolled students can rate a course, so every review comes from someone who took it." },
      ],
    },
  };
}
