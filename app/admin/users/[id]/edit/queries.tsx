import sql from '@/app/lib/db';
import { User, Address }  from '@/app/lib/definitions';

export async function getUserById(id: string): Promise<User[]> {
  try {
    const user = await sql`
      SELECT client_id, name, email, phone, role
      FROM users
      WHERE client_id = ${id}
    `;
    return user as User[];
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Failed to fetch user');
  }
}

export async function getUserAddresses(clientId: string) {
  try {
    const addresses = await sql`
      SELECT address_id, title, street, city, lat, lng
      FROM addresses
      WHERE client_id = ${clientId}
    `;
    return addresses as Address[];
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw new Error('Failed to fetch user addresses');
  }
}
