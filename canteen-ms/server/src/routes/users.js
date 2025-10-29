import { Router } from 'express';
import { requireAuth, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.get('/', requireAuth, adminOnly, async (req, res) => {
  const users = await User.find().select('_id name email createdAt').sort({ createdAt: -1 });
  res.json(users);
});

export default router;
