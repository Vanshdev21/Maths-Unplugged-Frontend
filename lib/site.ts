/**
 * The public address of the site. Tolerates common typos in the env value
 * (missing https://, spaces, trailing slash, quotes) and falls back to the
 * address Vercel assigns, so a bad value can't break the build.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];
  for (const raw of candidates) {
    const value = raw?.trim().replace(/^["'\[]+|["'\]]+$/g, "").replace(/\/+$/, "");
    if (!value) continue;
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      return new URL(withProtocol).origin;
    } catch {
      // try the next candidate
    }
  }
  return "http://localhost:3000";
}

/** Cleans up BACKEND_URL the same way (adds https://, drops quotes and trailing slash). */
export function normalizeBackendUrl(raw: string | undefined): string {
  const value = raw?.trim().replace(/^["'\[]+|["'\]]+$/g, "").replace(/\/+$/, "");
  if (!value) return "http://localhost:8000";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export const site = {
  name: "Maths Unplugged",
  tagline: "Learn. Attempt. Improve.",
  description:
    "Clear, structured maths courses with video lessons, practice and a teacher who answers your questions.",
  url: resolveSiteUrl(),
  supportEmail: "support@mathsunplugged.com",
  locale: "en_IN",
};

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "");

/** Server-only: where server components fetch public data from. */
export const SERVER_API_URL = `${normalizeBackendUrl(process.env.BACKEND_URL)}/api/v1`;

/**
 * Payments switch. Off unless NEXT_PUBLIC_PAYMENTS_ENABLED=true: every course
 * is free to enrol in and prices/checkout are hidden. Keep it in sync with
 * PAYMENTS_ENABLED on the server.
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

/** Google OAuth client ID. The Google button only shows when this is set. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
