import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MOCK_ROUTE } from '@/app/lib/mocks';


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validamos que el usuario esté logueado
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;
    const deliveryServiceUrl = process.env.DELIVERY_SERVICE_URL;

    // Mock de tracking
    const isMock = process.env.USE_MOCKS === 'true';
    if (isMock) {
        const timeInSeconds = Math.floor(Date.now() / 1000);
        const step = Math.floor(timeInSeconds / 5); 
        const currentIndex = step % MOCK_ROUTE.length; 
        
        const mockedLocation = MOCK_ROUTE[currentIndex];

        // Simulamos un pequeño delay de red de 500ms para mayor realismo
        await new Promise(resolve => setTimeout(resolve, 500));

        // Devolvemos el contrato exacto que espera tu frontend
        return NextResponse.json({
        delivery_id: `mock_trip_${orderId}`,
        courier_location: mockedLocation,
        status: "OUT_FOR_DELIVERY"
        });
    }

    // 2. Consumimos el endpoint oficial de la Delivery App
    const response = await fetch(`${deliveryServiceUrl}/deliveries/${orderId}/tracking`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.DELIVERY_SERVICE_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener la telemetría del microservicio de Delivery' }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    // 3. Devolvemos la respuesta exacta al frontend
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en el proxy de tracking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}