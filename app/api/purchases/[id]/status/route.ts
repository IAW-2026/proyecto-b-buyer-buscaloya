import { NextResponse } from 'next/server';
import sql from '@/app/lib/db'; 
import { stringToUuid } from '@/app/lib/utils';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseId = stringToUuid(id);

    // 1. Validación de Seguridad M2M
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;

    if (!token || token !== process.env.BUYER_SERVICE_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Parseamos el JSON
    const body = await req.json();
    const { status: incomingStatus } = body; 

    if (!incomingStatus) {
      return NextResponse.json({ error: 'Falta el campo status' }, { status: 400 });
    }

    const dbResult = await sql`
      SELECT status FROM purchases WHERE purchase_id = ${purchaseId}::uuid
    `;

    if (dbResult.length === 0) {
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });
    }

    const currentDbStatus = dbResult[0].status;

    // Si la compra ya está pagada o cancelada, es un ESTADO FINAL. 
    if (currentDbStatus === 'PAID' || currentDbStatus === 'CANCELLED') {
      console.log(`Webhook ignorado: La compra ${purchaseId} ya tiene estado definitivo (${currentDbStatus})`);
      return NextResponse.json({ 
        success: true, 
        message: 'La compra ya tenía un estado definitivo. No se realizaron cambios.' 
      });
    }
    // 4. Validamos que el nuevo estado sea válido
    if (incomingStatus !== 'PAID' && incomingStatus !== 'CANCELLED') {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    if(currentDbStatus === incomingStatus) {
      console.log(`Webhook ignorado: La compra ${purchaseId} ya tiene el mismo estado (${currentDbStatus})`);
      return NextResponse.json({ 
        success: true, 
        message: 'La compra ya tenía el mismo estado. No se realizaron cambios.' 
      });
    }

    // 5. Actualizamos la base de datos (Porque sabemos que es seguro hacerlo)
    await sql`
      UPDATE purchases 
      SET status = ${incomingStatus} 
      WHERE purchase_id = ${purchaseId}::uuid
    `;

    await sql`
      UPDATE orders 
      SET status = ${incomingStatus === 'PAID' ? 'PREPARING' : 'CANCELLED_SUCCESSFULLY'} 
      WHERE purchase_id = ${purchaseId}::uuid
    `;

    return NextResponse.json({ 
      success: true, 
      message: `Compra ${purchaseId} actualizada correctamente a ${incomingStatus}` 
    });

  } catch (error) {
    console.error('Error en el webhook de estado de pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}