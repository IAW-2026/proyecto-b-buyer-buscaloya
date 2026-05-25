import { auth } from '@clerk/nextjs/server';
import { fetchMockCatalog } from '@/app/lib/mocks';
import { Product, CatalogResponse } from '@/app/lib/definitions';

async function realFetchCatalog(storeId: string, token: string) {
  return await fetch(`${process.env.SELLER_API_URL}/api/stores/${storeId}/catalog`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
    });
}

export async function fetchCatalog(storeId: string): Promise<Product[]> {
  const isMocking = process.env.USE_MOCKS === 'true'; // Variable de entorno


  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error('No estás autenticado');

  try {
    const response = isMocking ? await fetchMockCatalog(storeId) : await realFetchCatalog(storeId, token);

    if (!response.ok) throw new Error(`Error al obtener catálogo: ${response.status}`);
    
    const data: CatalogResponse = await response.json();
    return Array.isArray(data) ? data : (data.products || []);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return []; 
  }
}
