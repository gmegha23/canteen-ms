import express from "express";
import Feedback from "../models/Feedback.js";
import { requireAuth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

/* ===============================
   USER: Submit Feedback
   =============================== */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Feedback is required" });

    const feedback = await Feedback.create({
      user: req.user.id,
      message,
    });

    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
});

/* ===============================
   ADMIN: View All Feedback
   =============================== */
router.get("/", requireAuth, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    console.error("Fetch feedback error:", err);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

export default router;
