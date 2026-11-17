"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";
import { CodeInput, type CodeInputHandle } from "@/components/ui/code-input";
import { useCountdown } from "@/hooks/use-countdown";
import { useActivateMutation, useResendActivationMutation } from "@/redux/api/authApi";
import { setActivation } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getErrorMessage } from "@/lib/utils";

const LENGTH = 6;
const STORAGE_KEY = "mu:activation";

function clearStoredActivation() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function VerifyForm() {
  const stored = useAppSelector((s) => s.auth.activation);
  const dispatch = useAppDispatch();
  // Survive a refresh: the sign-up step also saves the token in sessionStorage.
  const saved = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const restored = useMemo(() => {
    try {
      return saved ? (JSON.parse(saved) as { token: string; email: string }) : null;
    } catch {
      return null;
    }
  }, [saved]);
  const activation = stored ?? restored;

  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const inputRef = useRef<CodeInputHandle>(null);
  const countdown = useCountdown(60);
  const [activate, { isLoading }] = useActivateMutation();
  const [resend, { isLoading: resending }] = useResendActivationMutation();

  if (!activation || expired) {
    return (
      <div className="space-y-4">
        <p className="text-muted">
          {expired
            ? "This sign-up has expired. Sign up again and we'll send you a new code."
            : "This page needs the code we email you when you sign up. Start again to get a code."}
        </p>
        <ButtonLink href="/signup" className="w-full">
          Back to sign up
        </ButtonLink>
      </div>
    );
  }

  const submit = async (value: string) => {
    if (value.length !== LENGTH) {
      setError(`Enter all ${LENGTH} digits`);
      return;
    }
    setError("");
    try {
      await activate({ activation_token: activation.token, activation_code: value }).unwrap();
      dispatch(setActivation(null));
      clearStoredActivation();
      toast.success("Email verified. Log in to continue.");
      const next = params.get("next");
      router.replace(`/login?email=${encodeURIComponent(activation.email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`);
    } catch (err) {
      if ((err as { status?: number }).status === 410) {
        dispatch(setActivation(null));
        clearStoredActivation();
        setExpired(true);
        return;
      }
      setError(getErrorMessage(err));
      setCode("");
      inputRef.current?.focus();
    }
  };

  const onResend = async () => {
    try {
      const res = await resend({ activation_token: activation.token }).unwrap();
      toast.success(res.message ?? "New code sent");
      setError("");
      setCode("");
      countdown.start(res.resendAvailableIn ?? 60);
      inputRef.current?.focus();
    } catch (err) {
      if ((err as { status?: number }).status === 410) {
        dispatch(setActivation(null));
        clearStoredActivation();
        setExpired(true);
        return;
      }
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(code);
      }}
      className="space-y-6"
    >
      <p className="text-muted">
        Enter the 6-digit code we sent to <strong className="font-medium break-all text-fg">{activation.email}</strong>. It expires in 10 minutes.
      </p>
      <div>
        <CodeInput ref={inputRef} value={code} onChange={setCode} onComplete={submit} invalid={!!error} disabled={isLoading} autoFocus />
        {error && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" loading={isLoading}>
        Verify email
      </Button>
      <div className="space-y-2 text-center text-sm text-muted">
        <p>
          Didn&apos;t get it? Check your spam folder, or{" "}
          {countdown.ready ? (
            <button type="button" onClick={onResend} disabled={resending} className="font-medium text-fg underline underline-offset-4 disabled:opacity-60">
              {resending ? "sending…" : "send a new code"}
            </button>
          ) : (
            <span aria-live="polite">request a new code in {countdown.left}s</span>
          )}
          .
        </p>
        <p>
          Wrong email?{" "}
          <Link href="/signup" className="font-medium text-fg underline underline-offset-4">
            Sign up again
          </Link>
        </p>
      </div>
    </form>
  );
}
