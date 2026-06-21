'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/app/lib/definitions';
import LiveMap from './LiveMap';
import { cancelDeliveryAction } from '@/app/lib/actions';

// Orden de los estados para la barra de progreso
const STATUS_STEPS = ['PAYMENT_PENDING', 'PREPARING', 'COURIER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_LABELS: Record<string, string> = {
  'PAYMENT_PENDING': 'Confirmando',
  'PREPARING': 'En preparación',
  'COURIER_ASSIGNED': 'Asignado',
  'PICKED_UP': 'Recogido',
  'OUT_FOR_DELIVERY': 'En camino',
  'DELIVERED': 'Entregado',
  'DELIVERY_FAILED': 'Fallo',
  'CANCELLED': 'Cancelado'
};

export default function LiveTrackingPackage({ pkg }: { pkg: Order }) {
  // Polling de alta frecuencia (5 segundos) mientras no esté entregado o cancelado
  const router = useRouter();

  // Nuevo estado para guardar la latitud y longitud del repartidor
  const [courierLocation, setCourierLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (pkg.status !== 'DELIVERED' && pkg.status !== 'CANCELLED' && pkg.status !== 'DELIVERY_FAILED') {
      const interval = setInterval(async () => {
        // 1. Actualiza el estado general en la base de datos (Server-side refresh)
        router.refresh();

        // 2. Si está en viaje, consulta la telemetría en tiempo real por el proxy
        if (pkg.status === 'OUT_FOR_DELIVERY') {
          try {
            const res = await fetch(`/api/orders/${pkg.order_id}/tracking`);
            if (res.ok) {
              const data = await res.json();
              // Guardamos la ubicación provista por el endpoint
              if (data?.courier_location) {
                setCourierLocation(data.courier_location);
              }
            }
          } catch (err) {
            console.error("Error obteniendo telemetría:", err);
          }
        }
      }, 5000); // Polling de alta frecuencia de 5 segundos

      return () => clearInterval(interval);
    }
  }, [pkg.status, pkg.order_id, router]);

  const currentStepIndex = STATUS_STEPS.indexOf(pkg.status);

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="bg-rose-600 p-6 text-white">
        <h1 className="text-2xl font-bold">{pkg.store_name}</h1>
      </div>

      <div className="p-6">
        {pkg.status === 'CANCELLED' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Paquete Cancelado</h3>
                <p className="text-sm text-red-700 mt-1">
                  Este pedido ha sido cancelado y ya no será entregado.
                </p>
              </div>
            </div>
          </div>
        )}

        {pkg.status === 'DELIVERY_FAILED' && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Entrega Fallida</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Hubo un problema al entregar el paquete. Nos contactaremos pronto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de progreso (Stepper) */}
        {pkg.status !== 'CANCELLED' && pkg.status !== 'DELIVERY_FAILED' && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {STATUS_STEPS.map((step, index) => {
                const isActive = index <= currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center w-1/5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors ${isActive ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                      {index + 1}
                    </div>
                    <span className={`text-xs text-center ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Línea conectora */}
            <div className="relative mt[-40px] top-[-45px] left-[10%] w-[80%] h-1 bg-gray-200 -z-10">
              <div
                className="absolute top-0 left-0 h-full bg-rose-600 transition-all duration-500"
                style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
        {pkg.status === 'DELIVERED' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Paquete Entregado</h3>
                <p className="text-sm text-green-700 mt-1">
                  Este paquete ya ha sido entregado con éxito. ¡Gracias por elegir BuscaLoYa!
                </p>
              </div>
            </div>
          </div>
        )}

        {/*Detalle del contenido del paquete */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
            Contenido del paquete
          </h3>
          <ul className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-200">
            {pkg.items?.map((item: any, index: number) => (
              <li key={index} className="flex justify-between items-center p-4 text-sm">
                <span className="font-medium text-gray-800">{item.product_name}</span>
                <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-md">
                  x{item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* Zona de Código OTP */}
        {pkg.status === 'OUT_FOR_DELIVERY' && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Código de Seguridad de Entrega</h3>
            {pkg.delivery_code ? (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-6 text-center">
                <p className="text-sm text-rose-800 mb-2 font-medium">
                  Dile este número al cadete cuando llegue a tu puerta para recibir tu pedido:
                </p>
                <p className="text-5xl font-mono font-black text-rose-600 tracking-[0.2em]">
                  {pkg.delivery_code}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border rounded-lg p-6 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm">El código de seguridad se generará cuando el cadete esté en camino.</p>
              </div>
            )}
          </div>
        )}

        {/* Freno de Emergencia - Sólo visible en COURIER_ASSIGNED */}
        {pkg.status === 'COURIER_ASSIGNED' && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isCancelling ? 'Cancelando...' : 'Abortar Misión (Cancelar Envío)'}
            </button>
          </div>
        )}

        {/* Modal de Confirmación de Cancelación (Estilo ConfirmCheckoutModal) */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 transition-opacity" 
              onClick={() => { if (!isCancelling) setShowCancelModal(false); }}
            />
            
            {/* Modal Content */}
            <div className="relative z-[70] bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col items-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Cancelar Envío?</h3>
              <p className="text-gray-600 text-center mb-6">
                Estás a punto de abortar la compra. Se le avisará al cadete para que no recoja el paquete. Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
                >
                  No, mantener
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsCancelling(true);
                    try {
                      await cancelDeliveryAction(pkg.order_id);
                      setShowCancelModal(false);
                    } catch (e) {
                      alert('Error al cancelar el envío.');
                      setIsCancelling(false);
                      setShowCancelModal(false);
                    }
                  }}
                  disabled={isCancelling}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ESPACIO RESERVADO PARA EL MAPA */}
        {pkg.status === 'OUT_FOR_DELIVERY' && (
          <LiveMap
            courierLocation={courierLocation}
            destination={{
              lat: (pkg as any).buyer_lat,
              lng: (pkg as any).buyer_lng,
              street: (pkg as any).buyer_street
            }}
          />
        )}
      </div>
    </div>
  );
}