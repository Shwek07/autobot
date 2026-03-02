// app/actions/orders.ts
'use server';

import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function createOrder(orderData: {
  items: any[];
  subtotal: number;
  btw: number;
  total: number;
  payment_method: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Niet geautoriseerd');
  }

  if (orderData.items.length === 0) {
    throw new Error('Winkelwagen is leeg');
  }

  try {
    // Start transaction
    await query('BEGIN');

    // 1. Insert order
    const orderResult = await query(
      `INSERT INTO orders (total_amount, payment_method, created_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING order_id`,
      [orderData.total, orderData.payment_method]
    );
    
    const orderId = orderResult.rows[0].order_id;

    // 2. Insert order items and update stock
    for (const item of orderData.items) {
      // Check of er genoeg voorraad is
      const stockCheck = await query(
        'SELECT stock_quantity FROM products WHERE product_id = $1',
        [item.product_id]
      );

      if (stockCheck.rows.length === 0) {
        throw new Error(`Product met ID ${item.product_id} niet gevonden`);
      }

      const currentStock = stockCheck.rows[0].stock_quantity;
      if (currentStock < item.quantity) {
        throw new Error(`Niet genoeg voorraad voor ${item.product_name}. Beschikbaar: ${currentStock}`);
      }

      // Insert order item
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_sale)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.verkoop_prijs]
      );

      // Update stock
      await query(
        `UPDATE products 
         SET stock_quantity = stock_quantity - $1 
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Commit transaction
    await query('COMMIT');

    return {
      order_id: orderId,
      ...orderData,
      created_at: new Date().toISOString()
    };

  } catch (error: any) {
    // Rollback bij error
    try {
      await query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    
    console.error('Order creation failed:', error);
    throw new Error(error.message || 'Bestelling kon niet worden verwerkt');
  }
}