import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RefundService } from '../../../../core/services/refund.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/interface/order.interface';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-your-order',
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    RouterModule,
    DialogModule,
    FormsModule,
    InputTextModule
  ],
  templateUrl: './your-order.html',
  styleUrl: './your-order.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YourOrder implements OnInit {
  private orderService = inject(OrderService);
  private refundService = inject(RefundService);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  order = signal<Order | null>(null);
  isConfirmDialogVisible = signal(false);
  confirmActionType = signal<'cancel' | 'refund' | null>(null);
  refundReason = signal('');

  ngOnInit() {
    const orderId = this.route.snapshot.params['id'];

    if (orderId) {
      this.fetchOrderById(orderId);
    } else {
      this.fetchLatestOrder();
    }
  }

  private fetchOrderById(id: string) {
    this.orderService.getOrderById(id).subscribe((res) => {
      if (res.success) {
        this.order.set(res.data);
      }
    });
  }

  private fetchLatestOrder() {
    this.orderService.getMyOrders().subscribe((res) => {
      if (res?.success && res.data.length > 0) {
        // Show the most recent order
        this.order.set(res.data[0]);
      }
    });
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'received':
        return 'success';
      case 'pending':
      case 'processing':
      case 'preparing':
        return 'info';
      case 'shipped':
        return 'warn';
      case 'cancelledbyuser':
      case 'cancelledbyadmin':
      case 'rejected':
      case 'refunded':
        return 'danger';
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

  openConfirmDialog(action: 'cancel' | 'refund') {
    this.confirmActionType.set(action);
    this.refundReason.set(''); // Reset reason
    this.isConfirmDialogVisible.set(true);
  }

  confirmAction() {
    const action = this.confirmActionType();
    const currentOrder = this.order();
    if (!currentOrder) return;

    if (action === 'cancel') {
      this.orderService.cancelOrder(currentOrder._id).subscribe((res) => {
        if (res.success) {
          this.order.set(res.data);
          this.isConfirmDialogVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Order Cancelled',
            detail: 'Your order has been successfully cancelled.'
          });
        }
      });
    } else if (action === 'refund') {
      if (currentOrder.status.toLowerCase() !== 'received') {
        return;
      }
      if (!this.refundReason().trim()) {
        return;
      }

      const payload = {
        orderId: currentOrder._id,
        reason: this.refundReason(),
        products: currentOrder.products.map(p => ({
          productId: p.productId,
          name: p.name,
          price: p.price,
          quantity: p.quantity
        }))
      };

      this.refundService.requestRefund(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.isConfirmDialogVisible.set(false);
            this.fetchOrderById(currentOrder._id);
            this.messageService.add({
              severity: 'success',
              summary: 'Refund Requested',
              detail: 'Your refund request has been submitted successfully.'
            });
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to submit refund request.'
          });
        }
      });
    }
  }

  cancelOrder(id: string) {
    this.orderService.cancelOrder(id).subscribe((res) => {
      if (res.success) {
        this.order.set(res.data);
      }
    });
  }
}
