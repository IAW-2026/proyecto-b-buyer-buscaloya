import { NextResponse } from 'next/server';
import sql from '@/app/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const now = new Date().toISOString();

    // 1. Autorización M2M (SERVICE_TOKEN)
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token || token !== process.env.BUYER_SERVICE_SECRET) {
      return NextResponse.json({
        error: "unauthorized",
        message: "La API Key proporcionada es inválida o no tiene permisos para este servicio.",
        timestamp: now
      }, { status: 401 });
    }

    // 2. Parseo del Body
    const body = await req.json();
    const { delivery_code } = body;

    // 3. Validación estricta: Número entero de exactamente 4 dígitos (ej: 1000 a 9999)
    const isValidCode = Number.isInteger(delivery_code) && delivery_code >= 1000 && delivery_code <= 9999;

    if (!isValidCode) {
      return NextResponse.json({
        error: "bad_request",
        message: "El campo 'delivery_code' debe ser un número entero de 4 dígitos.",
        timestamp: now
      }, { status: 400 });
    }

    // 4. Verificación de existencia y pertenencia cruzada (Integridad de datos)
    const dbResult = await sql`
      SELECT o.delivery_code, p.client_id 
      FROM orders o
      JOIN purchases p ON o.purchase_id = p.purchase_id
      WHERE o.order_id = ${orderId}
    `;

    if (dbResult.length === 0) {
      return NextResponse.json({
        error: "order_not_found",
        message: "No se encontró ningún paquete con el ID especificado.",
        timestamp: now
      }, { status: 404 });
    }

    // 5. Prevención de Conflicto (Idempotencia / No sobreescritura)
    if (dbResult[0].delivery_code !== null) {
      return NextResponse.json({
        error: "conflict",
        message: "El código de seguridad para esta orden ya ha sido sincronizado previamente.",
        timestamp: now
      }, { status: 409 });
    }

    // 6. Actualización en la base de datos
    await sql`
      UPDATE orders 
      SET delivery_code = ${delivery_code} 
      WHERE order_id = ${orderId}
    `;

    //  7. Respuesta de éxito
    return NextResponse.json(
      { message: "Delivery code synchronized" },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error procesando el webhook de delivery-code:', error);
    return NextResponse.json({
      error: 'internal_server_error',
      message: 'Ocurrió un error inesperado al procesar la solicitud.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}