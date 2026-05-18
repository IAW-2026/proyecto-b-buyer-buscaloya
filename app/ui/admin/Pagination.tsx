import Link from 'next/link';

export default function Pagination({ 
  totalPages, 
  currentPage,
  search,
}: { 
  totalPages: number; 
  currentPage: number;
  search?: string;
}) {
  if (totalPages <= 1) return null;
  const suffix = search ? `&search=${encodeURIComponent(search)}` : '';
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800">
      <div className="text-sm text-neutral-400">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex gap-2">
        {currentPage > 1 && (
          <Link
            href={`/admin/users?page=${currentPage - 1}${suffix}`}
            className="px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium text-neutral-200 hover:bg-neutral-800"
          >
            Anterior
          </Link>
        )}
        {currentPage < totalPages && (
          <Link
            href={`/admin/users?page=${currentPage + 1}${suffix}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}