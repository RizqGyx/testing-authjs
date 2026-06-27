"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema, changePasswordSchema } from "@/lib/zod";
import { hashSync, compareSync } from "bcrypt-ts";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updateProfile(prevState: unknown, data: FormData) {
  const userId = await requireAuth();

  const validated = updateProfileSchema.safeParse({ name: data.get("name") });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: validated.data.name },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, message: "Profile updated successfully" };
}

export async function changePassword(prevState: unknown, data: FormData) {
  const userId = await requireAuth();

  const formValues = Object.fromEntries(data.entries());
  const plainValues = Object.fromEntries(
    Object.entries(formValues).map(([key, value]) => [key, String(value)])
  );

  const validated = changePasswordSchema.safeParse(plainValues);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.password) {
    return { error: "Cannot change password for OAuth accounts" };
  }

  const isValid = compareSync(validated.data.currentPassword, user.password);
  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashSync(validated.data.newPassword, 12) },
  });

  return { success: true, message: "Password changed successfully" };
}
