'use server';

import sql from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { mokedSendCartAction } from './mocks';
import { stringToUuid } from '@/app/lib/utils';

// ------------------------------------------------------------------
// LÓGICA DE USUARIOS
// ------------------------------------------------------------------

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
  
  // Recargamos ambas vistas (Admin y User)
  revalidatePath(`/admin/users/${client_id}/edit`);
  revalidatePath(`/user`);
  return { success: true };
}

// ------------------------------------------------------------------
// LÓGICA DE DIRECCIONES (CRUD)
// ------------------------------------------------------------------

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
  
  // Recargamos ambas vistas (Admin y User)
  revalidatePath(`/admin/users/${client_id}/edit`);
  revalidatePath(`/user`);
  return { success: true };
}

const CreateAddressSchema = z.object({
  client_id: z.string(),
  title: z.string().min(2).max(100),
  street: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  // Valores por defecto para lat/lng si no usamos un mapa interactivo para elegir
  lat: z.number().optional().default(-38.7183), 
  lng: z.number().optional().default(-62.2663)
});

export async function createAddressAction(prevState: State | undefined, formData: FormData): Promise<State> {
  const parsedData = CreateAddressSchema.safeParse({
    client_id: String(formData.get('client_id')),
    title: String(formData.get('title') || ''),
    street: String(formData.get('street') || ''),
    city: String(formData.get('city') || ''),
    lat: Number(formData.get('lat')) || -38.7183,
    lng: Number(formData.get('lng')) || -62.2663
  });
  
  if (!parsedData.success) {
    return { success: false, error: 'Datos de dirección inválidos' };
  }
    
  const { client_id, title, street, city, lat, lng } = parsedData.data;
  
  try {
    await sql`
      INSERT INTO addresses (client_id, title, street, city, lat, lng)
      VALUES (${client_id}, ${title}, ${street}, ${city}, ${lat}, ${lng})
    `;
  } catch (error) {
    console.error('Error creando dirección:', error);
    return { success: false, error: 'No se pudo guardar la dirección' };
  }
  
  // Recargamos ambas vistas (Admin y User)
  revalidatePath(`/admin/users/${client_id}/edit`);
  revalidatePath(`/user`);
  return { success: true };
}

export async function deleteAddressAction(address_id: string, client_id: string) {
  try {
    await sql`
      DELETE FROM addresses 
      WHERE address_id = ${address_id} AND client_id = ${client_id}
    `;
    
    // Recargamos ambas vistas (Admin y User)
    revalidatePath(`/admin/users/${client_id}/edit`);
    revalidatePath(`/user`);
    return { success: true };
  } catch (error) {
    console.error('Error borrando dirección:', error);
    throw new Error('No se pudo eliminar la dirección');
  }
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


async function realSendCartAction(payload: any, token: string | null) {
  // Retorna el Response del fetch para que el caller pueda leer .ok/.status/.json()
  return await fetch(`${process.env.SELLER_APP_URL}/api/seller/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}


//Función de ayuda (Helper) para estructurar los datos
function buildSellerPayload(addr: any, userInfo: any, userId: string, items: any[]) {
  const storesMap: Record<string, { store_id: string; items: Array<{ product_id: string; quantity: number }> }> = {};
  
  for (const it of items || []) {
    const sid = String(it.storeId ?? it.store_id ?? 'unknown');
    if (!storesMap[sid]) storesMap[sid] = { store_id: sid, items: [] };
    storesMap[sid].items.push({ 
      product_id: it.productId ?? it.product_id ?? String(it.productId || ''), 
      quantity: Number(it.quantity || 0) 
    });
  }

  return {
    buyer_address: {
      city: addr.city,
      street: addr.street,
      lat: Number(addr.lat),
      lng: Number(addr.lng),
    },
    buyer_id: userId,
    buyer_name: userInfo?.name || 'Cliente',
    buyer_phone: userInfo?.phone || '',
    stores: Object.values(storesMap),
  };
}

//Orquestador Principal (Server Action)
export async function sendCartAction({ addressId, items }: { addressId: string; items: any[] }) {
  try {
    // Autenticación
    const authRes = await auth();
    const { userId, getToken } = authRes as any;
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken();

    // Obtener Dirección Base
    const [addr] = await sql`SELECT street, city, lat, lng FROM addresses WHERE address_id = ${addressId} AND client_id = ${userId}`;
    if (!addr) throw new Error('Address not found');

    // Obtener info del usuario
    const [userInfo] = await sql`SELECT name, phone FROM users WHERE client_id = ${userId}`;

    // Construir el Payload (Delegado a la función helper)
    const payload = buildSellerPayload(addr, userInfo, userId, items);

    // Consumir API del Vendedor (Mock o Real dinámicamente)
    const isMocking = process.env.USE_MOCKS === 'true'; 
    
    // Validación de regla de negocio (Una sola compra activa)
    const activePurchases = await sql`
      SELECT purchase_id FROM purchases 
      WHERE client_id = ${userId} AND status NOT IN ('COMPLETED', 'CANCELLED')
    `;
    
    if (activePurchases.length > 0) {
      throw new Error('ACTIVE_PURCHASE_EXISTS');
    }

    const resp = isMocking 
      ? await mokedSendCartAction(items, payload.stores) 
      : await realSendCartAction(payload, token);
      
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Seller API error: ${resp.status} ${text}`);
    }
    
    const data = await resp.json();

    // Persistir en Base de Datos Local
    const purchaseId = await createOrderInDB(userId, addressId, data);
    
    // Calcular URL de redirección
    const externalPaymentsUrl = process.env.PAYMENTS_APP_URL;
    
    const redirectUrl = isMocking 
      ? `/payments/${purchaseId}` // Va a tu pasarela simulada (que luego ejecuta simulatePaymentSuccess)
      : `${externalPaymentsUrl}/checkout/${purchaseId}`; // Redirige a la app externa real de Payments
    
    // Devolvemos la URL al cliente
    return { sellerResponse: data, purchaseId, redirectUrl };
    
  } catch (err) {
    console.error('sendOrderAction error:', err);
    throw err;
  }
}

