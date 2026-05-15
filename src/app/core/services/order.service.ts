import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order } from '../interface/order.interface';
import { ApiResponse } from '../interface/api-response.interface';
import { tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  // State
  private ordersSignal = signal<Order[]>([]);
  private currentOrderSignal = signal<Order | null>(null);

  // Selectors
  orders = this.ordersSignal.asReadonly();
  currentOrder = this.currentOrderSignal.asReadonly();

  createOrder(orderData: Record<string, any>) {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, orderData).pipe(
      tap((res) => {
        if (res.success) {
          this.ordersSignal.update((orders) => [...orders, res.data]);
        }
      })
    );
  }

  getMyOrders() {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/my-orders`).pipe(
      tap((res) => {
        if (res.success) {
          this.ordersSignal.set(res.data);
        }
      }),
      catchError(() => {
        this.ordersSignal.set([]);
        return of(null);
      })
    );
  }

  getOrderById(id: string) {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.currentOrderSignal.set(res.data);
        }
      })
    );
  }

  cancelOrder(id: string) {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      tap((res) => {
        if (res.success) {
          this.ordersSignal.update((orders) =>
            orders.map((o) => (o._id === id ? res.data : o))
          );
          if (this.currentOrderSignal()?._id === id) {
            this.currentOrderSignal.set(res.data);
          }
        }
      })
    );
  }

  // Admin Methods
  getAllOrders(filters: any = {}) {
    return this.http.get<ApiResponse<Order[]>>(`${environment.apiUrl}/admin/orders`, { params: filters }).pipe(
      tap((res) => {
        if (res.success) {
          this.ordersSignal.set(res.data);
        }
      })
    );
  }

  updateOrderStatus(id: string, status: string) {
    return this.http.put<ApiResponse<Order>>(`${environment.apiUrl}/admin/orders/${id}/status`, { status }).pipe(
      tap((res) => {
        if (res.success) {
          this.ordersSignal.update((orders) =>
            orders.map((o) => (o._id === id ? res.data : o))
          );
        }
      })
    );
  }
}
