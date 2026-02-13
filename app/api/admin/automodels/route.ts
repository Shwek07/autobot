import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const products = await sql`SELECT * FROM auto_model`;
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
