import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefundService } from '../../../../core/services/refund.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { Refund } from '../../../../core/interface/refund.interface';

@Component({
  selector: 'app-refunds-management',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './refunds.html',
  styleUrl: './refunds.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundsManagement implements OnInit {
  private refundService = inject(RefundService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  refunds = signal<Refund[]>([]);
  loading = signal<boolean>(false);
  skeletonRows = Array(5).fill({});

  pendingCount = computed(() => this.refunds().filter(r => r.status === 'pending').length);
  approvedCount = computed(() => this.refunds().filter(r => r.status === 'approved').length);
  rejectedCount = computed(() => this.refunds().filter(r => r.status === 'rejected').length);

  ngOnInit() {
    this.loadRefunds();
  }

  loadRefunds() {
    this.loading.set(true);
    this.refundService.getAllRefunds().subscribe({
      next: (res) => {
        if (res.success) {
          this.refunds.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load refunds' });
        this.loading.set(false);
      }
    });
  }

  approveRefund(refund: Refund) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to approve this refund request?',
      header: 'Confirm Approval',
      icon: 'pi pi-check-circle',
      acceptButtonStyleClass: 'p-button-success p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-plain',
      accept: () => {
        this.refundService.approveRefund(refund._id).subscribe({
          next: () => {
            this.loadRefunds();
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Refund approved successfully' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve refund' });
          }
        });
      }
    });
  }

  refuseRefund(refund: Refund) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to refuse this refund request?',
      header: 'Confirm Refusal',
      icon: 'pi pi-times-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-plain',
      accept: () => {
        this.refundService.refuseRefund(refund._id).subscribe({
          next: () => {
            this.loadRefunds();
            this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Refund refused' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to refuse refund' });
          }
        });
      }
    });
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warn';
      default: return 'info';
    }
  }

  getOrderNumber(refund: Refund): string {
    if (typeof refund.orderId === 'object' && refund.orderId !== null) {
      return refund.orderId._id;
    }
    return refund.orderId as string;
  }

  getShortOrderId(refund: Refund): string {
    const id = this.getOrderNumber(refund);
    return id.length > 8 ? `${id.slice(-8).toUpperCase()}` : id;
  }

  getUserName(refund: Refund): string {
    if (typeof refund.userId === 'object' && refund.userId !== null) {
      return refund.userId.name;
    }
    return 'Unknown User';
  }

  getUserEmail(refund: Refund): string {
    if (typeof refund.userId === 'object' && refund.userId !== null) {
      return refund.userId.email;
    }
    return '';
  }

  getUserInitials(refund: Refund): string {
    const name = this.getUserName(refund);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
