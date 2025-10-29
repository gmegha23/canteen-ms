import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

const router = express.Router();

/* -------------------- SEND OTP -------------------- */
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // ✅ Check if user exists
    let user = await User.findOne({ email });

    if (user && user.verified) {
      return res.status(400).json({ message: "User already registered" });
    }

    // ✅ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Generate OTP and expiry (10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (!user) {
      // Create new unverified user
      user = new User({
        name,
        email,
        passwordHash,
        otp,
        otpExpiresAt,
        verified: false,
      });
    } else {
      // Update existing unverified user
      user.passwordHash = passwordHash;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
    }

    await user.save();

    // ✅ Send OTP using the utility function
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

/* -------------------- VERIFY OTP -------------------- */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verified)
      return res.status(400).json({ message: "User already verified" });

    if (String(user.otp) !== String(otp))
      return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > user.otpExpiresAt)
      return res.status(400).json({ message: "OTP expired" });

    // ✅ Verify user
    user.verified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

/* -------------------- LOGIN -------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password, isAdmin, username } = req.body;

    if (isAdmin) {
      // Admin login
      if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        const token = jwt.sign(
          { id: "admin", role: "admin" },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
        return res.json({
          message: "Admin login successful",
          token,
          user: { id: "admin", name: "Admin", email: username, role: "admin" },
        });
      } else {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
    } else {
      // User login
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.verified) return res.status(400).json({ message: "Please verify your email first" });

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(400).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

export default router;
