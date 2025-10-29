import { Router } from 'express';
import menuRoutes from './menu.js';
import authRoutes from './auth.js';
import orderRoutes from './orders.js';
import userRoutes from './users.js';
import adminRoutes from './admin.js';

const router = Router();

router.use('/menu', menuRoutes);
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
