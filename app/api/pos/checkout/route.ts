// app/api/pos/checkout/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  const { items, paymentMethod } = await request.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const total = items.reduce(
    (sum: number, item: any) => sum + item.verkoop_prijs * item.quantity,
    0
  );

  try {
    await sql`BEGIN`;

    const order =
      await sql`INSERT INTO orders (total_amount, payment_method)
                VALUES (${total}, ${paymentMethod})
                RETURNING order_id`;

    const orderId = order[0].order_id;

    for (const item of items) {
      // Controleer voorraad
      const product =
        await sql`SELECT stock_quantity FROM products WHERE product_id = ${item.product_id}`;

      if (!product.length || product[0].stock_quantity < item.quantity) {
        throw new Error("Insufficient stock");
      }

      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_sale)
        VALUES (${orderId}, ${item.product_id}, ${item.quantity}, ${item.verkoop_prijs})
      `;

      await sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE product_id = ${item.product_id}
      `;
    }

    await sql`COMMIT`;

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    await sql`ROLLBACK`;
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
  }
}
