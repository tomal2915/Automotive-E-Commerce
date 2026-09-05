import { transporter } from "../config/mailer.js";
import { logger } from "../config/logger.js"; // adjust relative path

// Builds the HTML body for an order confirmation email.
// Kept as plain string templating (no external template engine) to keep
// this dependency-light — fine for a handful of transactional emails.
const buildOrderConfirmationHtml = (order) => {
  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">৳${item.price.toFixed(2)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #38bdf8; margin: 0;">AutoParts BD</h1>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        <h2 style="color: #0f172a;">Order Confirmed!</h2>
        <p style="color: #475569;">
          Thank you for your order. We've received your payment and your order is being processed.
        </p>
        <p style="color: #475569;">
          <strong>Order ID:</strong> ${order.transactionId}<br/>
          <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <p style="text-align: right; font-size: 18px; color: #0f172a;">
          <strong>Total: ৳${order.totalAmount.toFixed(2)}</strong>
        </p>

        <p style="color: #475569; margin-top: 24px;">
          We'll notify you again once your order ships. Thanks for shopping with us!
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        AutoParts BD &middot; Mirpur, Dhaka, Bangladesh
      </div>
    </div>
  `;
};

// Sends an order confirmation email. Never throws — a failed email should
// never roll back or block the order itself, since the payment has already
// been captured and the order is already valid regardless of email delivery.
export const sendOrderConfirmationEmail = async (order, userEmail) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Order Confirmed — ${order.transactionId}`,
      html: buildOrderConfirmationHtml(order),
    });
    logger.info(`Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    // Log it for debugging/monitoring, but swallow the error — see comment above
    logger.error("Failed to send order confirmation email:", error.message);
  }
};

export const sendOrderStatusEmail = async (order, userEmail, statusMessage) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Order Update — ${order.transactionId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Order Update</h2>
          <p>${statusMessage}</p>
          <p style="color: #64748b;">Order ID: ${order.transactionId}</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error("Failed to send order status email:", error.message);
  }
};
