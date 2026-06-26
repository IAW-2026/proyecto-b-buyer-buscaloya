import sql from '@/app/lib/db';
import { User } from '@/app/lib/definitions';

const ITEMS_PER_PAGE = 10;

export async function fetchFilteredUsers(currentPage: number, search?: string) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      const users = await sql`
        SELECT client_id, name, email, phone, role
        FROM users
        WHERE name ILIKE ${q}
        ORDER BY name ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
      return users as User[];
    }

    const users = await sql`
      SELECT client_id, name, email, phone, role
      FROM users 
      ORDER BY name ASC 
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return users as User[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchUsersPages(search?: string) {
  try {
    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      const countResult = await sql`SELECT COUNT(*)::int AS total FROM users WHERE name ILIKE ${q}`;
      const totalUsers = countResult[0].total;
      const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
      return { totalPages, totalUsers };
    }

    const countResult = await sql`SELECT COUNT(*)::int AS total FROM users`;
    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
    return { totalPages, totalUsers };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of users.');
  }
}