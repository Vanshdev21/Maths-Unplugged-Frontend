"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/field";
import { useLoginMutation } from "@/redux/api/authApi";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { getErrorMessage } from "@/lib/utils";

/** Only allow redirects to paths on this site. */
export function safeNext(value: string | null, fallback = "/") {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function LoginForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: params.get("email") ?? "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await login(values).unwrap();
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}`);
      // RedirectIfAuthenticated sends the user on once the session is set.
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Email" error={errors.email?.message}>
        {(id, d) => (
          <Input id={id} type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={d} {...register("email")} />
        )}
      </Field>
      <div>
        <Field label="Password" error={errors.password?.message}>
          {(id, d) => (
            <PasswordInput id={id} autoComplete="current-password" aria-invalid={!!errors.password} aria-describedby={d} {...register("password")} />
          )}
        </Field>
        <div className="mt-2 text-right">
          <Link
            href={`/forgot-password${watch("email") ? `?email=${encodeURIComponent(watch("email"))}` : ""}`}
            className="text-sm font-medium text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={isLoading}>
        Log in
      </Button>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-fg underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}
