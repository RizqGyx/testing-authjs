"use server";

import { registerSchema, loginSchema } from "@/lib/zod";
import { hashSync, compareSync } from "bcrypt-ts";
import { prisma } from "@/lib/prisma";

export const signUpCredentials = async (prevState: unknown, data: FormData) => {
  const formValues = Object.fromEntries(data.entries());
  const plainValues = Object.fromEntries(
    Object.entries(formValues).map(([key, value]) => [key, String(value)])
  );

  const validateFields = registerSchema.safeParse(plainValues);

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
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: { email: ["Email already exists"] } };
    }
    return { message: "Failed to register user" };
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
  } catch (error) {
    return { message: "Failed to sign in. Please try again." };
  }
};
