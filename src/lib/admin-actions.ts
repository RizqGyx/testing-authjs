"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
  return session.user;
}

export async function getAllUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  const currentUser = await requireAdmin();

  if (userId === currentUser.id) {
    return { error: "Cannot change your own role" };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "BANNED") {
  const currentUser = await requireAdmin();

  if (userId === currentUser.id) {
    return { error: "Cannot change your own status" };
  }

  await prisma.user.update({ where: { id: userId }, data: { status } });

  revalidatePath("/dashboard/admin");
  return { success: true };
}
