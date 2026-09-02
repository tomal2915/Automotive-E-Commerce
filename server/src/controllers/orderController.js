import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sslcz } from "../config/sslcommerz.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import Coupon from "../models/Coupon.js";
import { validateAndCalculateDiscount } from "../utils/couponHelper.js";

// @route POST /api/v1/orders/checkout
// Creates a pending order from the user's cart and starts an SSLCommerz session
export const initiateCheckout = async (req, res) => {
  try {
    const { shippingAddress, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Verify stock is still available for every item before charging
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `${item.product.title} is out of stock` });
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0,
    );

    let discountAmount = 0;
    let appliedCoupon = null;

    // Re-validate the coupon server-side even though the user already saw
    // a preview via /coupons/validate — never trust a discount value sent
    // directly from the client, since that could be tampered with
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }

      try {
        discountAmount = validateAndCalculateDiscount(coupon, subtotal);
        appliedCoupon = coupon;
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    const totalAmount = Math.round((subtotal - discountAmount) * 100) / 100;
    const transactionId = uuidv4();

    const order = await Order.create({
      user: req.user.id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        title: item.product.title,
        quantity: item.quantity,
        price: item.priceAtAdd,
      })),
      subtotal,
      discountAmount,
      couponCode: appliedCoupon?.code ?? null,
      totalAmount,
      transactionId,
      status: "pending",
      shippingAddress,
    });

    // Reserve the usage slot now (at order creation), not after payment —
    // prevents two simultaneous checkouts both grabbing the last usage slot
    if (appliedCoupon) {
      await Coupon.updateOne(
        { _id: appliedCoupon._id },
        { $inc: { usedCount: 1 } },
      );
    }

    const sslData = {
      total_amount: totalAmount, // charge the DISCOUNTED amount, not the subtotal
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${process.env.SERVER_URL}/api/v1/orders/payment/success`,
      fail_url: `${process.env.SERVER_URL}/api/v1/orders/payment/fail`,
      cancel_url: `${process.env.SERVER_URL}/api/v1/orders/payment/cancel`,
      ipn_url: `${process.env.SERVER_URL}/api/v1/orders/payment/ipn`,

      shipping_method: "Courier",
      num_of_item: cart.items.length,
      product_name: "Automotive Parts",
      product_category: "Automotive",
      product_profile: "physical-goods",

      // Customer info — all required by SSLCommerz
      cus_name: shippingAddress?.name || req.user.email,
      cus_email: req.user.email,
      cus_add1: shippingAddress?.address || "N/A",
      cus_add2: "N/A",
      cus_city: shippingAddress?.city || "Dhaka",
      cus_state: shippingAddress?.city || "Dhaka",
      cus_postcode: shippingAddress?.postcode || "1200",
      cus_country: "Bangladesh",
      cus_phone: shippingAddress?.phone || "01700000000",
      cus_fax: "01700000000",

      // Shipping info — all required by SSLCommerz, even for physical-goods profile
      ship_name: shippingAddress?.name || req.user.email,
      ship_add1: shippingAddress?.address || "N/A",
      ship_add2: "N/A",
      ship_city: shippingAddress?.city || "Dhaka",
      ship_state: shippingAddress?.city || "Dhaka",
      ship_postcode: shippingAddress?.postcode || "1200",
      ship_country: "Bangladesh",
    };

    const apiResponse = await sslcz.init(sslData); // TEMP DEBUG — remove after fixing

    if (!apiResponse?.GatewayPageURL) {
      await Order.findByIdAndDelete(order._id);
      // Roll back the usage count too, since this order never actually happened
      if (appliedCoupon) {
        await Coupon.updateOne(
          { _id: appliedCoupon._id },
          { $inc: { usedCount: -1 } },
        );
      }
      return res
        .status(502)
        .json({ message: "Failed to initiate payment session" });
    }

    res.json({ gatewayUrl: apiResponse.GatewayPageURL, orderId: order._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/orders/payment/ipn
// SSLCommerz calls this server-to-server after a payment attempt.
// This is the ONLY place that should ever mark an order as paid.
export const handleIPN = async (req, res) => {
  const { tran_id, val_id, status } = req.body;

  try {
    if (status !== "VALID" && status !== "VALIDATED") {
      // Payment wasn't successful on SSLCommerz's side
      await Order.updateOne({ transactionId: tran_id }, { status: "failed" });
      return res.status(200).send(); // always 200 so SSLCommerz doesn't retry endlessly
    }

    // Re-verify with SSLCommerz's Validation API — never trust the callback body alone,
    // since it's technically possible to forge a POST to this endpoint
    const validation = await sslcz.validate({ val_id });

    if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
      await Order.updateOne({ transactionId: tran_id }, { status: "failed" });
      return res.status(200).send();
    }

    const order = await Order.findOne({ transactionId: tran_id });

    if (!order) {
      return res.status(200).send();
    }

    // Idempotency guard: IPN can be sent more than once for the same
    // transaction — never double-decrement stock for an already-paid order
    if (order.status === "paid") {
      return res.status(200).send();
    }

    // Use a Mongoose transaction so the order status update and the stock
    // decrement either both succeed or both roll back — no partial state
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: -item.quantity } },
            { session },
          );
        }

        order.status = "paid";
        order.paymentDetails = {
          bank_tran_id: validation.bank_tran_id,
          card_type: validation.card_type,
          val_id,
        };
        await order.save({ session });

        // Clear the user's cart now that checkout is complete
        await Cart.updateOne({ user: order.user }, { items: [] }, { session });
      });
    } finally {
      await session.endSession();
    }

    // Send confirmation email AFTER the transaction fully commits — this is
    // intentionally outside the transaction and its own try/catch (handled
    // inside sendOrderConfirmationEmail itself) so an email failure can never
    // undo an already-successful, already-paid order.
    const populatedOrder = await Order.findById(order._id).populate(
      "user",
      "email",
    );
    if (populatedOrder?.user?.email) {
      await sendOrderConfirmationEmail(
        populatedOrder,
        populatedOrder.user.email,
      );
    }

    res.status(200).send();
  } catch (error) {
    console.error("IPN handling error:", error.message);
    res.status(200).send(); // still 200 — SSLCommerz just needs acknowledgment
  }
};

// @route POST /api/v1/orders/payment/success
export const paymentSuccess = (req, res) => {
  const { tran_id } = req.body;
  res.redirect(
    `${process.env.CLIENT_URL}/order-confirmation?tran_id=${tran_id}`,
  );
};

// @route POST /api/v1/orders/payment/fail
export const paymentFail = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/checkout?status=failed`);
};

// @route POST /api/v1/orders/payment/cancel
export const paymentCancel = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/checkout?status=cancelled`);
};

// @route GET /api/v1/orders/:transactionId
// Used by the order-confirmation page to poll for the final status
export const getOrderByTransactionId = async (req, res) => {
  try {
    const order = await Order.findOne({
      transactionId: req.params.transactionId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/orders/my/all
// Returns the logged-in user's own order history, most recent first
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/orders/admin/all (admin only)
// Returns every order in the system, with pagination for large datasets
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/orders/admin/:id/status (admin only)
// Lets an admin manually move an order forward (e.g. paid -> shipped -> delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "failed",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
