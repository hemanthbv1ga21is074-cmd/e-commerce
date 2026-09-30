export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export type Gender = 'men' | 'women' | 'kids';
