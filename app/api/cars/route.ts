import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    
    console.log("Fetching cars with category:", category);
    
    let cars;
    
    if (category) {
      // Filter by category
      cars = await sql`
        SELECT DISTINCT
          a.auto_id,
          a.auto_merk,
          a.auto_model,
          a.bouwjaar,
          a.body_type
        FROM auto_model a
        JOIN product_compatibility pc ON pc.auto_id = a.auto_id
        JOIN products p ON p.product_id = pc.product_id
        WHERE p.category_id = ${Number(category)}
        ORDER BY a.auto_merk, a.auto_model;
      `;
    } else {
      // Get all cars
      cars = await sql`
        SELECT DISTINCT
          a.auto_id,
          a.auto_merk,
          a.auto_model,
          a.bouwjaar,
          a.body_type
        FROM auto_model a
        ORDER BY a.auto_merk, a.auto_model;
      `;
    }
    
    console.log(`Found ${cars.length} cars`);
    return NextResponse.json(cars);
    
  } catch (error) {
    console.error("Database error in cars API:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}