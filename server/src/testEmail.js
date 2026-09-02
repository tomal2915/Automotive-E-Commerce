import "dotenv/config";
import { sendOrderConfirmationEmail } from "./services/emailService.js";

const dummyOrder = {
  transactionId: "TEST-TXN-123",
  createdAt: new Date(),
  totalAmount: 89.99,
  items: [{ title: "Ceramic Brake Pad Set", quantity: 1, price: 89.99 }],
};

await sendOrderConfirmationEmail(dummyOrder, "tomal2915@gmail.com");
console.log("Done");
process.exit(0);