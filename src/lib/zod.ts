import { object, string } from "zod";

export const registerSchema = object({
  name: string()
    .min(3, "Name must be more than 3 Characters")
    .max(99, "Name must be less than 100 Characters"),
  email: string().email("Invalid email address"),
  password: string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  confirmPassword: string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = object({
  email: string().email("Invalid email address"),
  password: string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
})