import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/guards";
import { PageLoader } from "@/components/ui/misc";
import { Player } from "./player";

export const metadata: Metadata = { title: "Course", robots: { index: false } };

export default function CourseAccessPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<PageLoader />}>
        <Player />
      </Suspense>
    </RequireAuth>
  );
}
