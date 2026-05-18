import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { OrderService } from '../../../../core/services/order.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, TableModule, TagModule, ButtonModule, CurrencyPipe, DatePipe, RouterModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrders implements OnInit {
  private orderService = inject(OrderService);

  orders = this.orderService.orders;
  isLoading = signal(true);

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case 'received':
        return 'success';
      case 'pending':
        return 'info';
      case 'preparing':
        return 'warn';
      case 'shipped':
        return 'contrast';
      case 'rejected':
      case 'cancelledByUser':
      case 'cancelledByAdmin':
        return 'danger';
      case 'refunded':
        return 'secondary';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      preparing: 'Preparing',
      shipped: 'Shipped',
      received: 'Received',
      rejected: 'Rejected',
      cancelledByUser: 'Cancelled',
      cancelledByAdmin: 'Cancelled',
      refunded: 'Refunded'
    };
    return labels[status] || status;
  }
}
