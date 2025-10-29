
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware: Verify token and attach user/admin to request
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If token has role=admin → treat as admin (no DB lookup needed)
    if (decoded.role === "admin") {
      req.user = { id: decoded.id || "admin", role: "admin", name: "Admin" };
      return next();
    }

    // Otherwise fetch user from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req.user = {
      id: user._id,
      role: user.role || "user",
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * Middleware: Restrict admin-only routes
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

