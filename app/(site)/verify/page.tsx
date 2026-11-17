import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };

export default function VerifyPage() {
  return (
    <AuthShell title="Check your email">
      <Suspense>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
