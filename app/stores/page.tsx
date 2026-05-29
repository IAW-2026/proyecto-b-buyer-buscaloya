import { Suspense } from 'react';
import Search from '@/app/ui/Search';
import Pagination from '@/app/ui/Pagination';
import StoresGrid from '@/app/ui/stores/StoresGrid';
import { fetchStoresWithMeta } from '@/app/stores/queries';

export const dynamic = 'force-dynamic';

export default async function StoresPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params?.page) || 1);
  const search = params?.search || '';

  try {
    const { stores, totalPages} = await fetchStoresWithMeta(currentPage, search);

    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Negocios Disponibles</h1>
            <p className="text-gray-600 mt-2">Descubre los mejores comercios en BuscaLoYa</p>
          </div>
          <div className="w-full md:w-96">
            <Search placeholder="Buscar negocios, categorías..." />
          </div>
        </div>
          <StoresGrid stores={stores} />
        <div className="mt-8">
          <Pagination totalPages={totalPages} currentPage={currentPage} search={search} />
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg text-center">
          <p className="font-medium">No se pudieron cargar los comercios.</p>
          <p className="text-sm mt-1">Intenta nuevamente más tarde.</p>
        </div>
      </main>
    );
  }
}