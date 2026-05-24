'use server';

import sql from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

const UpdateUserSchema = z.object({
  client_id: z.string(),
  email: z.string(),
  name: z.string().min(2).max(100),
  phone: z.string().optional()
});

export type State = {
  success?: boolean;
  error?: string | null;
};

export async function updateUserAction(prevState: State | undefined, formData: FormData): Promise<State> {
  const parsedData = UpdateUserSchema.safeParse({
    client_id: String(formData.get('client_id')),
    email: String(formData.get('email') || ''),
    name: String(formData.get('name') || ''),
    phone: String(formData.get('phone') || '')
  });
  console.log('Datos recibidos para actualización:', formData.get('client_id'), formData.get('email'), formData.get('name'), formData.get('phone'));
  if (!parsedData.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { client_id, email, name, phone } = parsedData.data;
  try {
    await sql`
      UPDATE users
      SET email = ${email}, name = ${name}, phone = ${phone}
      WHERE client_id = ${client_id}
   `;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return { success: false, error: 'No se pudo actualizar el usuario' };
  }
  revalidatePath(`/admin/users/${client_id}/edit`);
  return { success: true };
}

const UpdateAddressSchema = z.object({
  address_id: z.string(),
  client_id: z.string(),
  title: z.string().min(2).max(100),
  street: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  lat: z.number(),
  lng: z.number()
});
const UpdateAddressSchemaWhitOutChecks = UpdateAddressSchema.partial({ address_id: true, client_id: true });

export async function updateAddressAction(prevState: State | undefined, formData: FormData): Promise<State> {
  const parsedData = UpdateAddressSchemaWhitOutChecks.safeParse({
    address_id: String(formData.get('address_id')),
    client_id: String(formData.get('client_id')),
    title: String(formData.get('title') || ''),
    street: String(formData.get('street') || ''),
    city: String(formData.get('city') || ''),
    lat: Number(formData.get('lat') || 0),
    lng: Number(formData.get('lng') || 0)
  });
  
  if (!parsedData.success) {
    return { success: false, error: 'Datos inválidos' };
  }
    
    const { address_id, client_id, title, street, city, lat, lng } = parsedData.data;
    console.log('Datos recibidos para actualización de dirección:', address_id, client_id, title, street, city, lat, lng);
  try {
    await sql`
      UPDATE addresses
      SET title = ${title}, street = ${street}, city = ${city}, lat = ${lat}, lng = ${lng}
      WHERE address_id = ${address_id}
    `;
    
  } catch (error) {
    console.error('Error actualizando dirección:', error);
    return { success: false, error: 'No se pudo actualizar la dirección' };
  }
    revalidatePath(`/admin/users/${client_id}/edit`);
    return { success: true };
}

export async function getAddressesAction() {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    const rows = await sql`SELECT address_id, title, street, city, lat, lng FROM addresses WHERE client_id = ${userId} ORDER BY title ASC`;
    return rows;
  } catch (err) {
    console.error('getAddresses error:', err);
    return [];
  }
}

async function mokedSendCartAction(items: any[], stores: any[], payload: any) {
  // Simula latencia
  await new Promise((r) => setTimeout(r, 400));

  // Calcula amount (igual que la versión real)
  const amount = (items || []).reduce((s: number, it: any) => s + (Number(it.productPrice ?? it.price ?? 0) * Number(it.quantity ?? 0)), 0);

  // Construye packages con store_name y product_name (fallbacks si faltan datos)
  const packages = (stores || []).map((s: any, i: number) => {
    const storeName = s.store_name ?? s.storeName ?? s.name ?? `store-${s.store_id}`;
    const packagedItems = (s.items || []).map((it: any) => ({
      product_name: it.product_name ?? it.productName ?? it.product_id ?? it.productId ?? String(it.product_id ?? it.productId ?? ''),
      quantity: Number(it.quantity ?? 0),
    }));
    return {
      package_id: crypto.randomUUID(),
      store_name: storeName,
      items: packagedItems,
    };
  });

  const mockResponse = {
    payment_order_id: crypto.randomUUID(),
    amount,
    packages,
  };


  // Devuelve un objeto que imita la Response de fetch
  return {
    ok: true,
    status: 200,
    json: async () => mockResponse,
    text: async () => JSON.stringify(mockResponse),
  };
}

async function realSendCartAction(token: string | null, payload: any) {
  // Retorna el Response del fetch para que el caller pueda leer .ok/.status/.json()
  return await fetch(`${process.env.SELLER_API_URL}/api/seller/orders`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}


export async function sendCartAction({ addressId, items }: { addressId: string; items: any[] }) {
  try {
    const authRes = await auth();
    const { userId, getToken } = authRes as any;
    if (!userId) throw new Error('Not authenticated');

    const [addr] = await sql`SELECT street, city, lat, lng FROM addresses WHERE address_id = ${addressId} AND client_id = ${userId}`;
    if (!addr) throw new Error('Address not found');

    // Fragment items by storeId
    const storesMap: Record<string, { store_id: string; items: Array<{ product_id: string; quantity: number }> }> = {};
    for (const it of items || []) {
      const sid = String(it.storeId ?? it.store_id ?? 'unknown');
      if (!storesMap[sid]) storesMap[sid] = { store_id: sid, items: [] };
      storesMap[sid].items.push({ product_id: it.productId ?? it.product_id ?? String(it.productId || ''), quantity: Number(it.quantity || 0) });
    }
    const stores = Object.values(storesMap);

    const payload = {
      buyer_address: {
        city: addr.city,
        street: addr.street,
        lat: Number(addr.lat),
        lng: Number(addr.lng),
      },
      buyer_id: userId,
      stores,
    };

    const isMocking = true;
    try {
      const token = getToken ? await getToken() : null;
      const resp = isMocking ? await mokedSendCartAction(items, stores, payload) : await realSendCartAction(token, payload);
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Seller API error: ${resp.status} ${text}`);
      }
      const data = await resp.json();
      // Persist purchase and orders in DB and return purchaseId
      const purchaseId = await createOrderInDB(userId, addressId, data);
      return { sellerResponse: data, purchaseId };
    } catch (err) {
      console.error('Error calling Seller API:', err);
      throw err;
    }
    
  } catch (err) {
    console.error('sendOrderAction error:', err);
    throw err;
  }
}

export async function createOrderInDB(userId: string, addressId: string, data: any) {  
  const purchaseId = data.payment_order_id;
  const sellerAmount = Number(data.amount ?? 0);

  const queries = [];
    // Insert purchase (PENDING)
    queries.push(sql`
      INSERT INTO purchases (purchase_id, client_id, address_id, amount, status)
      VALUES (${purchaseId}, ${userId}, ${addressId}, ${sellerAmount}, 'PENDING')
    `);

    // Insert orders + items from seller packages
    for (const pkg of (data.packages || [])) {
      const orderId = pkg.package_id;
      const storeName = pkg.store_name ?? 'unknown-store';

      queries.push(sql`
        INSERT INTO orders (order_id, purchase_id, store_name, status)
        VALUES (${orderId}, ${purchaseId}, ${storeName}, 'PREPARING')
      `);

      for (const it of (pkg.items || [])) {
        const productName = it.product_name;
        const qty = Number(it.quantity ?? 0);
        queries.push(sql`
          INSERT INTO order_items (order_id, product_name, quantity)
          VALUES (${orderId}, ${productName}, ${qty})
        `);
      }
    }
try{
    await sql.transaction(queries);
  } catch (dbErr) {
    console.error('Error saving purchase/orders:', dbErr);
    throw dbErr;
  }

  return purchaseId;
}