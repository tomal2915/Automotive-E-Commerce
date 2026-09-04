import { api } from "../../lib/api";
import type { Order } from "./orderTypes";

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  postcode?: string;
  couponCode?: string; // ADDED
}

export const initiateCheckoutRequest = async (data: {
  shippingAddress: ShippingAddress;
  couponCode?: string;
}): Promise<{ gatewayUrl: string; orderId: string }> => {
  const res = await api.post("/orders/checkout", data);
  return res.data;
};

export const fetchMyOrders = async (): Promise<Order[]> => {
  const res = await api.get("/orders/my/all");
  return res.data.orders;
};

export const fetchAllOrders = async (params: {
  page?: number;
  status?: string;
}): Promise<{ orders: Order[]; pagination: any }> => {
  const res = await api.get("/orders/admin/all", { params });
  return res.data;
};

export const updateOrderStatusRequest = async (
  orderId: string,
  status: string,
): Promise<Order> => {
  const res = await api.put(`/orders/admin/${orderId}/status`, { status });
  return res.data.order;
};

export const cancelOrderRequest = async (orderId: string, reason: string) => {
  const res = await api.post(`/orders/${orderId}/cancel`, { reason });
  return res.data;
};

export const requestReturnRequest = async (orderId: string, reason: string) => {
  const res = await api.post(`/orders/${orderId}/return`, { reason });
  return res.data;
};

export const fetchPendingReturns = async () => {
  const res = await api.get("/orders/admin/returns");
  return res.data.orders;
};

export const reviewReturnRequestApi = async (
  orderId: string,
  decision: "approved" | "rejected",
  adminNote?: string,
) => {
  const res = await api.put(`/orders/admin/${orderId}/return-review`, {
    decision,
    adminNote,
  });
  return res.data;
};
