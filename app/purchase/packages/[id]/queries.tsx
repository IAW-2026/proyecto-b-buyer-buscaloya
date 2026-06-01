import sql from '@/app/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Order, OrderItem } from '@/app/lib/definitions';

export async function getPackageDetails(orderId: string): Promise<Order | null> {
  const { userId } = await auth();
  
  // Hacemos un JOIN con purchases para validar que el userId coincide
  const result = await sql`
    SELECT 
      o.order_id, 
      o.store_name, 
      o.status, 
      o.delivery_code,
      a.lat AS buyer_lat, 
      a.lng AS buyer_lng,
      a.street AS buyer_street
    FROM orders o
    JOIN purchases p ON o.purchase_id = p.purchase_id
    JOIN addresses a ON p.address_id = a.address_id
    WHERE o.order_id = ${orderId}::uuid AND p.client_id = ${userId}
  `;
  const items = await sql`
    SELECT product_name, quantity
    FROM order_items
    WHERE order_id = ${orderId}::uuid
  `;
  if (result.length === 0) return null;

  const order = result[0] as Order;
  order.items = items as OrderItem[];
  return order;
}

