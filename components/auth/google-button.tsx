"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useGoogleLoginMutation } from "@/redux/api/authApi";
import { GOOGLE_CLIENT_ID } from "@/lib/site";
import { getErrorMessage } from "@/lib/utils";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: "signin" | "signup" | "use";
      }) => void;
      renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
      disableAutoSelect: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Google sign-in couldn't load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/** Turns off Google's automatic re-sign-in after logging out. */
export function signOutOfGoogle() {
  try {
    window.google?.accounts.id.disableAutoSelect();
  } catch {
    /* script not loaded */
  }
}

/**
 * "Continue with Google". Google returns a signed ID token which the server
 * verifies before logging the learner in (or creating their account).
 */
export function GoogleButton({ context = "signin" }: { context?: "signin" | "signup" }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [failed, setFailed] = useState(false);
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();
  // Keep the latest mutation in a ref so Google's callback never goes stale.
  const loginRef = useRef(googleLogin);
  useEffect(() => {
    loginRef.current = googleLogin;
  }, [googleLogin]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        const google = window.google;
        const holder = holderRef.current;
        if (cancelled || !google || !holder) return;

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
          context,
          callback: async ({ credential }) => {
            if (!credential) {
              toast.error("Google sign-in was cancelled.");
              return;
            }
            try {
              const res = await loginRef.current({ credential }).unwrap();
              toast.success(`Welcome, ${res.user.name.split(" ")[0]}`);
            } catch (err) {
              toast.error(getErrorMessage(err, "Google sign-in failed. Try again."));
            }
          },
        });

        holder.innerHTML = "";
        google.accounts.id.renderButton(holder, {
          type: "standard",
          theme: resolvedTheme === "dark" ? "filled_black" : "outline",
          size: "large",
          text: context === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.min(400, Math.max(200, holder.clientWidth)),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [context, resolvedTheme]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-5">
      <div className="relative" aria-busy={isLoading || undefined}>
        <div ref={holderRef} className="flex min-h-11 w-full justify-center [color-scheme:normal]" />
        {isLoading && <div className="absolute inset-0 animate-pulse rounded-md bg-bg/60" aria-hidden />}
        {failed && (
          <p className="text-center text-sm text-muted">Google sign-in couldn&apos;t load. Check your connection or use email below.</p>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-subtle" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        or use your email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
