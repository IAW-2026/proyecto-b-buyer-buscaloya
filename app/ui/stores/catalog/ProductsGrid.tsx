import { Product } from '@/app/lib/definitions';
import ProductCard from './ProductCard';

export default function ProductsGrid({ 
  storeId, 
  storeName, 
  storeImageUrl, 
  products 
}: { 
  storeId: string; 
  storeName?: string | null; 
  storeImageUrl?: string | null; 
  products: Product[] 
}) {
  
  if (products.length === 0) {
    return (
      <div className="bg-white border border-gray-100 p-8 rounded-xl text-center">
        <p className="text-gray-500 font-medium">Este comercio no tiene productos publicados actualmente.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera del Comercio */}
      {storeName && (
        <div className="flex items-center gap-4 mb-6">
          {storeImageUrl ? (
            <img src={storeImageUrl} alt={storeName} className="w-16 h-16 rounded-md object-cover" />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">No Img</div>
          )}
          <h2 className="text-2xl font-bold">{storeName}</h2>
        </div>
      )}

      {/* Grilla de Componentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard 
            key={`${storeId}:${product.product_id}`}
            product={product}
            storeId={storeId}
            storeName={storeName}
          />
        ))}
      </div>
    </div>
  );
}