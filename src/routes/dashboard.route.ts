import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { auth } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const dashboardController = new DashboardController();

router.get('/stats', auth([UserRole.ADMIN]), dashboardController.getStats);

export default router;
