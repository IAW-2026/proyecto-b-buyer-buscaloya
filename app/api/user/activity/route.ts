import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import sql from '@/app/lib/db';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Inserta un nuevo registro en el historial de logs SOLO si no existe uno 
    // en la misma hora exacta para este usuario.
    await sql`
      INSERT INTO user_logs (client_id, login_time)
      SELECT ${userId}, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (
        SELECT 1 FROM user_logs 
        WHERE client_id = ${userId} 
        AND date_trunc('hour', login_time) = date_trunc('hour', CURRENT_TIMESTAMP)
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
