import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true }, // snapshot, in case product changes later
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // price at time of order
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },

    // Unique per-order transaction id we generate and send to SSLCommerz;
    // used to match the IPN callback back to this exact order
    transactionId: { type: String, required: true, unique: true, index: true },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "failed", "cancelled"],
      default: "pending",
    },

    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
    },

    // Raw payment metadata returned by SSLCommerz, kept for auditing
    paymentDetails: {
      bank_tran_id: String,
      card_type: String,
      val_id: String,
    },
    
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    subtotal: { type: Number }, // amount before discount — totalAmount is now the final, post-discount amount
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
