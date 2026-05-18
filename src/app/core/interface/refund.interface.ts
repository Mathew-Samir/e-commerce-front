import { ApiResponse } from './api-response.interface';

export interface RefundUser {
  _id: string;
  name: string;
  email: string;
}

export interface RefundOrder {
  _id: string;
  status: string;
  totalPrice: number;
}

export interface Refund {
  _id: string;
  orderId: string | RefundOrder;
  userId: string | RefundUser;
  refundedAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export type RefundResponse = ApiResponse<Refund[]>;
export type SingleRefundResponse = ApiResponse<Refund>;
