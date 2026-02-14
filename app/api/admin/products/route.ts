import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

/* ---------------- GET ALL ---------------- */
export async function GET() {
  try {
    const products = await sql`
      SELECT * FROM "products"
      ORDER BY product_id DESC
    `;

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}

/* ---------------- CREATE ---------------- */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      product_name,
      product_merk,
      part_number,
      description,
      verkoop_prijs,
      stock_quantity,
    } = body;

    if (
      !product_name ||
      !product_merk ||
      !part_number ||
      verkoop_prijs == null ||
      stock_quantity == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO "products"
      (product_name, product_merk, part_number, description, verkoop_prijs, stock_quantity)
      VALUES
      (${product_name}, ${product_merk}, ${part_number}, ${description}, ${verkoop_prijs}, ${stock_quantity})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Insert failed" },
      { status: 500 }
    );
  }
}
