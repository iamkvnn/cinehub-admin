import { Router, IRouter } from 'express';
import authRoute from './auth.route';
import dashboardRoute from './dashboard.route';
// Notification module migrated to NestJS backend (port 8000)
// import notificationRoute from './notification.route';

const router: IRouter = Router();

router.use('/auth', authRoute);
router.use('/dashboard', dashboardRoute);
// router.use('/notifications', notificationRoute);

export default router;
