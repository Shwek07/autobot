
// app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const products = await sql`
      SELECT p.*, c.category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await sql`
      INSERT INTO products (
        product_name, product_merk, part_number, sku, description,
        category_id, verkoop_prijs, inkoop_prijs, stock_quantity, is_active
      ) VALUES (
        ${body.product_name}, ${body.product_merk}, ${body.part_number},
        ${body.sku || null}, ${body.description || null}, ${body.category_id},
        ${body.verkoop_prijs}, ${body.inkoop_prijs || null},
        ${body.stock_quantity}, ${body.is_active}
      )
      RETURNING *
    `;

    // Log naar audit_log
    await sql`
      INSERT INTO audit_log (user_id, action_type, table_name, record_id, new_value)
      VALUES (1, 'CREATE', 'products', ${result[0].product_id}, ${JSON.stringify(body)})
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}