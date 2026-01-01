import { Router, IRouter } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router: IRouter = Router();
const notificationController = new NotificationController();

/**
 * @swagger
 * /api/v1/notifications/subscribe:
 *   get:
 *     summary: Subscribe to SSE notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Optional client ID (auto-generated if not provided)
 *     responses:
 *       200:
 *         description: SSE stream established
 */
router.get('/subscribe', notificationController.subscribe);

/**
 * @swagger
 * /api/v1/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to all connected clients
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Update"
 *               message:
 *                 type: string
 *                 example: "A new feature has been released!"
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 default: info
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification broadcasted successfully
 */
router.post('/broadcast', notificationController.broadcast);

/**
 * @swagger
 * /api/v1/notifications/send/{clientId}:
 *   post:
 *     summary: Send notification to a specific client
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       404:
 *         description: Client not found
 */
router.post('/send/:clientId', notificationController.sendToClient);

/**
 * @swagger
 * /api/v1/notifications/clients:
 *   get:
 *     summary: Get list of connected clients
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of connected clients
 */
router.get('/clients', notificationController.getClients);

export default router;
