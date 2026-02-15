import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");

  if (!brand) {
    return NextResponse.json(
      { error: "Brand is required" }, 
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const rows = await sql`
      SELECT DISTINCT auto_model 
      FROM auto_model 
      WHERE auto_merk = ${brand}
      ORDER BY auto_model
    `;
    
    const models = rows.map(row => row.auto_model);
    return NextResponse.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" }, 
      { status: 500 }
    );
  }
}