import { Request, Response } from 'express';
import {
  NotificationService,
  NotificationPayload,
  CreateNotificationDto,
  NotificationHistoryQuery,
} from '../services/notification.service';
import { catchAsync } from '../utils/catchAsync';
import { v4 as uuidv4 } from 'uuid';
import { NotificationType } from '../entities/Notification';

export class NotificationController {
  private notificationService = NotificationService.getInstance();

  /**
   * SSE endpoint - Client đăng ký nhận thông báo real-time
   * GET /api/v1/notifications/subscribe
   */
  subscribe = (req: Request, res: Response) => {
    // Set headers cho SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Tạo unique ID cho client
    const clientId = (req.query.clientId as string) || uuidv4();

    // Thêm client vào danh sách subscribers
    this.notificationService.addClient(clientId, res);

    // Gửi message xác nhận kết nối
    res.write(
      `data: ${JSON.stringify({
        type: 'connected',
        clientId,
        message: 'Successfully connected to notification stream',
      })}\n\n`
    );

    // Gửi heartbeat mỗi 30 giây để giữ kết nối
    const heartbeatInterval = setInterval(() => {
      res.write(`: heartbeat\n\n`);
    }, 30000);

    // Cleanup khi client ngắt kết nối
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      this.notificationService.removeClient(clientId);
    });
  };

  /**
   * Gửi thông báo đến tất cả clients
   * POST /api/v1/notifications/broadcast
   */
  broadcast = catchAsync(async (req: Request, res: Response) => {
    const { title, message, type = 'info', data } = req.body;
    const senderId = (req as any).user?.id; // Get sender from auth middleware

    const notification: NotificationPayload = {
      title,
      message,
      type,
      data,
    };

    // Save to database
    const savedNotification = await this.notificationService.saveNotification({
      title,
      message,
      type: type as NotificationType,
      senderId,
      metadata: data,
    });

    // Dispatch via SSE
    const sentCount = this.notificationService.broadcast(notification);

    res.status(200).json({
      success: true,
      message: `Notification sent to ${sentCount} clients`,
      data: {
        id: savedNotification.id,
        sentCount,
        notification,
      },
    });
  });

  /**
   * Gửi thông báo đến một client cụ thể
   * POST /api/v1/notifications/send/:clientId
   */
  sendToClient = catchAsync(async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const { title, message, type = 'info', data } = req.body;
    const senderId = (req as any).user?.id;

    const notification: NotificationPayload = {
      title,
      message,
      type,
      data,
    };

    // Save to database (targetUserId = clientId for targeted notifications)
    const savedNotification = await this.notificationService.saveNotification({
      title,
      message,
      type: type as NotificationType,
      targetUserId: clientId,
      senderId,
      metadata: data,
    });

    const sent = this.notificationService.sendToClient(clientId, notification);

    if (sent) {
      res.status(200).json({
        success: true,
        message: `Notification sent to client ${clientId}`,
        data: {
          id: savedNotification.id,
          notification,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Client ${clientId} not found`,
      });
    }
  });

  /**
   * Lấy danh sách clients đang kết nối
   * GET /api/v1/notifications/clients
   */
  getClients = catchAsync(async (req: Request, res: Response) => {
    const clients = this.notificationService.getClientIds();
    const count = this.notificationService.getClientCount();

    res.status(200).json({
      success: true,
      data: {
        count,
        clients,
      },
    });
  });

  /**
   * Lấy lịch sử thông báo
   * GET /api/v1/notifications/history
   */
  getHistory = catchAsync(async (req: Request, res: Response) => {
    const query: NotificationHistoryQuery = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      type: req.query.type as NotificationType | undefined,
      targetUserId: req.query.targetUserId as string | undefined,
    };

    const result = await this.notificationService.getHistory(query);

    // Transform data to match API spec
    const transformedData = result.data.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      sender: notification.sender
        ? { id: notification.sender.id, name: notification.sender.name }
        : null,
      targetUser: notification.targetUser
        ? { id: notification.targetUser.id, name: notification.targetUser.name }
        : null,
      metadata: notification.metadata,
    }));

    res.status(200).json({
      success: true,
      data: transformedData,
      meta: result.meta,
    });
  });
}
