import express from "express";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";
import { requireAuth, adminOnly } from "../middleware/auth.js";
import { sendOrderEmail } from "../utils/sendOrderEmail.js";

const router = express.Router();

/* ===============================
   ADMIN: Return list of orders for dashboard
   GET /api/orders/list
   =============================== */
router.get("/list", requireAuth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("items.item", "name price")
      .sort({ createdAt: -1 });

    const normalized = orders.map((o) => ({
      id: o._id,
      _id: o._id,
      userName: o.user?.name || "Guest",
      userEmail: o.user?.email || "",
      items: (o.items || []).map((it) => ({
        name: it.name || it.item?.name || "Unknown",
        qty: it.qty ?? it.quantity ?? 0,
        price: it.price ?? it.item?.price ?? 0,
      })),
      totalAmount: o.totalAmount ?? 0,
      createdAt: o.createdAt,
      status: o.status,
      orderType: o.orderType,
      notes: o.notes || "",
      paymentMethod: o.paymentMethod || "cod",
      paymentStatus: o.paymentStatus || "unpaid",
    }));

    res.json(normalized);
  } catch (err) {
    console.error("Admin list error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ===============================
   ADMIN: Orders stats (for chart)
   GET /api/orders/stats?days=7
   =============================== */
router.get("/stats", requireAuth, adminOnly, async (req, res) => {
  try {
    const days = parseInt(req.query.days || "0", 10);
    const match = {};
    if (!isNaN(days) && days > 0) {
      const start = new Date();
      start.setDate(start.getDate() - days + 1);
      match.createdAt = { $gte: start };
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const stats = await Order.aggregate(pipeline);
    res.json(stats.map((s) => ({ date: s._id, orders: s.orders })));
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ===============================
   USER: Place an Order
   =============================== */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { items, orderType, paymentMethod = "cod", notes = "" } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const it of items) {
      const menuItem = await MenuItem.findById(it.itemId);
      if (!menuItem) {
        return res
          .status(400)
          .json({ message: `Menu item not found: ${it.itemId}` });
      }
      if ((menuItem.count ?? 0) < (it.qty ?? 0)) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${menuItem.name}` });
      }
    }

    let totalAmount = items.reduce(
      (sum, i) => sum + (i.price || 0) * (i.qty || 0),
      0
    );
    if (orderType === "takeaway") totalAmount += 10;

    const order = await Order.create({
      user: req.user.id,
      items: items.map((i) => ({
        item: i.itemId,
        name: i.name,
        qty: i.qty,
        price: i.price,
      })),
      totalAmount,
      orderType: orderType || "dine-in",
      notes,
      paymentMethod,
      paymentStatus: "unpaid",
      status: "placed",
    });

    for (const it of items) {
      await MenuItem.findByIdAndUpdate(
        it.itemId,
        { $inc: { count: -it.qty } },
        { new: true }
      );
    }

    // Send order confirmation email
    try {
      const user = await User.findById(req.user.id);
      if (user && user.email) {
        await sendOrderEmail(user.email, order);
      }
    } catch (emailErr) {
      console.error("Failed to send order email:", emailErr);
      // Don't fail the order if email fails
    }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Server error placing order" });
  }
});

/* ===============================
   ✅ USER: Get all orders of logged-in user
   GET /api/orders/user
   =============================== */
router.get("/user", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("user", "name email")
      .populate("items.item", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ===============================
   ADMIN: List Orders (active/completed/all)
   =============================== */
router.get("/", requireAuth, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    let match = {};
    if (status === "active") {
      match.status = { $in: ["placed", "preparing", "ready"] };
    } else if (status === "completed") {
      match.status = { $in: ["completed", "cancelled"] };
    } else if (status === "all") {
      // No filter, show all orders
    } else {
      // Default to active if no valid status provided
      match.status = { $in: ["placed", "preparing", "ready"] };
    }
    const orders = await Order.find(match)
      .populate("user", "name email")
      .populate("items.item", "name price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ===============================
   GET single order (user or admin)
   =============================== */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.item", "name price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Failed to get order" });
  }
});

/* ===============================
   USER: Notify payment (UPI)
   =============================== */
router.post("/:id/notify-payment", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== "admin" &&
      order.user.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (order.paymentMethod !== "upi") {
      return res.status(400).json({ message: "Order is not UPI" });
    }

    order.paymentStatus = "awaiting_confirmation";
    order.paymentNotifiedAt = new Date();
    await order.save();

    res.json({ message: "Payment notification sent", order });
  } catch (err) {
    console.error("Notify payment error:", err);
    res.status(500).json({ message: "Failed to notify payment" });
  }
});

/* ===============================
   ADMIN: Confirm/Reject payment
   =============================== */
router.patch("/:id/payment", requireAuth, adminOnly, async (req, res) => {
  try {
    const { action } = req.body;
    if (!["confirm", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (action === "confirm") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
      if (order.status === "placed") order.status = "preparing";
    } else {
      order.paymentStatus = "failed";
    }

    await order.save();
    res.json({ message: `Payment ${action}ed`, order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payment" });
  }
});

/* ===============================
   ADMIN: Update Order Status
   =============================== */
router.patch("/:id/status", requireAuth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["placed", "preparing", "ready", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default router;
