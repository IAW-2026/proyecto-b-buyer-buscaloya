'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export type CartItem = {
  storeId: string;
  productId: string;
  storeName: string;
  productName: string;
  quantity: number;
  imageUrl: string;
  product?: any;
  productPrice?: number | null;
};

type CartContextValue = {
  items: CartItem[];
  add: (storeId: string, productId: string, storeName: string, productName: string, imageUrl: string, product?: any, delta?: number) => void;
  setQuantity: (storeId: string, productId: string, qty: number, product?: any) => void;
  remove: (storeId: string, productId: string) => void;
  clear: () => void;
  getQuantity: (storeId: string, productId: string) => number;
};

const STORAGE_KEY = 'bb_cart_v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { isLoaded, user } = useUser();
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const stored = readStorage();
    setItems(stored);
  }, []);

  useEffect(() => {
    writeStorage(items);
  }, [items]);

  // Clear cart when user signs out or switches account
  useEffect(() => {
    if (!isLoaded) return;
    const currentId = user?.id || null;
    // first load: just capture
    if (prevUserIdRef.current === null) {
      prevUserIdRef.current = currentId;
      return;
    }
    if (prevUserIdRef.current !== currentId) {
      // user changed (logout or account switch) -> clear cart
      setItems([]);
      writeStorage([]);
    }
    prevUserIdRef.current = currentId;
  }, [isLoaded, user?.id]);

  // Optionally clear cart when leaving the page/tab
  useEffect(() => {
    const handler = () => {
      try {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  function add(storeId: string, productId: string, storeName: string, productName: string, imageUrl: string, product?: any, delta = 1) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.storeId === storeId && i.productId === productId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + delta };
        return copy;
      }
      return [...prev, { storeId, productId, storeName, productName, imageUrl, quantity: delta, product, productPrice: product?.price ?? null }];
    });
  }

  function setQuantity(storeId: string, productId: string, qty: number, product?: any) {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => !(i.storeId === storeId && i.productId === productId)));
      return;
    }
    setItems(prev => {
      const idx = prev.findIndex(i => i.storeId === storeId && i.productId === productId);
      if (idx >= 0) {
        const copy = [...prev];
        const existing = copy[idx];
        copy[idx] = {
          ...existing,
          quantity: qty,
          // update display fields if a product snapshot was provided
          productName: product?.name || existing.productName,
          storeName: product?.storeName || existing.storeName,
          imageUrl: product?.image_url || existing.imageUrl,
          product: product || existing.product,
          productPrice: product?.price ?? existing.productPrice ?? null,
        };
        return copy;
      }
      // create new item with display fields when possible
      return [...prev, { storeId, productId, quantity: qty, product, productName: product?.name || null, storeName: product?.storeName || null, imageUrl: product?.image_url || null, productPrice: product?.price ?? null } as CartItem];
    });
  }

  function remove(storeId: string, productId: string) {
    setItems(prev => prev.filter(i => !(i.storeId === storeId && i.productId === productId)));
  }

  function clear() {
    setItems([]);
  }

  function getQuantity(storeId: string, productId: string) {
    const it = items.find(i => i.storeId === storeId && i.productId === productId);
    return it ? it.quantity : 0;
  }

  const value: CartContextValue = { items, add, setQuantity, remove, clear, getQuantity };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
