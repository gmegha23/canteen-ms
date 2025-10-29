import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('PendingUser', pendingUserSchema);
