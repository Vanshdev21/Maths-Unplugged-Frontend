import type { NextConfig } from "next";

/**
 * All browser requests go to `/api/v1/*` on the frontend's own domain and are
 * proxied to the Express backend. Auth cookies therefore stay first-party,
 * which keeps login working in browsers that block third-party cookies.
 */
// Tolerates a missing https://, quotes or a trailing slash in BACKEND_URL.
const rawBackend = process.env.BACKEND_URL?.trim().replace(/^["'[]+|["'\]]+$/g, "").replace(/\/+$/, "");
const BACKEND_URL = !rawBackend
  ? "http://localhost:8000"
  : /^https?:\/\//i.test(rawBackend)
    ? rawBackend
    : `https://${rawBackend}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
