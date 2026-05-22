import { fetchUsersPages } from '@/app/admin/users/queries';
import UsersTable from '@/app/ui/admin/users-table';
import Pagination from '@/app/ui/Pagination';
import Search from '@/app/ui/Search';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const search = params?.search || '';

  try {
    const { totalPages, totalUsers } = await fetchUsersPages(search);

    return (
      <div className="min-h-screen bg-black text-white py-10">
        <div className="max-w-6xl mx-auto bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
            <span className="bg-blue-900 text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
              Total: {totalUsers}
            </span>
          </div>

          {/* Buscador con debounce (cliente) */}
          <Search placeholder="Buscar por nombre..." />

          {/* Extraemos la tabla a un componente servidor */}
          <Suspense fallback={<div className="text-neutral-400">Cargando usuarios...</div>}>
            <UsersTable currentPage={currentPage} search={search} />
          </Suspense>

          {/* Extraemos la paginación */}
          <Pagination totalPages={totalPages} currentPage={currentPage} search={search} />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-black text-white py-10">
        <div className="max-w-4xl mx-auto p-6 bg-neutral-900 rounded-lg border border-neutral-800">
          <h2 className="text-lg font-bold text-white">Error de conexión</h2>
          <p className="text-neutral-300">No se pudo cargar la lista de usuarios. Por favor, intenta de nuevo más tarde.</p>
        </div>
      </div>
    );
  }
}