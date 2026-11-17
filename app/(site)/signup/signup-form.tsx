"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/field";
import { GoogleButton } from "@/components/auth/google-button";
import { useRegisterMutation } from "@/redux/api/authApi";
import { signupSchema, type SignupValues } from "@/lib/validation";
import { getErrorMessage } from "@/lib/utils";
import { safeNext } from "../login/login-form";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "");
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema), defaultValues: { name: "", email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values).unwrap();
      toast.success(`We sent a 6-digit code to ${values.email}`);
      router.push(`/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <GoogleButton context="signup" />
      <Field label="Full name" error={errors.name?.message}>
        {(id, d) => <Input id={id} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={d} {...register("name")} />}
      </Field>
      <Field label="Email" error={errors.email?.message}>
        {(id, d) => (
          <Input id={id} type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={d} {...register("email")} />
        )}
      </Field>
      <Field label="Password" error={errors.password?.message} hint="At least 8 characters.">
        {(id, d) => (
          <PasswordInput id={id} autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={d} {...register("password")} />
        )}
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={isLoading}>
        Create account
      </Button>
      <p className="text-center text-xs leading-relaxed text-subtle">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
