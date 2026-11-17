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

/**
 * Payments switch. Off unless NEXT_PUBLIC_PAYMENTS_ENABLED=true: every course
 * is free to enrol in and prices/checkout are hidden. Keep it in sync with
 * PAYMENTS_ENABLED on the server.
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

/** Google OAuth client ID. The Google button only shows when this is set. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
