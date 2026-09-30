export interface CartItem {
  productId: string;
  title: string;
  brand: string;
  size: string;
  color: string;
  quantity: number;
  mrp: number;
  price: number;
  image?: string;
  slug: string;
  maxStock: number;
}
