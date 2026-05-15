import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../../core/services/report.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ExportReportItem } from '../../../../core/interface/report.interface';

@Component({
  selector: 'app-sales-reports',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    SkeletonModule,
    ToastModule,
    ChartModule,
    DatePickerModule,
    CardModule,
    TagModule,
    FormsModule,
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesReports implements OnInit {
  private reportService = inject(ReportService);
  private messageService = inject(MessageService);

  // State from service
  reportData = this.reportService.reportData;
  exportData = this.reportService.exportData;
  loading = this.reportService.isLoading;

  // Filters state
  dateRange = signal<Date[] | null>(null);
  
  // Modal state
  detailsDialog = signal<boolean>(false);
  selectedOrder = signal<ExportReportItem | null>(null);

  skeletonRows = Array(5).fill({});

  // Charts Logic
  topProductsData = computed(() => {
    const data = this.reportData()?.topProducts || [];
    return {
      labels: data.map(p => p.name),
      datasets: [
        {
          label: 'Units Sold',
          backgroundColor: '#3b82f6',
          data: data.map(p => p.unitsSold)
        }
      ]
    };
  });

  statusBreakdownData = computed(() => {
    const data = this.reportData()?.statusBreakdown || [];
    return {
      labels: data.map(s => s._id.toUpperCase()),
      datasets: [
        {
          data: data.map(s => s.count),
          backgroundColor: [
            '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#6366f1'
          ]
        }
      ]
    };
  });

  chartOptions = {
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          color: '#495057'
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    const filters = this.getFilters();
    this.reportService.getSalesReports(filters).subscribe();
    this.reportService.getExportData(filters).subscribe();
  }

  onDateSelect() {
    if (this.dateRange() && this.dateRange()![0] && this.dateRange()![1]) {
      this.fetchReports();
    }
  }

  clearFilters() {
    this.dateRange.set(null);
    this.fetchReports();
  }

  private getFilters() {
    if (!this.dateRange() || !this.dateRange()![0] || !this.dateRange()![1]) {
      return {};
    }
    const startDate = this.dateRange()![0];
    const endDate = new Date(this.dateRange()![1]);
    endDate.setHours(23, 59, 59, 999);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  exportReport() {
    const filters = this.getFilters();
    this.reportService.exportSalesReports(filters).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Report exported successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to export report'
        });
      }
    });
  }

  viewDetails(order: ExportReportItem) {
    this.selectedOrder.set(order);
    this.detailsDialog.set(true);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      preparing: 'Preparing',
      shipped: 'Shipped',
      received: 'Received',
      rejected: 'Rejected',
      cancelledByUser: 'Cancelled',
      cancelledByAdmin: 'Cancelled by Admin',
      refunded: 'Refunded'
    };
    return labels[status.toLowerCase()] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status.toLowerCase()) {
      case 'shipped':
      case 'delivered':
      case 'completed':
        return 'success';
      case 'pending':
      case 'received':
        return 'info';
      case 'processing':
        return 'warn';
      case 'cancelled':
      case 'rejected':
      case 'returned':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
