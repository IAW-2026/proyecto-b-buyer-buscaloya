import sql from '@/app/lib/db';
import { Purchase, Order } from '@/app/lib/definitions';
import { auth } from '@clerk/nextjs/server';
export async function getActivePurchase() {
  const {userId} = await auth();

  const activePurchases = await sql`
    SELECT purchase_id, amount, status 
    FROM purchases 
    WHERE client_id = ${userId} 
    AND status IN ('PENDING', 'PAID')
    LIMIT 1
  `;
  return activePurchases.length > 0 ? activePurchases[0] as Purchase : null;
}

export async function getPurchasePackages(purchaseId: string) {
  const packages = await sql`
    SELECT order_id, store_name, status, delivery_code 
    FROM orders 
    WHERE purchase_id = ${purchaseId}
  `;
  return packages as Order[];
}