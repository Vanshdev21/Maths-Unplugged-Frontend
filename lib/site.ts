export const site = {
  name: "Maths Unplugged",
  tagline: "Learn. Attempt. Improve.",
  description:
    "Clear, structured maths courses with video lessons, practice and a teacher who answers your questions.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supportEmail: "support@mathsunplugged.com",
  locale: "en_IN",
};

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "");

/** Server-only: where server components fetch public data from. */
export const SERVER_API_URL = `${(process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "")}/api/v1`;

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
