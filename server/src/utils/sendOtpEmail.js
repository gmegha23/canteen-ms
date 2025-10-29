// server/src/utils/sendOtpEmail.js
import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,        // Gmail address from .env
        pass: process.env.GMAIL_APP_PASSWORD, // App Password from .env
      },
    });

    const mailOptions = {
      from: `"NEC Canteen" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    throw new Error("Failed to send OTP email");
  }
};
