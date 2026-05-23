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
