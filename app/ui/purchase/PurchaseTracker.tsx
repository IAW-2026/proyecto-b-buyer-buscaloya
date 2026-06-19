'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Purchase, Order } from '@/app/lib/definitions';
import { notFound, useRouter } from 'next/navigation';

const STATUS_MAP: Record<string, string> = {
  'PAYMENT_PENDING': 'Pendiente de pago',
  'PREPARING': 'En preparación',
  'COURIER_ASSIGNED': 'Cadete asignado',
  'PICKED_UP': 'En camino a ti',
  'OUT_FOR_DELIVERY': 'En la puerta',
  'DELIVERED': 'Entregado',
  'DELIVERY_FAILED': 'Fallo en entrega',
  'CANCELLED_SUCCESSFULLY': 'Cancelado'
};

export default function PurchaseTracker({ purchase, packages }: { purchase: Purchase, packages: Order[] }) {
  const router = useRouter();

  useEffect(() => {
    // Polling cada 10 segundos para actualizar el estado de los paquetes
    // y la compra si sigue en PAID
    if (purchase?.status === 'PAID') {
      const interval = setInterval(() => {
        router.refresh();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [purchase?.status, router]);

  if (!purchase) {
    return notFound();
  }

  const currentDate = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-md">
              Pedido en curso
            </span>
            <h1 className="text-xl font-bold text-gray-800 mt-2">Seguimiento de tu Compra</h1>
            <p className="text-xs text-gray-400 mt-1">Fecha de la compra: {currentDate}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-gray-500">Total Abonado</p>
            <p className="text-2xl font-black text-gray-900">${purchase.amount}</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tus paquetes individuales</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((pkg, index) => (
            <Link
              key={pkg.order_id}
              href={`/purchase/packages/${pkg.order_id}`}
              className="group block border rounded-xl p-5 bg-gray-50 hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                    {pkg.store_name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Paquete #{index + 1}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  (pkg.status === 'CANCELLED_SUCCESSFULLY' || pkg.status === 'DELIVERY_FAILED') ? 'bg-rose-100 text-rose-800' : 'bg-green-50 text-green-700'
                }`}>
                  {STATUS_MAP[pkg.status] || pkg.status}
                </span>
              </div>

              <div className="mt-6 flex justify-between items-center text-sm text-rose-600 font-medium">
                <span>Ver detalle de envío</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}