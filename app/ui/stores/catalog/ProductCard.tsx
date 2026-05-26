'use client';

import Image from 'next/image';
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
      className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col ${
        product.stock === 0 ? 'opacity-60' : 'hover:shadow-md transition-shadow'
      }`}
    >
      <div className="h-48 bg-gray-100 relative">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.name} 
            width={600}
            height={400}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin Imagen
          </div>
        )}
        
        {/* Etiqueta de Sin Stock */}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            SIN STOCK
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {product.name}
          </h2>
          <span className="text-lg font-bold text-green-700 ml-4">
            ${product.price.toLocaleString('es-AR')}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 flex-grow">
          {product.description}
        </p>
        
        {product.stock === 0 ? (
          <button disabled className="w-full py-2.5 rounded-lg font-medium text-sm bg-gray-200 text-gray-500 cursor-not-allowed">
            Agotado
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              aria-label={`Eliminar una unidad de ${product.name}`}
              onClick={decrement}
              disabled={currentQty === 0}
              className={
                (currentQty === 0)
                  ? 'w-10 h-10 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center text-xl font-bold'
                  : 'w-10 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center text-xl font-bold'
              }
              type="button"
            >
              −
            </button>

            <div className="flex-1 text-center">
              <div className="text-sm text-black">Cantidad</div>
              <div className="text-lg font-medium text-black">{currentQty}</div>
            </div>

            <button
              aria-label={`Agregar una unidad de ${product.name}`}
              onClick={increment}
              disabled={currentQty >= product.stock}
              className={
                (currentQty >= product.stock)
                  ? 'w-10 h-10 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center text-xl font-bold'
                  : 'w-10 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center text-xl font-bold'
              }
              type="button"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}