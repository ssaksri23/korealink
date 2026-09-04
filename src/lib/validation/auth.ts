import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    displayName: z.string().min(1).max(50),
    email: z.string().min(1).email(),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "PASSWORD_MISMATCH",
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().min(1).email(),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
