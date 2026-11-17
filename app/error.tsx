"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="bg-graph flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted">The page hit an unexpected error. Try again, or head back to the homepage.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-subtle">Reference: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Go home
        </ButtonLink>
      </div>
    </main>
  );
}
