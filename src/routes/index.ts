import { Router } from 'express';
import authRoute from './auth.route';
import dashboardRoute from './dashboard.route';
import notificationRoute from './notification.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/dashboard', dashboardRoute);
router.use('/notifications', notificationRoute);

export default router;
