// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { query } from "@/lib/db";

export const runtime = "nodejs";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      try {
        const result = await query(
          "SELECT * FROM users WHERE email = $1",
          [user.email]
        );

        if (result.rows.length === 0) {
          const role =
            user.email === "your@email.com" ? "ADMIN" : "USER";

          await query(
            `INSERT INTO users 
            (first_name, last_name, email, image, provider, provider_id, roles, created_at, is_active)
            VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),1)`,
            [
              user.name?.split(" ")[0] || "",
              user.name?.split(" ")[1] || "",
              user.email,
              user.image,
              account?.provider,
              account?.providerAccountId,
              role,
            ]
          );
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token }) {
      try {
        if (token.email) {
          const result = await query(
            "SELECT user_id, roles FROM users WHERE email = $1",
            [token.email]
          );

          if (result.rows.length > 0) {
            token.id = result.rows[0].user_id;
            token.role = result.rows[0].roles;
          }
        }
      } catch (error) {
        console.error("JWT error:", error);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };