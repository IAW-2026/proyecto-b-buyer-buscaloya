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
  total_amount: number;
  delivery_code?: number;
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