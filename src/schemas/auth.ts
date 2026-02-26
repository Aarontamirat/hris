import { z } from "zod";

const passwordRule = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128)
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a symbol");

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: passwordRule
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
