import { api } from "../../lib/api";

export interface Summary {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingReturns: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  _id: string;
  title: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface LowStockProduct {
  _id: string;
  title: string;
  stock: number;
  category: string;
}

export interface DashboardBundle {
  summary: Summary;
  revenueTrend: RevenueTrendPoint[];
  topProducts: TopProduct[];
  orderStatusBreakdown: StatusBreakdown[];
  lowStockProducts: LowStockProduct[];
}

// NEW — one call fetches everything the dashboard page needs, instead of
// 5 separate round trips + 5 separate React Query loading states
export const fetchDashboardBundle = async (): Promise<DashboardBundle> => {
  const res = await api.get("/analytics/dashboard");
  return res.data;
};

// Kept for backward compatibility / other potential consumers — no
// longer used by AdminDashboardPage itself
export const fetchSummary = async (): Promise<Summary> => {
  const res = await api.get("/analytics/summary");
  return res.data;
};

export const fetchRevenueTrend = async (
  days = 30,
): Promise<RevenueTrendPoint[]> => {
  const res = await api.get("/analytics/revenue-trend", { params: { days } });
  return res.data.trend;
};

export const fetchTopProducts = async (limit = 10): Promise<TopProduct[]> => {
  const res = await api.get("/analytics/top-products", { params: { limit } });
  return res.data.topProducts;
};

export const fetchOrderStatusBreakdown = async (): Promise<
  StatusBreakdown[]
> => {
  const res = await api.get("/analytics/order-status-breakdown");
  return res.data.breakdown;
};

export const fetchLowStockProducts = async (
  threshold = 5,
): Promise<LowStockProduct[]> => {
  const res = await api.get("/analytics/low-stock", { params: { threshold } });
  return res.data.products;
};
