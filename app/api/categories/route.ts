import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    console.log("Fetching categories...");
    
    // Simple query to get all categories
    const categories = await sql`
      SELECT category_id, category_name 
      FROM categories
      ORDER BY category_name
    `;
    
    console.log("Categories fetched:", categories);
    
    // Return the categories (even if empty array)
    return NextResponse.json(categories || []);
    
  } catch (error) {
    console.error("Error in categories API:", error);
    
    // Return a more detailed error
    return NextResponse.json(
      { 
        error: "Failed to fetch categories", 
        details: error instanceof Error ? error.message : String(error),
        hint: "Check if categories table exists and has data"
      },
      { status: 500 }
    );
  }
}