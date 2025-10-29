import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' }, // optional description
    price: { type: Number, required: true, min: 0 }, // cannot be negative
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'General'], // controlled categories
      required: true,
      default: 'General',
    },
    count: { type: Number, default: 0 }, // stock quantity
    isAvailable: { type: Boolean, default: true }, // toggle availability
    imageUrl: { type: String, default: '' }, // optional image link
  },
  { timestamps: true } // adds createdAt and updatedAt
);

export default mongoose.model('MenuItem', menuItemSchema);
