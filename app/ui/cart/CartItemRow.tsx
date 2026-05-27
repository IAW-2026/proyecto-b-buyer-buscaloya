// app/ui/cart/CartItemRow.tsx
'use client';

import Image from 'next/image';
import { CartItem } from '@/app/providers/CartProvider';

interface CartItemRowProps {
  item: CartItem;
  onRemove: () => void;
}

export default function CartItemRow({ item, onRemove }: CartItemRowProps) {
  const price = item.productPrice ?? item.product?.price ?? 0;

  return (
    <div className="p-3 border border-gray-200 rounded mb-3 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          {(item.imageUrl || item.product?.image_url) ? (
            <div className="w-16 h-16 relative rounded overflow-hidden">
              <Image
                src={item.imageUrl || item.product?.image_url}
                alt={item.productName || item.product?.name || 'Producto'}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs text-center">
              Sin Imagen
            </div>
          )}
          <div>
            <div className="font-medium text-black">{item.productName || item.product?.name || item.productId}</div>
            <div className="text-sm text-gray-600">Tienda: {item.storeName || item.product?.storeName || item.storeId}</div>
            <div className="text-sm text-gray-800 mt-2">Cantidad: <span className="font-medium">{item.quantity}</span></div>
            <div className="text-sm text-gray-800 mt-1">Precio: <span className="font-medium">${price.toLocaleString('es-AR')}</span></div>
          </div>
        </div>
        <div className="text-right">
          <button
            type="button"
            aria-label="Eliminar producto"
            onClick={onRemove}
            className="mt-2 p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}