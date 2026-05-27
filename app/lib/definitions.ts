export type Store = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
};

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface CatalogResponse {
  store_name: string;
  store_image_url: string;
  products: Product[];
}

export type OrderStatus = 'PAYMENT_PENDING' | 'PREPARING' | 'ON_THE_WAY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export type PurchaseStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'COMPLETED';

export interface Order {
  order_id: string;
  purchase_id: string;
  store_name: string;
  status: OrderStatus;
  delivery_code?: number;
  items?: OrderItem[];
  buyer_lat?: number;
  buyer_lng?: number;
  buyer_street?: string;
}

export interface OrderItem {
  product_name: string;
  quantity: number;
}

export interface Purchase {
  purchase_id: string;
  client_id: string;
  address_id: string;
  amount: number;
  status: PurchaseStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface LiveMapProps {
  courierLocation: Location | null;
  destination: Location & { street: string };
}

export type User = {
  client_id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
};

export type Address = {
  address_id: string;
  title?: string;
  street?: string;
  city?: string;
  lat?: number;
  lng?: number;
};