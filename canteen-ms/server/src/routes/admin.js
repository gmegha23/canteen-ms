import { Router } from 'express';
import { requireAuth, adminOnly } from '../middleware/auth.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';

const router = Router();

// GET /api/admin/overview
router.get('/overview', requireAuth, adminOnly, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date();   end.setHours(23,59,59,999);

    const todayCompleted = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).select('totalAmount');

    const todaysSales = todayCompleted.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const activeOrders = await Order.countDocuments({
      status: { $in: ['placed', 'preparing', 'ready'] }
    });

    const totals = await Promise.all([
      User.countDocuments(),
      MenuItem.countDocuments(),
      Order.countDocuments()
    ]);

    res.json({
      todaysSales,
      activeOrders,
      totals: { users: totals[0], menuItems: totals[1], orders: totals[2] }
    });
  } catch (e) {
    console.error('ADMIN overview error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
