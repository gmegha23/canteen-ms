// server/src/routes/auth.js

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ===========================
// REGISTER (User)
// ===========================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Validate fields
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Restrict to NEC domain
    if (!email.endsWith("@nec.edu.in")) {
      return res.status(400).json({
        message: "Registration restricted to NEC domain emails only (@nec.edu.in)",
      });
    }

    // 3️⃣ Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 4️⃣ Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 5️⃣ Create new user
    const user = await User.create({
      name,
      email,
      passwordHash: hashed,
      role: "user",
    });

    // 6️⃣ Generate JWT
    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 7️⃣ Send response
    res.status(201).json({
      message: "Registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: "user" },
    });
  } catch (err) {
    console.error("REGISTER error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ===========================
// LOGIN (User or Admin)
// ===========================
router.post("/login", async (req, res) => {
  try {
    const { isAdmin, username, email, password } = req.body;

    // Admin login
    if (isAdmin) {
      const adminUser = process.env.ADMIN_USER;
      const adminPass = process.env.ADMIN_PASS;

      if (username !== adminUser || password !== adminPass) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.json({
        message: "Admin login successful",
        token,
        user: { id: "admin", name: "Admin", email: null, role: "admin" },
      });
    }

    // Normal user login
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: "user" },
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ===========================
// CHECK TOKEN (optional debug)
// ===========================
router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token provided" });

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ ok: true, payload });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
