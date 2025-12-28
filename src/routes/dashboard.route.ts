import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { auth } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (Admin only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', auth([UserRole.ADMIN]), dashboardController.getStats);

export default router;
