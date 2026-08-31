export interface OrderItem {
  product: string;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  transactionId: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "failed" | "cancelled";
  createdAt: string;
  user?: { name: string; email: string }; // populated only in admin view
}