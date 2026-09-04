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
  status:
    | "pending"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "return_requested"
    | "returned"
    | "failed";
  createdAt: string;
  user?: { name: string; email: string };
  cancellation?: { reason: string; cancelledAt: string };
  returnRequest?: {
    reason: string;
    requestedAt: string;
    status: "pending" | "approved" | "rejected";
    reviewedAt: string | null;
    adminNote: string | null;
  };
  refundStatus?: "none" | "pending" | "completed" | "failed";
}
