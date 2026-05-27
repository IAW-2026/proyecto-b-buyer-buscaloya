'use client';

import React, { useState } from 'react';
import { useCart } from '@/app/providers/CartProvider';
import CartDrawer from './CartDrawer';

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const { items } = useCart();

  const totalQty = items.reduce((s, it) => s + it.quantity, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        aria-label="Abrir carrito"
      >
        <span className="sr-only">Carrito</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
        </svg>
        {totalQty > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-blue-600 rounded-full text-xs w-5 h-5 flex items-center justify-center font-semibold">{totalQty}</span>
        )}
      </button>
      <CartDrawer isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
