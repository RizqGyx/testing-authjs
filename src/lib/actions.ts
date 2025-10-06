"use server";

import { registerSchema, loginSchema } from "@/lib/zod";
import { hashSync} from "bcrypt-ts";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

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
  const formValues = Object.fromEntries(data.entries());
  const plainValues = Object.fromEntries(
    Object.entries(formValues).map(([key, value]) => [key, String(value)])
  );

  const validateFields = loginSchema.safeParse(plainValues);

  if (!validateFields.success) {
    return { error: validateFields.error.flatten().fieldErrors };
  }

  const {  email, password } = validateFields.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "Account Not Found" };
    }

    await signIn("credentials", {email, password, redirect: false})

    return { success: true };
  } catch (error: any) {
    if(error instanceof AuthError) {
      switch(error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid email or password" };
        default:
          return { success: false, message: "Failed to sign in. Please try again." };
      }
    }
    
    return { success: false, message: "Unexpected error occurred" };
  }
}