import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Enter your email").email("Enter a valid email address");
export const passwordSchema = z.string().min(8, "Use at least 8 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(60, "Keep it under 60 characters"),
  email: emailSchema,
  password: passwordSchema,
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(60, "Keep it under 60 characters"),
  email: emailSchema,
});

export const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
  .refine((d) => d.newPassword !== d.oldPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current one",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
