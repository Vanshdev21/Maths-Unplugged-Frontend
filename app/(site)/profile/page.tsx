import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/guards";
import { Container } from "@/components/ui/misc";
import { ProfileView } from "./profile-view";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default function ProfilePage() {
  return (
    <Container className="max-w-3xl py-12 lg:py-16">
      <h1 className="mb-10 text-4xl font-bold">Profile</h1>
      <RequireAuth>
        <ProfileView />
      </RequireAuth>
    </Container>
  );
}
