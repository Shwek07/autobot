// app/actions/sales.ts
'use server';

import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getSalesHistory(
  page: number = 1,
  limit: number = 20,
  search?: string,
  startDate?: string,
  endDate?: string,
  paymentMethod?: string
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Niet geautoriseerd');
  }

  const offset = (page - 1) * limit;
  
  // Basis query voor orders
  let ordersQuery = `
    SELECT 
      o.order_id,
      o.total_amount,
      o.payment_method,
      o.created_at
    FROM orders o
    WHERE 1=1
  `;

  // Arrays voor parameters
  const orderParams: any[] = [];
  let paramIndex = 1;

  // Filters toepassen voor orders query
  if (search) {
    ordersQuery += ` AND o.order_id::text ILIKE $${paramIndex}`;
    orderParams.push(`%${search}%`);
    paramIndex++;
  }

  if (startDate) {
    ordersQuery += ` AND DATE(o.created_at) >= $${paramIndex}`;
    orderParams.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    ordersQuery += ` AND DATE(o.created_at) <= $${paramIndex}`;
    orderParams.push(endDate);
    paramIndex++;
  }

  if (paymentMethod && paymentMethod !== 'all') {
    ordersQuery += ` AND o.payment_method = $${paramIndex}`;
    orderParams.push(paymentMethod);
    paramIndex++;
  }

  // Count query met dezelfde parameters
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM orders o 
    WHERE 1=1
  `;
  
  // Copy dezelfde parameters voor count query
  const countParams: any[] = [];
  let countIndex = 1;

  if (search) {
    countQuery += ` AND o.order_id::text ILIKE $${countIndex}`;
    countParams.push(`%${search}%`);
    countIndex++;
  }

  if (startDate) {
    countQuery += ` AND DATE(o.created_at) >= $${countIndex}`;
    countParams.push(startDate);
    countIndex++;
  }

  if (endDate) {
    countQuery += ` AND DATE(o.created_at) <= $${countIndex}`;
    countParams.push(endDate);
    countIndex++;
  }

  if (paymentMethod && paymentMethod !== 'all') {
    countQuery += ` AND o.payment_method = $${countIndex}`;
    countParams.push(paymentMethod);
    countIndex++;
  }

  // Voer count query uit
  const countResult = await query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].total);

  // Voeg pagination toe aan orders query
  ordersQuery += `
    ORDER BY o.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  orderParams.push(limit, offset);

  // Voer orders query uit
  const ordersResult = await query(ordersQuery, orderParams);
  const orders = ordersResult.rows;

  // Voor elke order de items ophalen
  const salesWithItems = await Promise.all(
    orders.map(async (order) => {
      const itemsQuery = `
        SELECT 
          oi.order_item_id,
          oi.product_id,
          oi.quantity,
          oi.price_at_sale,
          p.product_name,
          p.product_merk,
          p.part_number
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = $1
      `;
      
      const itemsResult = await query(itemsQuery, [order.order_id]);
      const items = itemsResult.rows;
      
      return {
        order_id: order.order_id,
        total_amount: parseFloat(order.total_amount),
        payment_method: order.payment_method,
        created_at: order.created_at,
        total_items: items.length,
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name || 'Onbekend product',
          product_merk: item.product_merk || '-',
          quantity: item.quantity,
          price_at_sale: parseFloat(item.price_at_sale),
          part_number: item.part_number
        }))
      };
    })
  );

  return {
    sales: salesWithItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getSalesStats(
  startDate?: string,
  endDate?: string
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Niet geautoriseerd');
  }

  let queryText = `
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COALESCE(AVG(total_amount), 0) as average_order,
      COUNT(DISTINCT DATE(created_at)) as active_days
    FROM orders
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (startDate) {
    queryText += ` AND DATE(created_at) >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    queryText += ` AND DATE(created_at) <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const result = await query(queryText, params);
  
  return {
    total_orders: parseInt(result.rows[0].total_orders),
    total_revenue: parseFloat(result.rows[0].total_revenue),
    average_order: parseFloat(result.rows[0].average_order),
    active_days: parseInt(result.rows[0].active_days)
  };
}

export async function getOrderDetails(orderId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Niet geautoriseerd');
  }

  // Order ophalen
  const orderQuery = `
    SELECT 
      o.order_id,
      o.total_amount,
      o.payment_method,
      o.created_at
    FROM orders o
    WHERE o.order_id = $1
  `;
  
  const orderResult = await query(orderQuery, [orderId]);
  
  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  // Items ophalen
  const itemsQuery = `
    SELECT 
      oi.order_item_id,
      oi.product_id,
      oi.quantity,
      oi.price_at_sale,
      p.product_name,
      p.product_merk,
      p.part_number
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = $1
  `;
  
  const itemsResult = await query(itemsQuery, [orderId]);
  
  return {
    order_id: order.order_id,
    total_amount: parseFloat(order.total_amount),
    payment_method: order.payment_method,
    created_at: order.created_at,
    total_items: itemsResult.rows.length,
    items: itemsResult.rows.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name || 'Onbekend product',
      product_merk: item.product_merk || '-',
      quantity: item.quantity,
      price_at_sale: parseFloat(item.price_at_sale),
      part_number: item.part_number
    }))
  };
}