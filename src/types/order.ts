import { CartItem } from "@/store/cart";

export type OrderStatus =
  | "결제대기"
  | "결제완료"
  | "배송준비"
  | "배송중"
  | "배송완료"
  | "취소처리중"
  | "취소"
  | "환불확인필요"
  | "만료"
  | "교환/반품";

/** 토스 결제 상태 추적 값 (orders.payment_status) */
export type PaymentStatus =
  | "NONE"
  | "READY"
  | "IN_PROGRESS"
  | "WAITING_FOR_DEPOSIT"
  | "DONE"
  | "CANCELED"
  | "PARTIAL_CANCELED"
  | "ABORTED"
  | "EXPIRED"
  | "ZERO_AMOUNT"
  | "RECONCILIATION_REQUIRED";

export type PaymentMethod =
  | "card"
  | "transfer"
  | "virtual"
  | "kakaopay"
  | "naverpay"
  | "tosspay"
  | "points";

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
  paymentStatus?: PaymentStatus;
  createdAt: string;
  trackingNumber?: string;
}
