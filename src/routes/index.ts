import { Router } from 'express';
import authRoute from './auth.route';
import dashboardRoute from './dashboard.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/dashboard', dashboardRoute);

export default router;
