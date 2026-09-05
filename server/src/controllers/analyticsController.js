import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// @route GET /api/v1/analytics/summary (admin only)
// High-level numbers for the top of the dashboard
export const getSummary = async (req, res) => {
  try {
    const paidStatuses = ["paid", "shipped", "delivered"];

    const [revenueResult, orderCount, userCount, productCount, pendingReturns] =
      await Promise.all([
        Order.aggregate([
          { $match: { status: { $in: paidStatuses } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.countDocuments({ status: { $in: paidStatuses } }),
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments({ "returnRequest.status": "pending" }),
      ]);

    res.json({
      totalRevenue: revenueResult[0]?.total || 0,
      totalOrders: orderCount,
      totalUsers: userCount,
      totalProducts: productCount,
      pendingReturns,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/analytics/revenue-trend?days=30 (admin only)
// Daily revenue totals for a line chart — defaults to the last 30 days
export const getRevenueTrend = async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 90); // cap at 90 days to keep the query light
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const paidStatuses = ["paid", "shipped", "delivered"];

    const trend = await Order.aggregate([
      {
        $match: {
          status: { $in: paidStatuses },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          // Groups by calendar day — $dateToString truncates the timestamp
          // down to just the date portion so all orders on the same day merge
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in zero-revenue days so the chart doesn't show gaps for
    // days with no orders — a flat line at 0 is more honest than a
    // skipped data point that might look like a rendering bug
    const filledTrend = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const existing = trend.find((t) => t._id === dateStr);
      filledTrend.push({
        date: dateStr,
        revenue: existing?.revenue || 0,
        orders: existing?.orders || 0,
      });
    }

    res.json({ trend: filledTrend });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/analytics/top-products?limit=10 (admin only)
// Best-selling products by total quantity sold, computed from order line items
export const getTopProducts = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 20);
    const paidStatuses = ["paid", "shipped", "delivered"];

    const topProducts = await Order.aggregate([
      { $match: { status: { $in: paidStatuses } } },
      { $unwind: "$items" }, // flattens each order's items array into separate documents
      {
        $group: {
          _id: "$items.product",
          title: { $first: "$items.title" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
    ]);

    res.json({ topProducts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/analytics/order-status-breakdown (admin only)
// Count of orders per status — for a pie/bar chart showing pipeline health
export const getOrderStatusBreakdown = async (req, res) => {
  try {
    const breakdown = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      breakdown: breakdown.map((b) => ({ status: b._id, count: b.count })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/analytics/low-stock?threshold=5 (admin only)
// Products running low — useful for restocking decisions
export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;

    const products = await Product.find({ stock: { $lte: threshold } })
      .select("title stock category")
      .sort({ stock: 1 })
      .limit(20);

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
