import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const model = searchParams.get("model");

  if (!brand || !model) {
    return NextResponse.json(
      { error: "Brand and model are required" }, 
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const rows = await sql`
      SELECT DISTINCT bouwjaar 
      FROM auto_model 
      WHERE auto_merk = ${brand} 
      AND auto_model = ${model}
      ORDER BY bouwjaar DESC
    `;
    
    const years = rows.map(row => row.bouwjaar);
    return NextResponse.json(years);
  } catch (error) {
    console.error("Error fetching years:", error);
    return NextResponse.json(
      { error: "Failed to fetch years" }, 
      { status: 500 }
    );
  }
}