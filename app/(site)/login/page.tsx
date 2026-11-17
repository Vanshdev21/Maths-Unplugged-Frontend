import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfAuthenticated } from "@/components/auth/guards";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthShell title="Log in" description="Pick up where you left off.">
      <Suspense>
        <RedirectIfAuthenticated />
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
