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
  products: Product[];
}