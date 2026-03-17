export interface DashboardStats {
  monthlyRevenue: number;
  revenueTrend: number;
  totalOrders: number;
  ordersTrend: number;
  activeProducts: number;
  totalCustomers: number;
  customersTrend: number;
  revenueChart: ChartDataPoint[];
  ordersByStatusChart: ChartDataPoint[];
  topProducts: ProductSummary[];
  lowStockProducts: ProductSummary[];
}

export interface ChartDataPoint {
  name: string;
  value: any;
}

export interface ProductSummary {
  id: number;
  name: string;
  imageUrl: string | null;
  stock: number;
  price: number;
  totalSold: number | null;
}

export interface AdminProductRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
  active: boolean;
}

export interface AdminCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}
