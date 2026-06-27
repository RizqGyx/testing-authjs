import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, Github, Credentials],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const user = auth?.user;
      const path = nextUrl.pathname;

      // Redirect banned users out of protected areas
      if (isLoggedIn && user?.status === "BANNED" && !path.startsWith("/banned")) {
        return NextResponse.redirect(new URL("/banned", nextUrl));
      }

      // Admin-only routes
      if (path.startsWith("/dashboard/admin")) {
        if (!isLoggedIn || user?.role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
      }

      const protectedRoutes = ["/dashboard", "/profile"];
      const isProtected = protectedRoutes.some((r) => path.startsWith(r));

      if (!isLoggedIn && isProtected) {
        return NextResponse.redirect(new URL("/login", nextUrl));
      }

      const authRoutes = ["/login", "/register"];
      if (isLoggedIn && authRoutes.some((r) => path.startsWith(r))) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
});
