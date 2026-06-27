"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { object, string } from "zod";
import { revalidatePath } from "next/cache";

const postSchema = object({
  title: string().min(1, "Title is required").max(255, "Title must be at most 255 characters"),
  content: string().max(10000, "Content must be at most 10,000 characters").optional(),
});

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createPost(prevState: unknown, data: FormData) {
  const userId = await requireAuth();

  const validated = postSchema.safeParse({
    title: data.get("title"),
    content: data.get("content") || undefined,
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    const post = await prisma.post.create({
      data: {
        title: validated.data.title,
        content: validated.data.content,
        authorId: userId,
        published: false,
      },
    });
    revalidatePath("/dashboard/posts");
    revalidatePath("/dashboard");
    revalidatePath("/blog");
    return { success: true, postId: post.id };
  } catch {
    return { error: "Failed to create post" };
  }
}

export async function updatePost(id: string, prevState: unknown, data: FormData) {
  const userId = await requireAuth();

  const validated = postSchema.safeParse({
    title: data.get("title"),
    content: data.get("content") || undefined,
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const post = await prisma.post.findFirst({ where: { id, authorId: userId } });
  if (!post) return { error: "Post not found" };

  await prisma.post.update({
    where: { id },
    data: {
      title: validated.data.title,
      content: validated.data.content,
    },
  });

  revalidatePath("/dashboard/posts");
  revalidatePath(`/blog/${id}`);
  revalidatePath("/blog");
  return { success: true };
}

export async function deletePost(id: string) {
  const userId = await requireAuth();

  await prisma.post.deleteMany({ where: { id, authorId: userId } });

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");
  revalidatePath("/blog");
  return { success: true };
}

export async function togglePublish(id: string) {
  const userId = await requireAuth();

  const post = await prisma.post.findFirst({ where: { id, authorId: userId } });
  if (!post) return { error: "Post not found" };

  await prisma.post.update({
    where: { id },
    data: { published: !post.published },
  });

  revalidatePath("/dashboard/posts");
  revalidatePath(`/blog/${id}`);
  revalidatePath("/blog");
  return { success: true, published: !post.published };
}
