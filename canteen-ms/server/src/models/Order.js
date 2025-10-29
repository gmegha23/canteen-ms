// server/src/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },

    items: [
      {
        item: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'MenuItem', 
          required: true 
        },
        name: { type: String, required: true },   // snapshot of item name
        qty: { type: Number, required: true, min: 1 }, // quantity ordered
        price: { type: Number, required: true },  // snapshot of price
      },
    ],

    totalAmount: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    orderType: { 
      type: String, 
      enum: ['dine-in', 'takeaway'], 
      default: 'dine-in' 
    },

    tableNo: { 
      type: String, 
      default: '' 
    }, // used only for dine-in

    notes: { 
      type: String, 
      default: '' 
    }, // special instructions

    // 🔹 Payment-specific fields
    paymentMethod: {
      type: String,
      enum: ['upi', 'cod'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'awaiting_confirmation', 'paid', 'failed'],
      default: 'unpaid',
    },
    paidAt: { type: Date, default: null },
    paymentNotifiedAt: { type: Date, default: null },

    // 🔹 Order status
    status: {
      type: String,
      enum: ['placed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'placed',
    },
  },
  { 
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model('Order', orderSchema);
