export interface CartItemResponse {
  productId: number;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: number;
  items: CartItemResponse[];
  total: number;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}
