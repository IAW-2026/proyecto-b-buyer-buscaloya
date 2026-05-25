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