import { z } from "zod";

// Shared password rule: at least 6 characters (matches backend minlength)
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: passwordSchema,
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;