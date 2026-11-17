"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/field";
import { Tabs } from "@/components/ui/tabs";
import {
  useConfirmEmailChangeMutation,
  useUpdateAvatarMutation,
  useUpdatePasswordMutation,
  useUpdateUserInfoMutation,
} from "@/redux/api/userApi";
import { CodeInput, type CodeInputHandle } from "@/components/ui/code-input";
import { useCountdown } from "@/hooks/use-countdown";
import { useAuth } from "@/redux/hooks";
import { compressImage, formatDate, getErrorMessage } from "@/lib/utils";
import {
  passwordChangeSchema,
  profileSchema,
  type PasswordChangeValues,
  type ProfileValues,
} from "@/lib/validation";

function AvatarUpload() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [updateAvatar, { isLoading }] = useUpdateAvatarMutation();

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const avatar = await compressImage(file, 400, 0.85);
      await updateAvatar({ avatar }).unwrap();
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <Avatar name={user?.name} src={user?.avatar?.url} size={80} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-fg text-bg disabled:opacity-60"
          aria-label="Change profile picture"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <div>
        <p className="text-lg font-semibold">{user?.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          {user?.role === "admin" && <Badge tone="dark">Admin</Badge>}
          {user?.createdAt && <span>Member since {formatDate(user.createdAt, { day: undefined })}</span>}
        </div>
        {isLoading && <p className="mt-1 text-sm text-muted">Uploading…</p>}
      </div>
    </div>
  );
}

function EmailChangePanel({
  email,
  onDone,
  onCancel,
}: {
  email: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const codeRef = useRef<CodeInputHandle>(null);
  const countdown = useCountdown(60);
  const [confirm, { isLoading }] = useConfirmEmailChangeMutation();
  const [resend, { isLoading: resending }] = useUpdateUserInfoMutation();

  const submit = async (value: string) => {
    if (value.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setError("");
    try {
      await confirm({ code: value }).unwrap();
      toast.success(`Email changed to ${email}`);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
      setCode("");
      codeRef.current?.focus();
    }
  };

  return (
    <div className="max-w-lg rounded-2xl border border-brand-line bg-brand-soft p-5 sm:p-6" role="region" aria-label="Confirm new email">
      <h3 className="font-sans text-base font-semibold">Confirm your new email</h3>
      <p className="mt-1 text-sm text-muted">
        Enter the 6-digit code we sent to <strong className="font-medium break-all text-fg">{email}</strong>. Your account keeps
        using your current email until you confirm.
      </p>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit(code);
        }}
      >
        <CodeInput ref={codeRef} value={code} onChange={setCode} onComplete={submit} invalid={!!error} disabled={isLoading} autoFocus />
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" loading={isLoading}>
            Confirm email
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <span className="ml-auto text-sm text-muted">
            {countdown.ready ? (
              <button
                type="button"
                disabled={resending}
                className="font-medium text-fg underline underline-offset-4 disabled:opacity-60"
                onClick={async () => {
                  try {
                    const res = await resend({ email }).unwrap();
                    countdown.start(res.emailChangePending?.resendAvailableIn ?? 60);
                    toast.success("New code sent");
                  } catch (err) {
                    toast.error(getErrorMessage(err));
                  }
                }}
              >
                {resending ? "Sending…" : "Send a new code"}
              </button>
            ) : (
              <span aria-live="polite">New code in {countdown.left}s</span>
            )}
          </span>
        </div>
      </form>
    </div>
  );
}

function AccountForm() {
  const { user } = useAuth();
  const [update, { isLoading }] = useUpdateUserInfoMutation();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const nameChanged = values.name.trim() !== user?.name;
    const emailChanged = values.email.trim().toLowerCase() !== user?.email;
    try {
      const res = await update({
        name: values.name,
        ...(emailChanged ? { email: values.email } : {}),
      }).unwrap();
      if (res.emailChangePending) {
        setPendingEmail(res.emailChangePending.email);
        if (nameChanged) toast.success("Name saved");
        // Show the current email until the new one is confirmed.
        reset({ name: values.name, email: user?.email ?? "" });
      } else {
        toast.success("Profile saved");
        reset(values);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} noValidate className="max-w-lg space-y-5">
        <Field label="Full name" error={errors.name?.message}>
          {(id, d) => <Input id={id} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={d} {...register("name")} />}
        </Field>
        <Field
          label="Email"
          error={errors.email?.message}
          hint="If you change it, we'll send a code to the new address to confirm it's yours."
        >
          {(id, d) => <Input id={id} type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={d} {...register("email")} />}
        </Field>
        <Button type="submit" loading={isLoading} disabled={!isDirty}>
          Save changes
        </Button>
      </form>

      {pendingEmail && (
        <EmailChangePanel
          key={pendingEmail}
          email={pendingEmail}
          onDone={() => setPendingEmail(null)}
          onCancel={() => setPendingEmail(null)}
        />
      )}
    </div>
  );
}

function PasswordForm() {
  const [update, { isLoading }] = useUpdatePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ oldPassword, newPassword }) => {
    try {
      await update({ oldPassword, newPassword }).unwrap();
      toast.success("Password changed");
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-lg space-y-5">
      <Field label="Current password" error={errors.oldPassword?.message}>
        {(id, d) => <PasswordInput id={id} autoComplete="current-password" aria-invalid={!!errors.oldPassword} aria-describedby={d} {...register("oldPassword")} />}
      </Field>
      <Field label="New password" error={errors.newPassword?.message} hint="At least 8 characters.">
        {(id, d) => <PasswordInput id={id} autoComplete="new-password" aria-invalid={!!errors.newPassword} aria-describedby={d} {...register("newPassword")} />}
      </Field>
      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        {(id, d) => <PasswordInput id={id} autoComplete="new-password" aria-invalid={!!errors.confirmPassword} aria-describedby={d} {...register("confirmPassword")} />}
      </Field>
      <Button type="submit" loading={isLoading}>
        Change password
      </Button>
    </form>
  );
}

export function ProfileView() {
  const [tab, setTab] = useState<"account" | "password">("account");
  return (
    <div className="space-y-10">
      <AvatarUpload />
      <div>
        <Tabs
          label="Profile sections"
          value={tab}
          onChange={setTab}
          items={[
            { value: "account", label: "Account details" },
            { value: "password", label: "Password" },
          ]}
        />
        <div className="pt-8">{tab === "account" ? <AccountForm /> : <PasswordForm />}</div>
      </div>
    </div>
  );
}
