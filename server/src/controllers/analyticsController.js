import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const PAID_STATUSES = ["paid", "shipped", "delivered"];

// --- Internal data-fetchers (no res.json here) — reused by both the
// individual routes (kept for any other consumer) and the combined
// dashboard-bundle route below, so the aggregation logic lives in one place ---

const getSummaryData = async () => {
  const [revenueResult, orderCount, userCount, productCount, pendingReturns] =
    await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: PAID_STATUSES } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ status: { $in: PAID_STATUSES } }),
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ "returnRequest.status": "pending" }),
    ]);

  return {
    totalRevenue: revenueResult[0]?.total || 0,
    totalOrders: orderCount,
    totalUsers: userCount,
    totalProducts: productCount,
    pendingReturns,
  };
};

const getRevenueTrendData = async (days = 30) => {
  const cappedDays = Math.min(Number(days) || 30, 90);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - cappedDays);
  startDate.setHours(0, 0, 0, 0);

  const trend = await Order.aggregate([
    {
      $match: {
        status: { $in: PAID_STATUSES },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const filledTrend = [];
  for (let i = 0; i < cappedDays; i++) {
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

  return filledTrend;
};

const getTopProductsData = async (limit = 10) => {
  const cappedLimit = Math.min(Number(limit) || 10, 20);

  return Order.aggregate([
    { $match: { status: { $in: PAID_STATUSES } } },
    { $unwind: "$items" },
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
    { $limit: cappedLimit },
  ]);
};

const getOrderStatusBreakdownData = async () => {
  const breakdown = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return breakdown.map((b) => ({ status: b._id, count: b.count }));
};

const getLowStockProductsData = async (threshold = 5) => {
  return Product.find({ stock: { $lte: Number(threshold) || 5 } })
    .select("title stock category")
    .sort({ stock: 1 })
    .limit(20);
};

// --- Public route handlers (kept individually for any other consumer / future flexibility) ---

export const getSummary = async (req, res) => {
  try {
    res.json(await getSummaryData());
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRevenueTrend = async (req, res) => {
  try {
    res.json({ trend: await getRevenueTrendData(req.query.days) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    res.json({ topProducts: await getTopProductsData(req.query.limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOrderStatusBreakdown = async (req, res) => {
  try {
    res.json({ breakdown: await getOrderStatusBreakdownData() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    res.json({ products: await getLowStockProductsData(req.query.threshold) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/analytics/dashboard (permission: dashboard:watch)
// NEW — combines every widget's data into ONE response, so the frontend
// fires a single request instead of 5 separate ones (each with its own
// loading state and separate React re-render when it lands).
export const getDashboardBundle = async (req, res) => {
  try {
    const result = await getOrSetCache("categories:all", 300, async () => {
      const [
        summary,
        revenueTrend,
        topProducts,
        orderStatusBreakdown,
        lowStockProducts,
      ] = await Promise.all([
        getSummaryData(),
        getRevenueTrendData(30),
        getTopProductsData(10),
        getOrderStatusBreakdownData(),
        getLowStockProductsData(5),
      ]);
    });

    res.json({
      summary,
      revenueTrend,
      topProducts,
      orderStatusBreakdown,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
