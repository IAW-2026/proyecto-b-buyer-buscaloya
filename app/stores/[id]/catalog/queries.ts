import { auth } from '@clerk/nextjs/server';

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

export interface CatalogResponse {
  products: Product[];
}

const MOCK_PRODUCTS: Product[] = [
  {
    product_id: "uuid-123",
    name: "Pizza Especial",
    description: "Pizza con jamón, queso mozzarella y aceitunas.",
    price: 1500.0,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop"
  },
  {
    product_id: "uuid-456",
    name: "Empanada de Carne",
    description: "Empanada frita de carne cortada a cuchillo con huevo y cebolla de verdeo.",
    price: 800.0,
    stock: 50,
    image_url: "https://images.unsplash.com/photo-1626200419188-348e9196b290?q=80&w=600&auto=format&fit=crop"
  },
  {
    product_id: "uuid-789",
    name: "Cerveza Artesanal IPA",
    description: "Pinta de cerveza artesanal estilo Indian Pale Ale.",
    price: 2500.0,
    stock: 0,
    image_url: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=600&auto=format&fit=crop"
  }
  ,
  {
    product_id: "uuid-1010",
    name: "Ensalada César",
    description: "Ensalada fresca con lechuga, pollo, croutons y aderezo César.",
    price: 1200.0,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=600&auto=format&fit=crop"
  },
  {
    product_id: "uuid-2020",
    name: "Sándwich Vegano",
    description: "Pan integral relleno de hummus, aguacate, vegetales grillados y brotes.",
    price: 950.0,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=600&auto=format&fit=crop"
  },
  {
    product_id: "uuid-3030",
    name: "Té Helado Limón",
    description: "Té negro frío infusionado con limón y un toque de miel.",
    price: 450.0,
    stock: 100,
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop"
  },
  {
    product_id: "uuid-4040",
    name: "Tarta de Chocolate",
    description: "Porción de tarta de chocolate con ganache y polvo de cacao.",
    price: 700.0,
    stock: 8,
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"
  },
  {
    product_id: "uuid-5050",
    name: "Helado Artesanal",
    description: "Cucurucho de helado artesanal (varios sabores disponibles).",
    price: 650.0,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?q=80&w=600&auto=format&fit=crop"
  }
];

export async function fetchCatalog(storeId: string): Promise<Product[]> {
  const isMocking = true; // Variable de entorno
  
  if (isMocking) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_PRODUCTS;
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error('No estás autenticado');

  try {
    const response = await fetch(`${process.env.SELLER_API_URL}/api/stores/${storeId}/catalog`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Error al obtener catálogo: ${response.status}`);
    
    const data: CatalogResponse = await response.json();
    return Array.isArray(data) ? data : (data.products || []);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return []; 
  }
}
