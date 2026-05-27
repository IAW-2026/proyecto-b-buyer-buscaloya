'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { simulatePaymentStatusUpdate } from '@/app/lib/actions';

export default function MockPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Desenpaquetamos el ID de la compra de forma segura para Next 15 / React 19
  const { id: purchaseId } = use(params);

  // Estados de la simulación: 'idle' (esperando selección), 'processing', 'PAID', 'CANCELLED'
  const [viewState, setViewState] = useState<'idle' | 'processing' | 'PAID' | 'CANCELLED'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (chosenStatus: 'PAID' | 'CANCELLED') => {
    setViewState('processing');
    setError(null);
    
    try {
      // Ejecutamos el webhook real a través de la acción del servidor
      await simulatePaymentStatusUpdate(purchaseId, chosenStatus);
      
      // Transicionamos la UI al estado elegido
      setViewState(chosenStatus);
      
      // Esperamos 2 segundos para que se vea el feedback visual y redirigimos
      setTimeout(() => {
        router.push('/purchase');
      }, 2000);

    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al comunicar el estado al webhook.');
      setViewState('idle');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        
        {/* ESCENARIO 1: Esperando que el usuario elija el destino del pago */}
        {viewState === 'idle' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              💳
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Pasarela de Pagos</h2>
            <p className="text-sm text-gray-500 mb-6">ID de Orden: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{purchaseId}</span></p>
            
            {error && <p className="text-xs text-red-600 mb-4 bg-red-50 p-2 rounded">{error}</p>}
            
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Entorno de Simulación</p>
            
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSimulate('PAID')}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>✅</span> Simular Pago Aprobado
              </button>
              
              <button
                type="button"
                onClick={() => handleSimulate('CANCELLED')}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>❌</span> Simular Pago Cancelado
              </button>
            </div>
          </div>
        )}

        {/* ESCENARIO 2: Procesando la petición HTTP hacia el Webhook */}
        {viewState === 'processing' && (
          <div className="flex flex-col items-center py-6">
            <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Procesando Transacción</h3>
            <p className="text-sm text-gray-500">Notificando de forma segura al sistema...</p>
          </div>
        )}

        {/* ESCENARIO 3: Éxito (PAID) */}
        {viewState === 'PAID' && (
          <div className="flex flex-col items-center py-6 animate-in pop-in duration-300">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5 text-2xl">
              ✓
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">¡Pago Autorizado!</h3>
            <p className="text-sm text-gray-500">Tu pedido comenzará a ser preparado.</p>
          </div>
        )}

        {/* ESCENARIO 4: Cancelado (CANCELLED) */}
        {viewState === 'CANCELLED' && (
          <div className="flex flex-col items-center py-6 animate-in pop-in duration-300">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-5 text-2xl">
              ✕
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Pago Cancelado</h3>
            <p className="text-sm text-gray-500">La compra ha sido marcada como cancelada.</p>
          </div>
        )}

      </div>
    </div>
  );
}