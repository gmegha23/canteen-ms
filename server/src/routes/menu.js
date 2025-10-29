import { Router } from 'express';
import { requireAuth, adminOnly } from '../middleware/auth.js';
import MenuItem from '../models/MenuItem.js';

const router = Router();

// Public list (keep open so users can see menu later)
router.get('/', async (req, res) => {
  const items = await MenuItem.find().sort({ createdAt: -1 });
  res.json(items);
});

// Admin create
router.post('/', requireAuth, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ message: e.message || 'Invalid data' });
  }
});

// Admin update
router.put('/:id', requireAuth, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: e.message || 'Invalid data' });
  }
});

// Admin delete
router.delete('/:id', requireAuth, adminOnly, async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

// Purchase item - decreases count
router.patch('/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.count <= 0) {
      return res.status(400).json({ message: 'Out of stock' });
    }

    item.count -= 1;
    await item.save();

    res.json({ message: 'Purchase successful', item });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
