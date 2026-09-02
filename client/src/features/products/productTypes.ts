export interface Product {
  _id: string;
  title: string;
  description: string;
  partNumber: string;
  make: string;
  model: string;
  yearRange: { start: number; end: number };
  category: string;
  price: number;
  stock: number;
  images: string[];
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
  make?: string;
  model?: string;
  category?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}