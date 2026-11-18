import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { SERVER_API_URL } from "@/lib/site";

// Pages an admin can refresh right after editing them.
const ALLOWED = new Set(["/about", "/terms", "/privacy", "/refund-policy", "/"]);

/**
 * POST /api/revalidate { path } — called by the admin panel after saving a page,
 * so the change shows immediately instead of after the cache expires.
 * Only works for a logged-in admin: we ask the backend who the cookie belongs to.
 */
export async function POST(req: NextRequest) {
  const { path } = (await req.json().catch(() => ({}))) as { path?: string };
  if (!path || !ALLOWED.has(path)) {
    return NextResponse.json({ success: false, message: "Unknown page" }, { status: 400 });
  }

  const me = await fetch(`${SERVER_API_URL}/user/me`, {
    headers: { cookie: req.headers.get("cookie") ?? "", Accept: "application/json" },
    cache: "no-store",
  }).catch(() => null);
  const data = me?.ok ? ((await me.json().catch(() => null)) as { user?: { role?: string } } | null) : null;
  if (data?.user?.role !== "admin") {
    return NextResponse.json({ success: false, message: "Not allowed" }, { status: 403 });
  }

  revalidatePath(path);
  if (path !== "/") revalidatePath("/sitemap.xml");
  return NextResponse.json({ success: true });
}
