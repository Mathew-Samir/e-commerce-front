import { ApiResponse } from './api-response.interface';

export interface Refund {
  _id: string;
  orderId: string | { _id: string, orderNumber: string };
  user: string | { _id: string, name: string, email: string };
  refundedAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export type RefundResponse = ApiResponse<Refund[]>;
export type SingleRefundResponse = ApiResponse<Refund>;
