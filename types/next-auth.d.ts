// types/next-auth.d.ts
import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      is_active?: number; // <- add this
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    is_active?: number; // <- add this
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    is_active?: number; // <- add this
  }
}
