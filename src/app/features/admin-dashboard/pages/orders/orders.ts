import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/interface/order.interface';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    TooltipModule,
    SkeletonModule,
    FormsModule,
  ],
  providers: [MessageService],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersManagement implements OnInit {
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);

  orders = this.orderService.orders;
  loading = signal<boolean>(true);

  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Received', value: 'received' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled (User)', value: 'cancelledByUser' },
    { label: 'Cancelled (Admin)', value: 'cancelledByAdmin' },
    { label: 'Refunded', value: 'refunded' },
  ];

  skeletonRows = Array(5).fill({});

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  onStatusChange(order: Order, newStatus: string) {
    this.orderService.updateOrderStatus(order._id, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Order status updated to ${newStatus}`,
          });
        }
      },
    });
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
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
    const option = this.statusOptions.find((o) => o.value === status);
    return option ? option.label : status;
  }
}
