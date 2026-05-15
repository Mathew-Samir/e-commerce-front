import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RefundService } from '../../../../core/services/refund.service';
import { Refund } from '../../../../core/interface/refund.interface';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-refunds',
  imports: [CommonModule, TableModule, TagModule, CurrencyPipe, DatePipe, RouterModule],
  templateUrl: './my-refunds.html',
  styleUrl: './my-refunds.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyRefunds implements OnInit {
  private refundService = inject(RefundService);

  refunds = signal<Refund[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchRefunds();
  }

  fetchRefunds() {
    this.isLoading.set(true);
    this.refundService.getMyRefunds().subscribe({
      next: (res) => {
        if (res.success) {
          this.refunds.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'info';
      case 'rejected':
        return 'danger';
      default:
        return 'info';
    }
  }

  getOrderNumber(order: any): string {
    if (typeof order === 'object' && order !== null) {
      return order.orderNumber || 'N/A';
    }
    return 'N/A';
  }

  getOrderId(order: any): string {
    if (typeof order === 'object' && order !== null) {
      return order._id || '';
    }
    return order || '';
  }
}
