import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

type AutoRow = { auto_id: number };

type ProductRow = {
  product_id: number;
  category_id: number | null;
  product_name: string | null;
  part_number: string | null;
  description: string | null;
  sku: string | null;
  product_merk: string | null;
  inkoop_prijs: string | null;
  verkoop_prijs: string | null;
  stock_quantity: number | null;
  is_active: number | null;
  created_at: string | null;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const brand = (searchParams.get("brand") ?? "").trim();
    const model = (searchParams.get("model") ?? "").trim();
    const yearRaw = (searchParams.get("year") ?? "").trim();

    if (!brand || !model || !yearRaw) {
      return NextResponse.json({ error: "Missing brand/model/year" }, { status: 400 });
    }

    const year = Number(yearRaw);
    if (!Number.isFinite(year)) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 1) Vind auto_id
    const autoRows = (await sql`
      SELECT auto_id
      FROM auto_model
      WHERE auto_merk = ${brand}
        AND auto_model = ${model}
        AND bouwjaar = ${year}
      LIMIT 1
    `) as AutoRow[];

    if (!autoRows.length) {
      return NextResponse.json({
        auto: { brand, model, year },
        products: [],
        message: "No matching car found in auto_model",
      });
    }

    const auto_id = autoRows[0].auto_id;

    // 2) Haal producten via product_compatibility
    const products = (await sql`
      SELECT DISTINCT
        p.product_id,
        p.category_id,
        p.product_name,
        p.part_number,
        p.description,
        p.sku,
        p.product_merk,
        p.inkoop_prijs,
        p.verkoop_prijs,
        p.stock_quantity,
        p.is_active,
        p.created_at
      FROM product_compatibility pc
      JOIN products p ON p.product_id = pc.product_id
      WHERE pc.auto_id = ${auto_id}
        AND (p.is_active IS NULL OR p.is_active = 1)
      ORDER BY p.product_name NULLS LAST
      LIMIT 200
    `) as ProductRow[];

    return NextResponse.json({
      auto: { brand, model, year, auto_id },
      products,
    });
  } catch (err) {
    console.error("by-car error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}