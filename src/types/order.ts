import { CartItem } from "@/store/cart";

export type OrderStatus =
  | "결제완료"
  | "배송준비"
  | "배송중"
  | "배송완료"
  | "취소"
  | "교환/반품";

export type PaymentMethod =
  | "card"
  | "transfer"
  | "virtual"
  | "kakaopay"
  | "naverpay"
  | "tosspay";

export interface ShippingInfo {
  name: string;
  phone: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  memo: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shipping: ShippingInfo;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
}
