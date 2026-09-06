export interface Product {
  _id: string;
  title: string;
  description: string;
  sku: string;
  category: string;
  make?: string;
  model?: string;
  yearRange?: { start: number; end: number };
  price: number;
  stock: number;
  images: string[];
  specifications?: Record<string, string>;
  averageRating: number;
  reviewCount: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  category?: string;
  make?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}
