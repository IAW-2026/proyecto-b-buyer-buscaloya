'use client';

import { Product } from '@/app/lib/definitions';
import { useCart } from '@/app/providers/CartProvider';

interface ProductCardProps {
  product: Product;
  storeId: string;
  storeName?: string | null;
}

export default function ProductCard({ product, storeId, storeName }: ProductCardProps) {
  const { setQuantity, getQuantity } = useCart();
  
  const currentQty = getQuantity(storeId, product.product_id);

  function increment() {
    const next = Math.min(currentQty + 1, product.stock);
    setQuantity(storeId, product.product_id, next, { ...(product as any), storeName } as any);
  }

  function decrement() {
    const next = Math.max(currentQty - 1, 0);
    setQuantity(storeId, product.product_id, next, { ...(product as any), storeName } as any);
  }

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-row h-36 sm:h-40 ${
        product.stock === 0 ? 'opacity-60' : 'hover:shadow-md transition-shadow'
      }`}
    >
      <div className="w-1/3 min-w-[110px] max-w-[140px] bg-gray-50 relative flex-shrink-0">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Sin Imagen
          </div>
        )}
        
        {/* Etiqueta de Sin Stock */}
        {product.stock === 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            AGOTADO
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate pr-2">
              {product.name}
            </h2>
            <span className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">
              ${product.price.toLocaleString('es-AR')}
            </span>
          </div>
          
          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>
        
        <div className="mt-2 flex justify-end">
          {product.stock === 0 ? (
            <span className="text-xs font-medium text-gray-400">Sin stock</span>
          ) : (
            <div className="flex items-center gap-3">
              <button
                aria-label={`Eliminar una unidad de ${product.name}`}
                onClick={decrement}
                disabled={currentQty === 0}
                className={
                  (currentQty === 0)
                    ? 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center text-lg font-bold'
                    : 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 flex items-center justify-center text-lg font-bold transition-colors'
                }
                type="button"
              >
                −
              </button>

              {currentQty > 0 && (
                <div className="w-4 text-center text-sm sm:text-base font-medium text-gray-800">
                  {currentQty}
                </div>
              )}

              <button
                aria-label={`Agregar una unidad de ${product.name}`}
                onClick={increment}
                disabled={currentQty >= product.stock}
                className={
                  (currentQty >= product.stock)
                    ? 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center text-lg font-bold'
                    : 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-center text-lg font-bold shadow-sm transition-colors'
                }
                type="button"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}