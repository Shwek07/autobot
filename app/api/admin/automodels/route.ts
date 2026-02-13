// app/api/admin/automodels/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const models = await sql`
      SELECT * FROM auto_model 
      ORDER BY auto_merk ASC, auto_model ASC, created_at DESC
    `;
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await sql`
      INSERT INTO auto_model (
        auto_merk, auto_model, bouwjaar, engine_variant, body_type
      ) VALUES (
        ${body.auto_merk}, ${body.auto_model}, 
        ${body.bouwjaar || null}, ${body.engine_variant || null},
        ${body.body_type || null}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create auto model' }, { status: 500 });
  }
}