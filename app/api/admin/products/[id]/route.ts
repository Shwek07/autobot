// api/admin/products/[id]/route.ts

import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

/* ---------------- GET BY ID ---------------- */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const result = await sql`
    SELECT * FROM "products"
    WHERE product_id = ${numericId}
  `;

  if (result.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

/* ---------------- POST ---------------- */
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

    // Basic validation
    if (
      !product_name ||
      !product_merk ||
      !part_number ||
      verkoop_prijs === undefined ||
      stock_quantity === undefined
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO products (
        product_name,
        product_merk,
        part_number,
        description,
        verkoop_prijs,
        stock_quantity
      )
      VALUES (
        ${product_name},
        ${product_merk},
        ${part_number},
        ${description},
        ${verkoop_prijs},
        ${stock_quantity}
      )
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

/* ---------------- UPDATE ---------------- */
// PUT /api/admin/products/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const id = Number(params.id);

  const result = await sql`
    UPDATE products
    SET
      product_name = ${body.product_name},
      product_merk = ${body.product_merk},
      part_number = ${body.part_number},
      description = ${body.description},
      verkoop_prijs = ${body.verkoop_prijs},
      stock_quantity = ${body.stock_quantity}
    WHERE product_id = ${id}
    RETURNING *;
  `;

  return NextResponse.json(result);
}

/* ---------------- DELETE ---------------- */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 FIX
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return Response.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM "products"
      WHERE product_id = ${numericId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
