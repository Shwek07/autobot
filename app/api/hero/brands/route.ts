import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const rows = await sql`
      SELECT DISTINCT auto_merk 
      FROM auto_model 
      ORDER BY auto_merk
    `;
    
    const brands = rows.map(row => row.auto_merk);
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" }, 
      { status: 500 }
    );
  }
}