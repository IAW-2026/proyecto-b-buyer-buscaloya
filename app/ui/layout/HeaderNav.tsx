'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderNav({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el menú si cambiamos de ruta
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Navegación Desktop */}
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-700">
        <Link href="/stores" className="hover:text-rose-600 transition-colors">Tiendas</Link>
        <Link href="/purchase" className="hover:text-rose-600 transition-colors">Mi Compra</Link>
        <Link href="/user" className="hover:text-rose-600 transition-colors">Mi Perfil</Link>

        {isAdmin && (
          <Link
            href="/admin/users"
            className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
          >
            Admin
          </Link>
        )}
      </nav>

      {/* Botón Menú Mobile */}
      <button
        className="md:hidden p-2 text-gray-600 hover:text-rose-600 transition-colors flex items-center justify-center rounded-md hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Menú Desplegable Mobile */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-md p-4 flex flex-col gap-4 md:hidden z-50">
          <Link href="/stores" className="text-base font-medium text-gray-800 hover:text-rose-600 transition-colors block py-2 border-b border-gray-100">
            Tiendas
          </Link>
          <Link href="/purchase" className="text-base font-medium text-gray-800 hover:text-rose-600 transition-colors block py-2 border-b border-gray-100">
            Mi Compra
          </Link>
          <Link href="/user" className="text-base font-medium text-gray-800 hover:text-rose-600 transition-colors block py-2 border-b border-gray-100">
            Mi Perfil
          </Link>

          {isAdmin && (
            <Link
              href="/admin/users"
              className="text-base font-medium text-red-700 hover:text-red-800 transition-colors block py-2"
            >
              Panel Admin
            </Link>
          )}
        </div>
      )}
    </>
  );
}
