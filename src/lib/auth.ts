import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import {loginSchema} from "@/lib/zod";
import { compareSync } from "bcrypt-ts";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [Google, Github, Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      const validateFields = loginSchema.safeParse(credentials);

      if (!validateFields.success) {
        return null;
      }

      const { email, password } = validateFields.data;
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = compareSync(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }
  })],
});
