// lib/auth.ts

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
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

        const role =
          user.email === "ramdhiansing.shakeel.natin@gmail.com"
            ? "ADMIN"
            : "USER";

        if (result.rows.length === 0) {
          const [firstName, ...rest] = user.name?.split(" ") || [];
          const lastName = rest.join(" ") || "";

          await query(
            `INSERT INTO users
             (first_name, last_name, email, image, provider, provider_id, roles, passwords, created_at, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,'',NOW(),1)`,
            [
              firstName,
              lastName,
              user.email,
              user.image,
              account?.provider,
              account?.providerAccountId,
              role,
            ]
          );
        } else {
          if (role === "ADMIN" && result.rows[0].roles !== "ADMIN") {
            await query(
              `UPDATE users SET roles = 'ADMIN' WHERE email = $1`,
              [user.email]
            );
          }
        }

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    async jwt({ token }) {
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
};
