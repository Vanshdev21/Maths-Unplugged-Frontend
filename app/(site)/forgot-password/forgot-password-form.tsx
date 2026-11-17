"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Field, Input, PasswordInput } from "@/components/ui/field";
import { useCountdown } from "@/hooks/use-countdown";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/redux/api/authApi";
import { emailSchema, passwordSchema } from "@/lib/validation";
import { getErrorMessage } from "@/lib/utils";

const emailForm = z.object({ email: emailSchema });

const resetForm = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type ResetValues = z.infer<typeof resetForm>;

export function ForgotPasswordForm({ onStepChange }: { onStepChange?: (step: "email" | "reset") => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  // Changing the key remounts the code boxes, which puts focus back in them.
  const [codeKey, setCodeKey] = useState(0);
  const countdown = useCountdown(0);
  const [requestCode, { isLoading: sending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const emailFormApi = useForm<{ email: string }>({
    resolver: zodResolver(emailForm),
    defaultValues: { email: params.get("email") ?? "" },
  });

  const resetFormApi = useForm<ResetValues>({
    resolver: zodResolver(resetForm),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const send = async (address: string) => {
    try {
      const res = await requestCode({ email: address }).unwrap();
      setEmail(address);
      onStepChange?.("reset");
      countdown.start(res.resendAvailableIn ?? 60);
      toast.success("Check your inbox for a 6-digit code");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  if (!email) {
    const { register, handleSubmit, formState } = emailFormApi;
    return (
      <form onSubmit={handleSubmit(({ email: value }) => send(value.trim().toLowerCase()))} noValidate className="space-y-5">
        <Field label="Email" error={formState.errors.email?.message}>
          {(id, d) => (
            <Input id={id} type="email" autoComplete="email" autoFocus aria-invalid={!!formState.errors.email} aria-describedby={d} {...register("email")} />
          )}
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={sending}>
          Send reset code
        </Button>
        <p className="text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-fg underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      </form>
    );
  }

  const { register, handleSubmit, formState } = resetFormApi;

  const onReset = handleSubmit(async ({ newPassword }) => {
    if (code.length !== 6) {
      setCodeError("Enter the 6-digit code from the email");
      setCodeKey((k) => k + 1);
      return;
    }
    setCodeError("");
    try {
      await resetPassword({ email, code, newPassword }).unwrap();
      toast.success("Password updated. Log in with your new password.");
      router.replace(`/login?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setCodeError(getErrorMessage(err));
      setCode("");
      setCodeKey((k) => k + 1);
    }
  });

  return (
    <form onSubmit={onReset} noValidate className="space-y-6">
      <p className="text-muted">
        If there&apos;s an account for <strong className="font-medium break-all text-fg">{email}</strong>, we&apos;ve sent it a 6-digit code. It
        expires in 10 minutes.
      </p>

      <div>
        <p className="mb-2 text-sm font-medium">Code</p>
        <CodeInput key={codeKey} value={code} onChange={setCode} invalid={!!codeError} autoFocus />
        {codeError && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {codeError}
          </p>
        )}
      </div>

      <Field label="New password" error={formState.errors.newPassword?.message} hint="At least 8 characters.">
        {(id, d) => (
          <PasswordInput id={id} autoComplete="new-password" aria-invalid={!!formState.errors.newPassword} aria-describedby={d} {...register("newPassword")} />
        )}
      </Field>
      <Field label="Confirm new password" error={formState.errors.confirmPassword?.message}>
        {(id, d) => (
          <PasswordInput id={id} autoComplete="new-password" aria-invalid={!!formState.errors.confirmPassword} aria-describedby={d} {...register("confirmPassword")} />
        )}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={resetting}>
        Set new password
      </Button>

      <div className="space-y-2 text-center text-sm text-muted">
        <p>
          No email?{" "}
          {countdown.ready ? (
            <button type="button" onClick={() => send(email)} disabled={sending} className="font-medium text-fg underline underline-offset-4 disabled:opacity-60">
              {sending ? "sending…" : "Send a new code"}
            </button>
          ) : (
            <span aria-live="polite">You can request a new code in {countdown.left}s</span>
          )}
        </p>
        <p>
          <button
            type="button"
            onClick={() => {
              setEmail(null);
              setCode("");
              setCodeError("");
              onStepChange?.("email");
            }}
            className="font-medium text-fg underline underline-offset-4"
          >
            Use a different email
          </button>
        </p>
      </div>
    </form>
  );
}
