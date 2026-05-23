'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/app/providers/CartProvider';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, setQuantity, remove, clear } = useCart();

  if (!isOpen) return null;

  const totalItems = items.reduce((s, it) => s + it.quantity, 0);
  const totalValue = items.reduce((s, it) => {
    const price = it.productPrice ?? it.product?.price ?? 0;
    return s + price * it.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 z-40" onClick={onClose} />
      <aside className="relative z-50 ml-auto w-full max-w-md bg-white h-full shadow-xl p-6 flex flex-col text-black">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Carrito</h3>
        </div>

        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="text-gray-700">El carrito está vacío.</div>
          ) : (
            items.map((it) => (
              <div key={`${it.storeId}:${it.productId}`} className="p-3 border border-gray-200 rounded mb-3 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    { (it.imageUrl || it.product?.image_url) ? (
                      <div className="w-16 h-16 relative rounded overflow-hidden">
                        <Image
                          src={it.imageUrl || it.product?.image_url}
                          alt={it.productName || it.product?.name || ''}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Sin Imagen
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-black">{it.productName || it.product?.name || it.productId}</div>
                      <div className="text-sm text-gray-600">Tienda: {it.storeName || it.product?.storeName || it.storeId}</div>
                      <div className="text-sm text-gray-800 mt-2">Cantidad: <span className="font-medium">{it.quantity}</span></div>
                      <div className="text-sm text-gray-800 mt-1">Precio: <span className="font-medium">${((it.productPrice ?? it.product?.price ?? 0)).toLocaleString('es-AR')}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      aria-label="Eliminar producto"
                      onClick={() => remove(it.storeId, it.productId)}
                      className="mt-2 p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-800">Total</div>
            <div className="font-medium text-black">${totalValue.toLocaleString('es-AR')}</div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-gray-800 text-white">Cerrar</button>
            <button
              type="button"
              onClick={() => alert('Enviar: funcionalidad pendiente')}
              disabled={items.length === 0}
              className={`flex-1 py-2 rounded font-medium ${items.length === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              Enviar
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
