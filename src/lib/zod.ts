import { object, string } from "zod";

export const registerSchema = object({
  name: string()
    .min(3, "Name must be at least 3 characters")
    .max(99, "Name must be less than 100 characters"),
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
});

export const forgotPasswordSchema = object({
  email: string().email("Invalid email address"),
});

export const resetPasswordSchema = object({
  token: string().min(1),
  newPassword: string().min(8, "Password must be at least 8 characters"),
  confirmPassword: string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = object({
  name: string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
});

export const changePasswordSchema = object({
  currentPassword: string().min(1, "Current password is required"),
  newPassword: string().min(8, "New password must be at least 8 characters"),
  confirmPassword: string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const todoSchema = object({
  title: string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  description: string().max(500, "Description must be at most 500 characters").optional(),
});
