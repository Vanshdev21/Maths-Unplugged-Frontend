"use client";

import { useCallback, useEffect, useState } from "react";

/** Seconds left until an action (e.g. "Resend code") is allowed again. */
export function useCountdown(initialSeconds = 0) {
  const [left, setLeft] = useState(initialSeconds);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const start = useCallback((seconds: number) => setLeft(Math.max(0, Math.ceil(seconds))), []);

  return { left, start, ready: left <= 0 };
}
