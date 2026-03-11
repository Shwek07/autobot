// types/next-auth.d.ts
import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: number;
      role?: string;
      is_active?: number; 
    } & DefaultSession["user"];
  }

  interface User {
    id?: number;
    role?: string;
    is_active?: number; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
    role?: string;
    is_active?: number; 
  }
}
