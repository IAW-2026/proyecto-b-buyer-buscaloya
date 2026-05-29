import Link from 'next/link';
import { fetchCatalog } from './queries';
import ProductsGrid from '@/app/ui/stores/catalog/ProductsGrid';

export default async function StoreCatalogPage(props: { params: { id: string } | Promise<{ id: string }> }) {
  const { params } = props;
  const { id: storeId } = await params as { id: string };
  const catalog = await fetchCatalog(storeId);
  const products = catalog.products ?? [];
  const storeName = catalog.store_name;
  const storeImage = catalog.store_image_url ?? null;

  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Navegación y Encabezado */}
      <div className="mb-8">
        <Link 
          href="/stores" 
          className="text-sm font-medium text-rose-600 hover:text-rose-800 flex items-center mb-4"
        >
          &larr; Volver a todos los negocios
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Catálogo del Comercio</h1>
        <p className="text-gray-500 mt-1 text-sm">Mostrando productos disponibles</p>
      </div>

      <ProductsGrid storeId={storeId} storeName={storeName} storeImageUrl={storeImage} products={products} />
    </main>
  );
}
