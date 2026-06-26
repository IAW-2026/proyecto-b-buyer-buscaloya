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

    // 2. Usuarios activos por día (Últimos 3 meses)
    const activeUsersRes = await sql`
      SELECT 
        TO_CHAR(DATE(login_time), 'YYYY-MM-DD') as date, 
        COUNT(DISTINCT client_id)::int as active_users
      FROM user_logs
      WHERE login_time >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY DATE(login_time)
      ORDER BY DATE(login_time) ASC
    `;

    // 3a. Franja horaria más activa (Últimos 3 meses)
    const activityByHour3MonthsRes = await sql`
      SELECT 
        EXTRACT(HOUR FROM login_time)::int as hour, 
        COUNT(*)::int as activity_count
      FROM user_logs
      WHERE login_time >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY EXTRACT(HOUR FROM login_time)
      ORDER BY activity_count DESC
    `;

    // 3b. Franja horaria más activa (Último mes)
    const activityByHour1MonthRes = await sql`
      SELECT 
        EXTRACT(HOUR FROM login_time)::int as hour, 
        COUNT(*)::int as activity_count
      FROM user_logs
      WHERE login_time >= CURRENT_DATE - INTERVAL '1 month'
      GROUP BY EXTRACT(HOUR FROM login_time)
      ORDER BY activity_count DESC
    `;

    // 3c. Franja horaria más activa (Última semana)
    const activityByHour1WeekRes = await sql`
      SELECT 
        EXTRACT(HOUR FROM login_time)::int as hour, 
        COUNT(*)::int as activity_count
      FROM user_logs
      WHERE login_time >= CURRENT_DATE - INTERVAL '1 week'
      GROUP BY EXTRACT(HOUR FROM login_time)
      ORDER BY activity_count DESC
    `;

    // 4. Usuarios nuevos por día (Últimos 3 meses)
    const newUsersRes = await sql`
      SELECT 
        TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date, 
        COUNT(*)::int as new_users
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // 5a. Usuarios con más compras (Últimos 3 meses)
    const topBuyersByCount3MonthsRes = await sql`
      SELECT u.name, u.email, COUNT(p.purchase_id)::int as total_purchases, SUM(p.amount)::float as total_spent
      FROM purchases p JOIN users u ON p.client_id = u.client_id
      WHERE p.status NOT IN ('CANCELLED', 'PENDING') AND p.created_at >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY u.client_id, u.name, u.email ORDER BY total_purchases DESC LIMIT 10
    `;

    // 5b. Usuarios con más compras (Último mes)
    const topBuyersByCount1MonthRes = await sql`
      SELECT u.name, u.email, COUNT(p.purchase_id)::int as total_purchases, SUM(p.amount)::float as total_spent
      FROM purchases p JOIN users u ON p.client_id = u.client_id
      WHERE p.status NOT IN ('CANCELLED', 'PENDING') AND p.created_at >= CURRENT_DATE - INTERVAL '1 month'
      GROUP BY u.client_id, u.name, u.email ORDER BY total_purchases DESC LIMIT 10
    `;

    // 5c. Usuarios con más compras (Última semana)
    const topBuyersByCount1WeekRes = await sql`
      SELECT u.name, u.email, COUNT(p.purchase_id)::int as total_purchases, SUM(p.amount)::float as total_spent
      FROM purchases p JOIN users u ON p.client_id = u.client_id
      WHERE p.status NOT IN ('CANCELLED', 'PENDING') AND p.created_at >= CURRENT_DATE - INTERVAL '1 week'
      GROUP BY u.client_id, u.name, u.email ORDER BY total_purchases DESC LIMIT 10
    `;

    // 6a. Usuarios que más gastaron (Últimos 3 meses)
    const topBuyersByAmount3MonthsRes = await sql`
      SELECT u.name, u.email, SUM(p.amount)::float as total_spent, COUNT(p.purchase_id)::int as total_purchases
      FROM purchases p JOIN users u ON p.client_id = u.client_id
      WHERE p.status NOT IN ('CANCELLED', 'PENDING') AND p.created_at >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY u.client_id, u.name, u.email ORDER BY total_spent DESC LIMIT 10
    `;

    // 6b. Usuarios que más gastaron (Último mes)
    const topBuyersByAmount1MonthRes = await sql`
      SELECT u.name, u.email, SUM(p.amount)::float as total_spent, COUNT(p.purchase_id)::int as total_purchases
      FROM purchases p JOIN users u ON p.client_id = u.client_id
      WHERE p.status NOT IN ('CANCELLED', 'PENDING') AND p.created_at >= CURRENT_DATE - INTERVAL '1 month'
      GROUP BY u.client_id, u.name, u.email ORDER BY total_spent DESC LIMIT 10
    `;

    // 6c. Usuarios que más gastaron (Última semana)
    const topBuyersByAmount1WeekRes = await sql`
      SELECT u.name, u.email, SUM(p.amount)::float as total_spent, COUNT(p.purchase_id)::int as total_purchases
      FROM purchases p JOIN users u ON p.client_id = u.client_id
      WHERE p.status NOT IN ('CANCELLED', 'PENDING') AND p.created_at >= CURRENT_DATE - INTERVAL '1 week'
      GROUP BY u.client_id, u.name, u.email ORDER BY total_spent DESC LIMIT 10
    `;

    // 7. Respuesta combinada
    return NextResponse.json({
      active_users_per_day: activeUsersRes,
      activity_by_hour: {
        last_3_months: activityByHour3MonthsRes,
        last_month: activityByHour1MonthRes,
        last_week: activityByHour1WeekRes
      },
      new_users_per_day: newUsersRes,
      top_buyers_by_purchases: {
        last_3_months: topBuyersByCount3MonthsRes,
        last_month: topBuyersByCount1MonthRes,
        last_week: topBuyersByCount1WeekRes
      },
      top_buyers_by_amount: {
        last_3_months: topBuyersByAmount3MonthsRes,
        last_month: topBuyersByAmount1MonthRes,
        last_week: topBuyersByAmount1WeekRes
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ 
      error: 'internal_server_error',
      message: 'Ocurrió un error inesperado al calcular las analíticas.'
    }, { status: 500 });
  }
}
