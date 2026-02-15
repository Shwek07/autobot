import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

/* ---------------- GET ALL AUTO MODELS ---------------- */
export async function GET() {
  try {
    const result = await sql`
      SELECT *
      FROM auto_model
      ORDER BY created_at DESC
    `;

    return Response.json(result);
  } catch (error) {
    console.error("Fetch auto models error:", error);
    return Response.json(
      { error: "Failed to fetch auto models" },
      { status: 500 }
    );
  }
}

/* ---------------- CREATE AUTO MODEL ---------------- */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      auto_merk,
      auto_model,
      bouwjaar,
      engine_variant,
      body_type,
      vin,
    } = body;

    // Basic validation
    if (!auto_merk || !auto_model || !bouwjaar) {
      return Response.json(
        { error: "Brand, model and year are required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO auto_model (
        auto_merk,
        auto_model,
        bouwjaar,
        engine_variant,
        body_type,
        vin
      )
      VALUES (
        ${auto_merk},
        ${auto_model},
        ${bouwjaar},
        ${engine_variant || null},
        ${body_type || null},
        ${vin || null}
      )
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Create auto model error:", error);
    return Response.json(
      { error: "Failed to create auto model" },
      { status: 500 }
    );
  }
}
