"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

type Props = {
  totalPages: number;
  // Opcionales: si la página superior ya las calcula puede pasarlas.
  currentPage?: number;
  search?: string;
};

export default function Pagination({ totalPages, currentPage, search }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Preferir el prop `currentPage` si fue pasado por el servidor; si no, leer desde la URL.
  const pageFromUrl = Number(searchParams?.get('page')) || 1;
  const activePage = currentPage ?? pageFromUrl;

  const createPageURL = (pageNumber: number | string) => {
    // Si el caller pasó `search`, úsa-lo; si no, toma los params actuales de la URL.
    const base = pathname ?? '';
    const params = new URLSearchParams(search ? { page: String(pageNumber), search } : (searchParams?.toString() ? Object.fromEntries(Array.from(searchParams.entries())) : { page: String(pageNumber) }));
    params.set('page', pageNumber.toString());
    return `${base}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        Página {activePage} de {totalPages}
      </div>
      <div className="flex gap-2">
        {activePage > 1 && (
          <Link
            href={createPageURL(activePage - 1)}
            className="px-4 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Anterior
          </Link>
        )}
        {activePage < totalPages && (
          <Link
            href={createPageURL(activePage + 1)}
            className="px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-medium hover:bg-rose-700"
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}