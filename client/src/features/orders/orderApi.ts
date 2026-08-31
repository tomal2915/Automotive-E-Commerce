import { api } from "../../lib/api";
import type { Order } from "./orderTypes";

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export const initiateCheckoutRequest = async (
  shippingAddress: ShippingAddress,
): Promise<{ gatewayUrl: string; orderId: string }> => {
  const res = await api.post("/orders/checkout", { shippingAddress });
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