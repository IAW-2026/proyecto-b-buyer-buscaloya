// app/ui/purchase/LiveMap.tsx
'use client';
import { Location, LiveMapProps } from '@/app/lib/definitions';

export default function LiveMap({ courierLocation, destination }: LiveMapProps) {

  return (
    <div className="mt-8 border-t pt-6 transition-all duration-500 ease-in-out">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubicación en tiempo real</h3>
      
      <div className="bg-gray-100 w-full h-72 rounded-xl border flex flex-col items-center justify-center shadow-inner p-6 text-center relative overflow-hidden">
        
        <div className="flex justify-around w-full max-w-md bg-white p-4 rounded-xl shadow-sm border z-10 mb-4">
          {/* Info del Repartidor */}
          <div className="flex flex-col items-center w-1/2 border-r">
            <span className="text-2xl animate-bounce mb-1">🛵</span>
            <p className="text-xs font-bold text-gray-700">Ubicación del Cadete</p>
            {courierLocation ? (
              <p className="text-[10px] font-mono text-gray-500 mt-1">
                {courierLocation.lat.toFixed(4)}, {courierLocation.lng.toFixed(4)}
              </p>
            ) : (
              <p className="text-[10px] text-gray-400 mt-1 animate-pulse">Buscando señal GPS...</p>
            )}
          </div>

          {/* Info del Destino (Ana) */}
          <div className="flex flex-col items-center w-1/2">
            <span className="text-2xl mb-1">🏠</span>
            <p className="text-xs font-bold text-gray-700">Tu Dirección</p>
            <p className="text-[10px] text-gray-600 font-medium mt-0.5 max-w-[120px] truncate">
              {destination.street}
            </p>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
              {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 italic z-10">
          (Componente aislado listo para inicializar Mapbox)
        </p>
        
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>
    </div>
  );
}