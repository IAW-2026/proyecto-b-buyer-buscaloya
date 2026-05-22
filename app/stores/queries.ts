// server
import { auth } from '@clerk/nextjs/server';

export type Store = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
};

const ITEMS_PER_PAGE = 3;

const MOCK_STORES: Store[] = [
  { id: 'store-123', name: 'Pizzería Don Carlos', description: 'Las mejores pizzas...', category: 'Gastronomía', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-456', name: 'Librería El Ateneo', description: 'Textos escolares...', category: 'Librería', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-789', name: 'TechStore', description: 'Insumos de computación...', category: 'Tecnología', image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-101', name: 'Kiosco Lo de Cacho', description: 'Golosinas...', category: 'Kiosco', image_url: 'https://images.unsplash.com/photo-1552820728-8b83f0c7b4e3?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-102', name: 'Roti Ya', description: 'Comida casera...', category: 'Gastronomía', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f74?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-103', name: 'Moda Actual', description: 'La mejor ropa...', category: 'Vestimenta', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b67a9d9?q=80&w=600&auto=format&fit=crop' },
];

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

async function fetchMockStores() {
  await new Promise(r => setTimeout(r, 300));
  return MOCK_STORES;
}

export async function fetchStoresWithMeta(currentPage: number, search?: string) {
  const isMocking = true; // Cambiar a false para usar la API real
  const all = isMocking ? await fetchMockStores() : await fetchAllStoresFromSeller();
  const filtered = applySearch(all, search);
  const totalStores = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalStores / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const stores = filtered.slice(start, start + ITEMS_PER_PAGE);
  return { stores, totalPages};
}