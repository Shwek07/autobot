import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { query } from "@/lib/db" // Changed from { pool } to { query }

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
  
  interface User {
    id?: string;
    role?: string;
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    })
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
        )

        if (result.rows.length === 0) {
          // User does not exist → create
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
              "USER"
            ]
          )
        }

        return true
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const result = await query(
            "SELECT user_id, roles FROM users WHERE email = $1",
            [user.email]
          )
          
          if (result.rows.length > 0) {
            token.id = result.rows[0].user_id
            token.role = result.rows[0].roles
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }