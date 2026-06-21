import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import sql from '@/app/lib/db';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Actualiza el timestamp de última actividad de forma segura
    await sql`
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE client_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
