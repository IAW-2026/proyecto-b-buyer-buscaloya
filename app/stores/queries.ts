// server
import { auth } from '@clerk/nextjs/server';
import { fetchMockStores } from '@/app/lib/mocks';
import { Store } from '@/app/lib/definitions';

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

  const resp = await fetch(`${process.env.SELLER_APP_URL}/api/stores`, {
    method: 'GET',
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
  return { stores, totalPages };
}

export async function fetchWeatherAlert() {
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    let isBadWeather = false;
    let conditionText = '';

    const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Bahia Blanca&lang=es`, {
      next: { revalidate: 1800 }
    });

    if (!res.ok) return null;

    const data = await res.json();
    conditionText = data.current?.condition?.text || '';
    const conditionLower = conditionText.toLowerCase();

    console.log("Condition: " + conditionLower);

    isBadWeather = conditionLower.includes('lluvia') ||
      conditionLower.includes('llovizna') ||
      conditionLower.includes('tormenta') ||
      (data.current?.precip_mm || 0) > 0;

    return { conditionText, isBadWeather };
  } catch (err) {
    console.error("Error fetching weather data:", err);
    return null;
  }
}