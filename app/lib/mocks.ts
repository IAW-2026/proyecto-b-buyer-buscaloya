const MOCKED_STORES = [
  { id: 'store-123', name: 'Pizzería Don Carlos', description: 'Las mejores pizzas...', category: 'Gastronomía', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-456', name: 'Librería El Ateneo', description: 'Textos escolares...', category: 'Librería', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-789', name: 'TechStore', description: 'Insumos de computación...', category: 'Tecnología', image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-101', name: 'Kiosco Lo de Cacho', description: 'Golosinas...', category: 'Kiosco', image_url: 'https://images.unsplash.com/photo-1552820728-8b83f0c7b4e3?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-102', name: 'Roti Ya', description: 'Comida casera...', category: 'Gastronomía', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f74?q=80&w=600&auto=format&fit=crop' },
  { id: 'store-103', name: 'Moda Actual', description: 'La mejor ropa...', category: 'Vestimenta', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b67a9d9?q=80&w=600&auto=format&fit=crop' },
];

const MOCKED_PRODUCTS_BY_STORE: Record<string, Array<{
  product_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock: number;
}>> = {
  'store-123': [
    { product_id: 'piz-001', name: 'Muzzarella Grande', description: 'Clásica muzzarella con doble porción de queso.', price: 1200, image_url: 'https://images.unsplash.com/photo-1601924582975-9b6b5f3b0f6e?q=80&w=600&auto=format&fit=crop', stock: 20 },
    { product_id: 'piz-002', name: 'Napolitana', description: 'Tomate fresco, muzzarella y ajo.', price: 1350, image_url: 'https://images.unsplash.com/photo-1548365328-5cf5b5b6d0f9?q=80&w=600&auto=format&fit=crop', stock: 15 },
    { product_id: 'piz-003', name: 'Fugazza', description: 'Cebolla caramelizada y orégano.', price: 900, image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop', stock: 10 },
    { product_id: 'piz-004', name: 'Empanada de carne', description: 'Empanada horneada de carne tradicional.', price: 250, image_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600&auto=format&fit=crop', stock: 50 }
  ],
  'store-456': [
    { product_id: 'lib-001', name: 'Matemáticas 1', description: 'Libro de texto escolar - 1º año', price: 2200, image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop', stock: 12 },
    { product_id: 'lib-002', name: 'Cuaderno A4 x100', description: 'Cuaderno tapa blanda 100 hojas cuadriculado.', price: 450, image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop', stock: 200 },
    { product_id: 'lib-003', name: 'Bolígrafo Azul', description: 'Bolígrafo gel 0.7mm', price: 80, image_url: 'https://images.unsplash.com/photo-1528747045269-390fe33c19b3?q=80&w=600&auto=format&fit=crop', stock: 500 }
  ],
  'store-789': [
    { product_id: 'tech-001', name: 'Mouse Inalámbrico', description: 'Bluetooth, batería 12 meses.', price: 3500, image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop', stock: 30 },
    { product_id: 'tech-002', name: 'Teclado Mecánico', description: 'Switches táctiles, retroiluminado.', price: 7500, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop', stock: 8 },
    { product_id: 'tech-003', name: 'SSD 500GB', description: 'NVMe, alta velocidad.', price: 9800, image_url: 'https://images.unsplash.com/photo-1585079542013-1b4a1e6a8f7b?q=80&w=600&auto=format&fit=crop', stock: 5 }
  ],
  'store-101': [
    { product_id: 'kio-001', name: 'Chocolate 50g', description: 'Barra de chocolate surtido.', price: 180, image_url: 'https://images.unsplash.com/photo-1541560052-0a1c2b0fbf4a?q=80&w=600&auto=format&fit=crop', stock: 40 },
    { product_id: 'kio-002', name: 'Papas Fritas Bolsa', description: 'Snack salado 80g.', price: 200, image_url: 'https://images.unsplash.com/photo-1585238342027-8f6a5b1b9e5f?q=80&w=600&auto=format&fit=crop', stock: 35 },
    { product_id: 'kio-003', name: 'Gaseosa 500ml', description: 'Bebida gaseosa clásica.', price: 350, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop', stock: 25 }
  ],
  'store-102': [
    { product_id: 'rot-001', name: 'Milanesa con puré', description: 'Milanesa de pollo con puré casero.', price: 1650, image_url: 'https://images.unsplash.com/photo-1604908177522-6c87f5a9b6b2?q=80&w=600&auto=format&fit=crop', stock: 10 },
    { product_id: 'rot-002', name: 'Pollo al horno', description: 'Porción de pollo al horno con guarnición.', price: 1450, image_url: 'https://images.unsplash.com/photo-1604908812568-4b4d7b2ae9a8?q=80&w=600&auto=format&fit=crop', stock: 8 },
    { product_id: 'rot-003', name: 'Porción de empanadas (3)', description: 'Empanadas caseras surtidas, unidad x3.', price: 700, image_url: 'https://images.unsplash.com/photo-1601924582975-9b6b5f3b0f6e?q=80&w=600&auto=format&fit=crop', stock: 25 }
  ],
  'store-103': [
    { product_id: 'mod-001', name: 'Remera básica', description: 'Remera algodón unisex.', price: 2500, image_url: 'https://images.unsplash.com/photo-1520975917182-1a2f0f5d7b8b?q=80&w=600&auto=format&fit=crop', stock: 60 },
    { product_id: 'mod-002', name: 'Jean clásico', description: 'Jean corte recto.', price: 7200, image_url: 'https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=600&auto=format&fit=crop', stock: 20 },
    { product_id: 'mod-003', name: 'Campera liviana', description: 'Rompevientos para primavera.', price: 5200, image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop', stock: 15 }
  ]
};

export const MOCK_ROUTE = [
  { lat: -38.7183, lng: -62.2663 }, // Punto de partida
  { lat: -38.7175, lng: -62.2650 },
  { lat: -38.7168, lng: -62.2641 },
  { lat: -38.7155, lng: -62.2625 },
  { lat: -38.7142, lng: -62.2610 }, // Destino
];

export async function fetchMockStores() {
  await new Promise(r => setTimeout(r, 300));
  return MOCKED_STORES;
}

export async function fetchMockCatalog(storeId: string) {
  await new Promise(r => setTimeout(r, 300));
  const products = MOCKED_PRODUCTS_BY_STORE[storeId] ?? [];
  const store = MOCKED_STORES.find(s => s.id === storeId);
  const payload = {
    store_name: store?.name ?? null,
    store_image_url: store?.image_url ?? null,
    products,
  };

  return {
    ok: true,
    status: 200,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

export async function mokedSendCartAction(items: any[], stores: any[]) {
  // 1. Simular latencia de red (400ms) para una experiencia realista
  await new Promise((resolve) => setTimeout(resolve, 400));

  // 2. Calcular el monto total (amount) de la compra usando los items del carrito
  const amount = (items || []).reduce((total: number, it: any) => {
    const price = Number(it.productPrice ?? it.price ?? 0);
    const qty = Number(it.quantity ?? 0);
    return total + (price * qty);
  }, 0);

  // 3. Construir los paquetes cruzando la información del payload con nuestros mocks locales
  const packages = (stores || []).map((store: any) => {
    // Buscamos el nombre real de la tienda en nuestro catálogo mockeado
    const mockStore = MOCKED_STORES.find(s => s.id === store.store_id);
    const storeName = mockStore?.name ?? `Tienda Descocnocida (${store.store_id})`;

    const packagedItems = (store.items || []).map((it: any) => {
      // Buscamos el nombre real del producto en nuestro catálogo mockeado
      const mockProducts = MOCKED_PRODUCTS_BY_STORE[store.store_id] || [];
      const mockProduct = mockProducts.find(p => p.product_id === it.product_id);
      const productName = mockProduct?.name ?? `Producto (${it.product_id})`;

      return {
        product_name: productName,
        quantity: Number(it.quantity ?? 0),
      };
    });

    return {
      package_id: crypto.randomUUID(), // Generador nativo de UUIDs
      store_name: storeName,
      items: packagedItems,
    };
  });

  // 4. Armar el cuerpo de la respuesta final
  const mockResponse = {
    payment_order_id: crypto.randomUUID(),
    amount,
    packages,
  };

  // 5. Devolver un objeto que imita exactamente la interfaz 'Response' de un fetch
  return {
    ok: true,
    status: 200,
    json: async () => mockResponse,
    text: async () => JSON.stringify(mockResponse),
  };
}