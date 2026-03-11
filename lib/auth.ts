// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query } from "@/lib/db";

// console.log("DEBUG INFO");
// console.log("AUTH_GOOGLE_ID:", process.env.AUTH_GOOGLE_ID ? "✅ GEVONDEN" : "❌ NIET GEVONDEN");
// console.log("AUTH_GOOGLE_ID lengte:", process.env.AUTH_GOOGLE_ID?.length || 0);
// console.log("AUTH_GOOGLE_SECRET:", process.env.AUTH_GOOGLE_SECRET ? "✅ GEVONDEN" : "❌ NIET GEVONDEN");
// console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
// console.log("NODE_ENV:", process.env.NODE_ENV);
// console.log("EINDE DEBUG");

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
    async signIn({ user, account }) {
      try {
        if (!user.email) {
          console.log("Geen email ontvangen van Google");
          return false;
        }

        const existingUser = await query(
          "SELECT * FROM users WHERE email = $1",
          [user.email]
        );

        // Als user al bestaat
        if (existingUser.rows.length > 0) {
          if (existingUser.rows[0].is_active === 0) {
            console.log("Deactivated user tried to log in:", user.email);
            return false;
          }

          // Eventueel OAuth info bijwerken
          await query(
            `UPDATE users
             SET image = $1,
                 provider = $2,
                 provider_id = $3
             WHERE email = $4`,
            [
              user.image || null,
              account?.provider || "google",
              account?.providerAccountId || null,
              user.email,
            ]
          );

          return true;
        }

        // Nieuwe user aanmaken
        const fullName = user.name?.trim() || "";
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await query(
          `INSERT INTO users
           (first_name, last_name, email, roles, is_active, image, provider, provider_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            firstName,
            lastName,
            user.email,
            "USER",
            1,
            user.image || null,
            account?.provider || "google",
            account?.providerAccountId || null,
          ]
        );

        console.log("Nieuwe Google user aangemaakt:", user.email);
        return true;
      } catch (err) {
        console.error("signIn error:", err);
        return false;
      }
    },

    async jwt({ token }) {
      try {
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
      } catch (err) {
        console.error("jwt callback error:", err);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as string;
        session.user.is_active = token.is_active as number;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};