async function createOrderInDB(userId: string, addressId: string, data: any) {  
  const purchaseId = stringToUuid(data.payment_order_id);
  const sellerAmount = Number(data.amount ?? 0);
  const queries = [];

  // Insertar compra global
  queries.push(sql`
    INSERT INTO purchases (purchase_id, client_id, address_id, amount)
    VALUES (${purchaseId}, ${userId}, ${addressId}, ${sellerAmount})
  `);

  // Insertar paquetes (orders) e ítems
  for (const pkg of (data.packages || [])) {
    const orderId = stringToUuid(pkg.package_id);
    const storeName = pkg.store_name ?? 'unknown-store';

    queries.push(sql`
      INSERT INTO orders (order_id, purchase_id, store_name, status)
      VALUES (${orderId}, ${purchaseId}, ${storeName}, 'PAYMENT_PENDING')
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

  try {
    await sql.transaction(queries);
  } catch (dbErr) {
    console.error('Error saving purchase/orders:', dbErr);
    throw dbErr;
  }

  return purchaseId;
}

// Función de ayuda para simular el llamado a Payments en modo mock (Solo para desarrollo local o pruebas)
export async function simulatePaymentStatusUpdate(purchaseId: string, status: 'PAID' | 'CANCELLED') {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${appUrl}/api/purchases/${purchaseId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BUYER_SERVICE_SECRET}` 
      },
      body: JSON.stringify({ status })
    });

    // Validamos primero si la respuesta falló
    if (!response.ok) {
      const errorText = await response.text(); // Leemos como texto por si es un HTML de error
      console.error('El webhook devolvió un error de servidor:', errorText);
      throw new Error(`Fallo en el Webhook (${response.status}): Ver logs del servidor.`);
    }

    const result = await response.json();
    console.log(`[Sandbox Payments] Webhook ejecutado con éxito:`, result.message);

    revalidatePath('/purchase');
    return { success: true };
    
  } catch (error) {
    console.error('Error en el simulador de pagos:', error);
    throw new Error('No se pudo procesar la simulación de estado');
  }
}

export async function cancelDeliveryAction(orderId: string) {
  try {
    const deliveryUrl = process.env.DELIVERY_APP_URL;
    const response = await fetch(`${deliveryUrl}/api/deliveries/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DELIVERY_SERVICE_SECRET}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Error al cancelar en la API del delivery:', errorText);
      throw new Error('No se pudo cancelar el paquete en el delivery.');
    }

    const data = await response.json();
    if (data.status === 'CANCELLED') {
      await sql`UPDATE orders SET status = 'CANCELLED' WHERE order_id = ${orderId}`;
      revalidatePath('/purchase');
      return { success: true };
    } else {
      throw new Error('Estado inesperado retornado por el delivery.');
    }
  } catch (error) {
    console.error('Error en cancelDeliveryAction:', error);
    throw new Error('Error interno al cancelar.');
  }
}