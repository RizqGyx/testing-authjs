"use server";

import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/zod";
import { hashSync } from "bcrypt-ts";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export const signUpCredentials = async (prevState: unknown, data: FormData) => {
  const formValues = Object.fromEntries(data.entries());
  const plainValues = Object.fromEntries(
    Object.entries(formValues).map(([key, value]) => [key, String(value)])
  );

  const validated = registerSchema.safeParse(plainValues);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;
  const hashedPassword = hashSync(password, 12);

  try {
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: { email: ["Email already exists"] } };
    }
    return { message: "Failed to register user" };
  }
};

export const signInCredentials = async (prevState: unknown, data: FormData) => {
  const formValues = Object.fromEntries(data.entries());
  const plainValues = Object.fromEntries(
    Object.entries(formValues).map(([key, value]) => [key, String(value)])
  );

  const validated = loginSchema.safeParse(plainValues);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, message: "Account not found" };
  }

  if (user.status === "BANNED") {
    return { success: false, message: "Your account has been suspended. Please contact support." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid email or password" };
        default:
          return { success: false, message: "Failed to sign in. Please try again." };
      }
    }
    return { success: false, message: "Unexpected error occurred" };
  }
};

export async function signInWithProvider(provider: string) {
  await signIn(provider, { redirectTo: "/dashboard" });
}

export async function signOutAccount() {
  await signOut({ redirectTo: "/login" });
}

export const forgotPassword = async (prevState: unknown, data: FormData) => {
  const validated = forgotPasswordSchema.safeParse({ email: data.get("email") });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { email } = validated.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user || !user.password) {
    return { success: true };
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  // In production: send email with reset link
  // For demo, return the reset link directly
  const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  return { success: true, resetUrl };
};

export const resetPassword = async (prevState: unknown, data: FormData) => {
  const formValues = Object.fromEntries(data.entries());
  const plainValues = Object.fromEntries(
    Object.entries(formValues).map(([key, value]) => [key, String(value)])
  );

  const validated = resetPasswordSchema.safeParse(plainValues);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { token, newPassword } = validated.data;

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    return { error: { token: ["Invalid or expired reset token"] } };
  }

  const user = await prisma.user.findUnique({ where: { email: record.identifier } });
  if (!user) {
    return { error: { token: ["User not found"] } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashSync(newPassword, 12) },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return { success: true };
};
