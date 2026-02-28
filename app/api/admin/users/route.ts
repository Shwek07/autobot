import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await sql`
    SELECT 
      user_id,
      first_name,
      last_name,
      email,
      phone,
      roles,
      created_at,
      is_active
    FROM users
    ORDER BY created_at DESC
  `;

  return NextResponse.json(users ?? []);
}
