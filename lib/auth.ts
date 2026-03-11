// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // SignIn: reject login if user is deactivated
    async signIn({ user }) {
      try {
        const result = await query("SELECT * FROM users WHERE email = $1", [user.email]);

        if (result.rows.length > 0 && result.rows[0].is_active === 0) {
          console.log("Deactivated user tried to log in:", user.email);
          return false; // reject login
        }

        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },

    async jwt({ token }) {
      if (token.email) {
        const result = await query(
          "SELECT user_id, roles, is_active FROM users WHERE email = $1",
          [token.email]
        );

        if (result.rows.length > 0) {
          token.id = result.rows[0].user_id;
          token.role = result.rows[0].roles;
          token.is_active = result.rows[0].is_active;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.is_active = token.is_active;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
