export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

export interface TopProduct {
  _id: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface StatusBreakdown {
  _id: string;
  count: number;
}

export interface SalesReportData {
  summary: ReportSummary;
  topProducts: TopProduct[];
  statusBreakdown: StatusBreakdown[];
}

export interface SalesReportResponse {
  success: boolean;
  data: SalesReportData;
}

export interface ExportReportItem {
  orderId: string;
  customer: string;
  mobile: string;
  address: string;
  date: string;
  total: number;
  status: string;
  productCount: number;
  productNames: string;
}

export interface ExportReportResponse {
  success: boolean;
  data: ExportReportItem[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
}
