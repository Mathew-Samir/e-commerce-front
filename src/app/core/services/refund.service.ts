import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RefundResponse, SingleRefundResponse } from '../interface/refund.interface';
import { ApiResponse } from '../interface/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/refunds`;

  requestRefund(payload: { orderId: string; reason: string; products: any[] }) {
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload);
  }

  getMyRefunds() {
    return this.http.get<RefundResponse>(`${this.apiUrl}/my`);
  }

  getAllRefunds() {
    return this.http.get<RefundResponse>(this.apiUrl);
  }

  approveRefund(id: string) {
    return this.http.patch<SingleRefundResponse>(`${this.apiUrl}/${id}/approve`, {});
  }

  refuseRefund(id: string, reason?: string) {
    return this.http.patch<SingleRefundResponse>(`${this.apiUrl}/${id}/refuse`, { reason });
  }
}
