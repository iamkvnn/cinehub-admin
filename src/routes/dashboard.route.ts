import { Router, IRouter } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { auth } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router: IRouter = Router();
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
 *         description: Dashboard statistics including users, films, subscriptions, revenue, views, and new users today
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     totalFilms:
 *                       type: number
 *                     totalSubscriptions:
 *                       type: number
 *                     revenue:
 *                       type: number
 *                       description: Total revenue in VND
 *                     totalViews:
 *                       type: number
 *                     newUsersToday:
 *                       type: number
 */
router.get('/stats', dashboardController.getStats);

/**
 * @swagger
 * /dashboard/revenue-by-month:
 *   get:
 *     summary: Get revenue data by month (last 12 months)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly revenue data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "T1"
 *                       revenue:
 *                         type: number
 *                       users:
 *                         type: number
 */
router.get('/revenue-by-month', dashboardController.getRevenueByMonth);

/**
 * @swagger
 * /dashboard/users-by-week:
 *   get:
 *     summary: Get user data by week (last 6 weeks)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       week:
 *                         type: string
 *                         example: "Tuần 1"
 *                       newUsers:
 *                         type: number
 *                       activeUsers:
 *                         type: number
 */
router.get('/users-by-week', dashboardController.getUsersByWeek);

/**
 * @swagger
 * /dashboard/subscription-distribution:
 *   get:
 *     summary: Get subscription distribution by plan
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription distribution data for pie chart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Premium"
 *                       value:
 *                         type: number
 *                       fill:
 *                         type: string
 *                         example: "#8b5cf6"
 */
router.get('/subscription-distribution', dashboardController.getSubscriptionDistribution);

/**
 * @swagger
 * /dashboard/activity-by-day:
 *   get:
 *     summary: Get activity data by day (last 7 days)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily activity data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         example: "Thứ 2"
 *                       subscriptions:
 *                         type: number
 *                       films:
 *                         type: number
 */
router.get('/activity-by-day', dashboardController.getActivityByDay);

/**
 * @swagger
 * /dashboard/top-countries:
 *   get:
 *     summary: Get top countries by film count
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top countries data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       country:
 *                         type: string
 *                         example: "Vietnam"
 *                       count:
 *                         type: number
 */
router.get('/top-countries', dashboardController.getTopCountries);

export default router;
