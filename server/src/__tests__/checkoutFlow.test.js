import { jest } from "@jest/globals";

// Mock SSLCommerz BEFORE importing anything that uses it — jest.unstable_mockModule
// must run before the real module is ever imported anywhere in the import graph,
// which is why this whole file uses dynamic imports below instead of top-level ones.
jest.unstable_mockModule("../config/sslcommerz.js", () => ({
  sslcz: {
    init: jest.fn().mockResolvedValue({
      status: "SUCCESS",
      GatewayPageURL: "https://sandbox.sslcommerz.com/mock-gateway-url",
    }),
    validate: jest.fn().mockResolvedValue({
      status: "VALID",
      bank_tran_id: "MOCK_BANK_TXN_123",
      card_type: "VISA",
    }),
  },
}));

// Mock the email transporter so tests never actually attempt an SMTP
// connection — mailer.js's transporter.verify() would otherwise hang or
// fail in CI where no real SMTP credentials are configured
jest.unstable_mockModule("../config/mailer.js", () => ({
  transporter: {
    sendMail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
    verify: jest.fn((cb) => cb?.(null)),
  },
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");
const { default: User } = await import("../models/User.js");
const { default: Product } = await import("../models/Product.js");
const { default: Order } = await import("../models/Order.js");
const { default: Cart } = await import("../models/Cart.js");
const { default: Role } = await import("../models/Role.js");
const { default: Permission } = await import("../models/Permission.js");

describe("Checkout -> IPN -> Order Confirmation (full integration flow)", () => {
  let userToken;
  let userId;
  let productId;

  beforeEach(async () => {
    const registerRes = await request(app).post("/api/v1/auth/register").send({
      name: "Test Buyer",
      email: "buyer@gmail.com",
      password: "Zx9#mK2vQ!",
    });

    userId = registerRes.body.user.id;
    await User.findByIdAndUpdate(userId, { isEmailVerified: true });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "buyer@gmail.com",
      password: "Zx9#mK2vQ!",
    });
    userToken = loginRes.body.accessToken;

    const product = await Product.create({
      title: "Test Widget",
      description: "A widget for testing",
      sku: "TEST-WIDGET-001",
      category: "Test Category",
      price: 100,
      stock: 10,
      hasVariants: false,
    });
    productId = product._id;

    await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId: productId.toString(), quantity: 2 });
  });

  it("creates a pending order and returns a gateway URL on checkout", async () => {
    const res = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        shippingAddress: {
          name: "Test Buyer",
          phone: "01700000000",
          address: "Test St",
          city: "Dhaka",
          postcode: "1216",
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.gatewayUrl).toBe(
      "https://sandbox.sslcommerz.com/mock-gateway-url",
    );

    const order = await Order.findById(res.body.orderId);
    expect(order.status).toBe("pending");
    expect(order.totalAmount).toBe(200); // 2 x 100
  });

  it("marks the order paid, decrements stock, and clears the cart when IPN confirms payment", async () => {
    const checkoutRes = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        shippingAddress: {
          name: "Test Buyer",
          phone: "01700000000",
          address: "Test St",
          city: "Dhaka",
          postcode: "1216",
        },
      });

    const order = await Order.findById(checkoutRes.body.orderId);

    // Simulate SSLCommerz calling our IPN webhook after a successful payment
    const ipnRes = await request(app).post("/api/v1/orders/payment/ipn").send({
      tran_id: order.transactionId,
      val_id: "MOCK_VAL_ID",
      status: "VALID",
    });

    expect(ipnRes.status).toBe(200);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status).toBe("paid");

    const product = await Product.findById(productId);
    expect(product.stock).toBe(8); // 10 - 2

    const cart = await Cart.findOne({ user: userId });
    expect(cart.items).toHaveLength(0);
  });

  it("does not double-decrement stock if the IPN is received twice (idempotency)", async () => {
    const checkoutRes = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        shippingAddress: {
          name: "Test Buyer",
          phone: "01700000000",
          address: "Test St",
          city: "Dhaka",
          postcode: "1216",
        },
      });

    const order = await Order.findById(checkoutRes.body.orderId);
    const ipnPayload = {
      tran_id: order.transactionId,
      val_id: "MOCK_VAL_ID",
      status: "VALID",
    };

    await request(app).post("/api/v1/orders/payment/ipn").send(ipnPayload);
    await request(app).post("/api/v1/orders/payment/ipn").send(ipnPayload); // duplicate delivery — SSLCommerz can and does retry

    const product = await Product.findById(productId);
    expect(product.stock).toBe(8); // still 8, NOT 6 — proves the "already paid" guard in handleIPN worked
  });

  it("rejects checkout with insufficient stock", async () => {
    await Product.findByIdAndUpdate(productId, { stock: 1 }); // less than the 2 already in the cart

    const res = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        shippingAddress: {
          name: "Test Buyer",
          phone: "01700000000",
          address: "Test St",
          city: "Dhaka",
          postcode: "1216",
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/out of stock/i);
  });
});
