// app/api/cars/[id]/route.ts
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid car ID" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch car info
    const car = await sql`
      SELECT *
      FROM auto_model
      WHERE auto_id = ${numericId}
    `;

    if (car.length === 0) {
      return NextResponse.json(
        { error: "Car not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Fetch compatible products
    const products = await sql`
      SELECT
        p.product_id,
        p.product_name,
        p.product_merk,
        p.part_number,
        p.verkoop_prijs,
        p.stock_quantity,
        c.category_name
      FROM product_compatibility pc
      JOIN products p ON p.product_id = pc.product_id
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE pc.auto_id = ${numericId}
      ORDER BY p.product_name
    `;

    return NextResponse.json({
      car: car[0],
      products
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch car details" },
      { status: 500 }
    );
  }
}
