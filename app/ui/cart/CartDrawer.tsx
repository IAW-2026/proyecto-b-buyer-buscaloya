'use client';

import React, { useState } from 'react';
import { useCart } from '@/app/providers/CartProvider';
import { useRouter } from 'next/navigation';
import { sendCartAction } from '@/app/lib/actions';
import { useAddresses } from '@/app/lib/hooks/useAddresses';
import CartItemRow from './CartItemRow'; // O la ruta correcta donde lo creaste
import AddressSelector from './AddressSelector';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, remove, clear } = useCart();
  const router = useRouter();
  
  const { addresses, loading, error: loadError, selectedAddressId, setSelectedAddressId } = useAddresses(isOpen);
  
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalValue = items.reduce((s, it) => {
    const price = it.productPrice ?? it.product?.price ?? 0;
    return s + price * it.quantity;
  }, 0);

  const handleCheckout = async () => {
    if (!selectedAddressId) return;
    if (!confirm('¿Ir a pagar?')) return;
    
    setSending(true);
    setSendError(null);
    try {
      // Obtenemos la respuesta que ahora trae la URL de redirección
      const res = await sendCartAction({ addressId: selectedAddressId, items });
      onClose();
      
      // Usamos router.push() que soporta tanto rutas locales como dominios externos
      router.push(res.redirectUrl);
      setTimeout(() => clear(), 0);
      
    } catch (err: any) {
      console.error('Error sending cart:', err);
      setSendError('No se pudo enviar el pedido. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
      <aside className="relative z-50 ml-auto w-full max-w-md bg-white h-full shadow-xl p-6 flex flex-col text-black">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Mi Carrito</h3>
        </div>

        {/* Zona del Selector de Dirección */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de entrega</label>
          <AddressSelector 
            loading={loading}
            error={loadError}
            addresses={addresses}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="text-gray-500 text-center mt-10">El carrito está vacío.</div>
          ) : (
            items.map((it) => (
              <CartItemRow 
                key={`${it.storeId}:${it.productId}`} 
                item={it} 
                onRemove={() => remove(it.storeId, it.productId)} 
              />
            ))
          )}
        </div>

        {/* Resumen y Envío */}
        <div className="mt-4 border-t pt-4">
          {sendError && <div className="text-red-500 text-sm mb-3 text-center">{sendError}</div>}
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-gray-800">Total</div>
            <div className="text-xl font-bold text-black">${totalValue.toLocaleString('es-AR')}</div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors">
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={items.length === 0 || !selectedAddressId || loading || sending}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                items.length === 0 || !selectedAddressId || loading || sending 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {sending ? 'Procesando...' : 'Confirmar Compra'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}