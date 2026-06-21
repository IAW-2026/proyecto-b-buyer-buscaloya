import { NextResponse } from 'next/server';
import sql from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    // 1. Autorización M2M (SERVICE_TOKEN)
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;

    if (!token || token !== process.env.BUYER_SERVICE_SECRET) {
      return NextResponse.json({
        error: "unauthorized",
        message: "La API Key proporcionada es inválida o no tiene permisos para este servicio."
      }, { status: 401 });
    }

    // 2. Usuarios activos por día (Últimos 30 días)
    const activeUsersRes = await sql`
      SELECT 
        TO_CHAR(DATE(login_time), 'YYYY-MM-DD') as date, 
        COUNT(DISTINCT client_id)::int as active_users
      FROM user_logs
      WHERE login_time >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(login_time)
      ORDER BY DATE(login_time) ASC
    `;

    // 3. Franja horaria más activa (Últimos 30 días)
    const activityByHourRes = await sql`
      SELECT 
        EXTRACT(HOUR FROM login_time)::int as hour, 
        COUNT(*)::int as activity_count
      FROM user_logs
      WHERE login_time >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM login_time)
      ORDER BY activity_count DESC
    `;

    // 4. Usuarios nuevos por día (Últimos 30 días)
    const newUsersRes = await sql`
      SELECT 
        TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date, 
        COUNT(*)::int as new_users
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // 5. Respuesta combinada
    return NextResponse.json({
      active_users_per_day: activeUsersRes,
      activity_by_hour: activityByHourRes,
      new_users_per_day: newUsersRes
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ 
      error: 'internal_server_error',
      message: 'Ocurrió un error inesperado al calcular las analíticas.'
    }, { status: 500 });
  }
}
