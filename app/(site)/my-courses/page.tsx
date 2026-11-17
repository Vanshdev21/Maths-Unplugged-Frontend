import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/guards";
import { Container } from "@/components/ui/misc";
import { MyCourses } from "./my-courses";

export const metadata: Metadata = { title: "My courses", robots: { index: false } };

export default function MyCoursesPage() {
  return (
    <Container className="py-12 lg:py-16">
      <h1 className="text-4xl font-bold">My courses</h1>
      <p className="mt-2 text-muted">Your progress is saved to your account, so it follows you across devices.</p>
      <div className="mt-10">
        <RequireAuth>
          <MyCourses />
        </RequireAuth>
      </div>
    </Container>
  );
}
