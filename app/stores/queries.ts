// server
import { auth } from '@clerk/nextjs/server';
import { fetchMockStores } from '@/app/lib/mocks';
import {Store} from '@/app/lib/definitions';

const ITEMS_PER_PAGE = 5;

function applySearch(items: Store[], search?: string) {
  if (!search || search.trim() === '') return items;
  const q = search.toLowerCase();
  return items.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
}

async function fetchAllStoresFromSeller() {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) throw new Error('No estás autenticado');

  const resp = await fetch(`${process.env.SELLER_API_URL}/api/stores`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!resp.ok) throw new Error('Error Seller API');
  const data = await resp.json();
  return Array.isArray(data) ? data : data.stores || [];
}

export async function fetchStoresWithMeta(currentPage: number, search?: string) {
  const isMocking = process.env.USE_MOCKS === 'true'; // Variable de entorno
  const all = isMocking ? await fetchMockStores() : await fetchAllStoresFromSeller();
  const filtered = applySearch(all, search);
  const totalStores = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalStores / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const stores = filtered.slice(start, start + ITEMS_PER_PAGE);
  return { stores, totalPages};
}