"use server";

import { registerSchema, loginSchema } from "@/lib/zod";
import { hashSync, compareSync } from "bcrypt-ts";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const signUpCredentials = async (prevState: unknown,data: FormData) => {
  const validateFields = registerSchema.safeParse(
    Object.fromEntries(data.entries())
  );

  if (!validateFields.success) {
    return { error: validateFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validateFields.data;
  const hashedPassword = hashSync(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    return { message: "Failed to register and create user" };
  } finally {
    redirect("/login");
  }
};

export const signInCredentials = async (prevState: unknown, data: FormData) => {
  const validateFields = loginSchema.safeParse(
    Object.fromEntries(data.entries())
  );

  if (!validateFields.success) {
    return { error: validateFields.error.flatten().fieldErrors };
  }

  const { email, password } = validateFields.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return { message: "Invalid email or password" };
    }

    const isPasswordValid = compareSync(password, user.password);
    if (!isPasswordValid) {
      return { message: "Invalid email or password" };
    }

    redirect("/dashboard");
  } catch (error) {
    return { message: "Failed to sign in. Please try again." };
  }
};