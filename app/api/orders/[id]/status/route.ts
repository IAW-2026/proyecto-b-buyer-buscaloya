import { NextResponse } from 'next/server';
import sql from '@/app/lib/db';
import { stringToUuid } from '@/app/lib/utils';

// Definimos el diccionario de transiciones válidas para proteger la lógica de negocio
const VALID_TRANSITIONS: Record<string, string[]> = {
  'PAYMENT_PENDING': ['PREPARING', 'CANCELLED'],
  'PREPARING': ['COURIER_ASSIGNED', 'CANCELLED'],
  'COURIER_ASSIGNED': ['PICKED_UP', 'CANCELLED'],
  'PICKED_UP': ['OUT_FOR_DELIVERY', 'DELIVERY_FAILED', 'CANCELLED'],
  'OUT_FOR_DELIVERY': ['DELIVERED', 'DELIVERY_FAILED', 'CANCELLED'],
  'DELIVERED': [],
  'DELIVERY_FAILED': [],
  'CANCELLED': []
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = stringToUuid(id);
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
    const { status: incomingStatus } = body;

    if (!incomingStatus) {
      return NextResponse.json({ error: 'Falta el campo status' }, { status: 400 });
    }

    // 3. Verificación de existencia y estado actual en Neon DB
    const dbResult = await sql`
      SELECT status FROM orders WHERE order_id = ${orderId}
    `;

    if (dbResult.length === 0) {
      return NextResponse.json({
        error: "order_not_found",
        message: "No se encontró ningún paquete con el ID especificado.",
        timestamp: now
      }, { status: 404 });
    }

    const currentStatus = dbResult[0].status;

    // 4. Idempotencia: Si el estado entrante es exactamente igual al actual, respondemos OK temprano
    if (currentStatus === incomingStatus) {
      return NextResponse.json({
        order_id: orderId,
        currentStatus: currentStatus
      });
    }

    // 5. Validación de la Máquina de Estados (Prevención de transiciones inválidas)
    const allowedNextStates = VALID_TRANSITIONS[currentStatus] || [];
    
    if (!allowedNextStates.includes(incomingStatus)) {
      return NextResponse.json({
        error: "invalid_status_transition",
        message: `No es posible pasar del estado '${currentStatus}' a '${incomingStatus}'.`,
        timestamp: now
      }, { status: 422 });
    }

    // 6. Actualización en base de datos de la orden individual
    await sql`
      UPDATE orders 
      SET status = ${incomingStatus} 
      WHERE order_id = ${orderId}
    `;
    // 7. Sincronización con la Compra Global (purchases)
  
    if (incomingStatus === 'DELIVERED' || incomingStatus === 'CANCELLED' || incomingStatus === 'DELIVERY_FAILED') {
      // a. Obtenemos a qué compra pertenece este paquete
      const purchaseRes = await sql`
        SELECT purchase_id FROM orders WHERE order_id = ${orderId}
      `;
      
      if (purchaseRes.length > 0) {
        const purchaseId = purchaseRes[0].purchase_id;

        // b. Buscamos TODOS los paquetes que pertenecen a esa misma compra
        const siblingsRes = await sql`
          SELECT status FROM orders WHERE purchase_id = ${purchaseId}
        `;

        // c. Verificamos si todos los paquetes ya están en un estado final
        const allFinished = siblingsRes.every(
          (order) => order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'DELIVERY_FAILED'
        );

        // d. Si todos terminaron, pasamos la compra global a COMPLETED
        if (allFinished) {
          await sql`
            UPDATE purchases 
            SET status = 'COMPLETED' 
            WHERE purchase_id = ${purchaseId}
          `;
          console.log(`Compra global ${purchaseId} finalizada con éxito.`);
        }
      }
    }

    // 8. Respuesta de éxito
    return NextResponse.json({
      order_id: orderId,
      currentStatus: incomingStatus
    });

  } catch (error) {
    console.error('Error procesando el webhook de estado logístico:', error);
    return NextResponse.json({ 
      error: 'internal_server_error',
      message: 'Ocurrió un error inesperado al procesar la solicitud.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}