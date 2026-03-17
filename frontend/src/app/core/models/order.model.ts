export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  userId: string;
  status: OrderStatus;
  total: number;
  shippingAddress: string;
  createdAt: string;
  items: OrderItemResponse[];
}

// Reuse Page from product model
import { Page } from './product.model';
export type OrderPage = Page<OrderResponse>;
