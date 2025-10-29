import nodemailer from "nodemailer";

export const sendOrderEmail = async (email, order) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,        // Gmail address from .env
        pass: process.env.GMAIL_APP_PASSWORD, // App Password from .env
      },
    });

    const itemsList = order.items.map(item => `${item.name} x${item.qty} - ₹${item.price * item.qty}`).join('\n');

    const mailOptions = {
      from: `"NEC Canteen" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Order Confirmation - NEC Canteen",
      text: `Dear Customer,

Your order has been placed successfully!

Order ID: ${order._id}
Order Type: ${order.orderType}
Payment Method: ${order.paymentMethod}
Total Amount: ₹${order.totalAmount}

Items Ordered:
${itemsList}

${order.notes ? `Notes: ${order.notes}` : ''}

Thank you for ordering from NEC Canteen!

Best regards,
NEC Canteen Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent successfully to ${email}`);
  } catch (err) {
    console.error("❌ Error sending order email:", err);
    throw new Error("Failed to send order confirmation email");
  }
};
