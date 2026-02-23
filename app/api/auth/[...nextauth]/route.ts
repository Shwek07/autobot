// app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Export NextAuth options so we can use `getServerSession(authOptions)` elsewhere
 */
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
    // Handle user sign-in (Google OAuth)
    async signIn({ user, account }) {
      try {
        console.log("Attempting sign-in for user:", user.email);

        // Check if user already exists
        const result = await query("SELECT * FROM users WHERE email = $1", [user.email]);
        console.log("Database query result:", result.rows);

        if (result.rows.length === 0) {
          // Assign role: ADMIN for your email, else USER
          const role = user.email === "your@email.com" ? "ADMIN" : "USER";

          // Split first and last name safely
          const [firstName, ...rest] = user.name?.split(" ") || [];
          const lastName = rest.join(" ") || "";

          // Insert new user into DB
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

          console.log("New user inserted successfully:", user.email);
        }

        return true;
      } catch (error: any) {
        console.error("SignIn error message:", error.message);
        console.error("SignIn full stack:", error.stack);
        return false;
      }
    },

    // Attach user ID and role to JWT
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
      } catch (error: any) {
        console.error("JWT error:", error.message);
      }

      return token;
    },

    // Expose JWT data in session
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

// Use the same options for the NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
