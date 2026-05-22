import Link from 'next/link';
import { fetchCatalog } from './queries';
import ProductsGrid from '@/app/ui/stores/catalog/ProductsGrid';

export default async function StoreCatalogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: storeId } = await params;
  const products = await fetchCatalog(storeId);

  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Navegación y Encabezado */}
      <div className="mb-8">
        <Link 
          href="/stores" 
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          &larr; Volver a todos los negocios
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Catálogo del Comercio</h1>
        <p className="text-gray-500 mt-1 text-sm">Mostrando productos disponibles</p>
      </div>

      <ProductsGrid storeId={storeId} products={products} />
    </main>
  );
}
