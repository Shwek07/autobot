// app/api/admin/users/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Extract user ID from URL
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

  const body = await request.json();
  const { is_active, roles } = body;

  await sql`
    UPDATE users
    SET 
      is_active = ${is_active},
      roles = ${roles}
    WHERE user_id = ${id}
  `;

  return NextResponse.json({ success: true });
}
