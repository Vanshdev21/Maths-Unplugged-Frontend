"use client";

import { forwardRef, useImperativeHandle, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface CodeInputHandle {
  focus: () => void;
}

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when every box is filled. */
  onComplete?: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
}

/** Row of single-digit boxes for one-time codes. Supports paste and autofill. */
export const CodeInput = forwardRef<CodeInputHandle, CodeInputProps>(function CodeInput(
  { value, onChange, onComplete, length = 6, invalid, disabled, autoFocus, label = "Verification code" },
  ref,
) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useImperativeHandle(ref, () => ({
    focus: () => inputs.current[Math.min(value.length, length - 1)]?.focus(),
  }));

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const setDigit = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    // Autofill / fast typing can put several digits in one box.
    const next = (value.slice(0, index) + typed).slice(0, length);
    const clean = commit(next);
    inputs.current[Math.min(clean.length, length - 1)]?.focus();
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        commit(value.slice(0, index - 1) + value.slice(index));
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const clean = commit(pasted);
    inputs.current[Math.min(clean.length, length - 1)]?.focus();
  };

  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      <div className="flex justify-between gap-2 sm:gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={autoFocus && i === 0}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={invalid || undefined}
            className={cn(
              "h-14 w-full min-w-0 rounded-xl border bg-bg text-center font-display text-2xl font-bold tabular transition focus:border-fg focus:outline-none disabled:opacity-60 sm:h-16 sm:text-3xl",
              invalid ? "border-danger" : "border-border",
            )}
          />
        ))}
      </div>
    </fieldset>
  );
});
