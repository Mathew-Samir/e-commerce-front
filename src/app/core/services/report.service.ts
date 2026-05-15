import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SalesReportData, SalesReportResponse, ReportFilters, ExportReportResponse, ExportReportItem } from '../interface/report.interface';
import { tap, catchError, of, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/reports/sales`;

  // Signals
  private reportDataSignal = signal<SalesReportData | null>(null);
  private exportDataSignal = signal<ExportReportItem[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed Selectors
  reportData = computed(() => this.reportDataSignal());
  exportData = computed(() => this.exportDataSignal());
  isLoading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());

  getSalesReports(filters?: ReportFilters) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<SalesReportResponse>(this.apiUrl, { params }).pipe(
      tap((res) => {
        if (res.success) {
          this.reportDataSignal.set(res.data);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch sales reports');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  getExportData(filters?: ReportFilters) {
    this.loadingSignal.set(true);
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<ExportReportResponse>(`${this.apiUrl}/export`, { params }).pipe(
      tap((res) => {
        if (res.success) {
          this.exportDataSignal.set(res.data);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch export data');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  exportSalesReports(filters?: ReportFilters) {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<ExportReportResponse>(`${this.apiUrl}/export`, { params }).pipe(
      tap((res) => {
        if (res.success) {
          this.downloadAsCSV(res.data);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Export failed');
        return of(null);
      })
    );
  }

  private downloadAsCSV(data: any[]) {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(item => headers.map(h => `"${item[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
