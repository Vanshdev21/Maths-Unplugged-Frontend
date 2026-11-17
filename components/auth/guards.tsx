"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/misc";
import { useAuth } from "@/redux/hooks";

/** Client-side guard. The server still enforces every permission. */
export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { status, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "guest") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && admin && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, admin, router, pathname]);

  if (status !== "authenticated" || (admin && !isAdmin)) return <PageLoader />;
  return <>{children}</>;
}

/** For login/signup pages: send signed-in users onward. */
export function RedirectIfAuthenticated() {
  const { status, isAdmin } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    if (status !== "authenticated") return;
    const next = params.get("next");
    const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : isAdmin ? "/admin" : "/";
    router.replace(safe);
  }, [status, isAdmin, router, params]);
  return null;
}
