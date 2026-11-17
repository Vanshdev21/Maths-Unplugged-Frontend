import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfAuthenticated } from "@/components/auth/guards";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="It's free. You only pay for the courses you choose."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-fg underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <Suspense>
        <RedirectIfAuthenticated />
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
