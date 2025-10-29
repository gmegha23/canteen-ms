import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import routes
import routes from "./routes/index.js";         // General routes
import authRoutes from "./routes/auth.js";      // Auth routes
import feedbackRoutes from "./routes/feedback.js"; // Feedback routes

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
  origin: "http://localhost:5173", // Vite frontend port
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

/* -------------------- TEST ROUTE -------------------- */
app.get("/", (req, res) => res.send("🚀 API is running..."));

/* -------------------- ROUTES -------------------- */
app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

/* -------------------- DATABASE CONNECTION -------------------- */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/canteen";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
