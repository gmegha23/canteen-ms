import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ✅ Make passwordHash optional — because it will be set after OTP verification
    passwordHash: { type: String, required: false, default: null },

    role: { type: String, default: "user" },
    verified: { type: Boolean, default: false },

    // ✅ OTP fields (used during registration)
    otp: { type: Number, default: null },
    otpExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
