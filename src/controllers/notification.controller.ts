import { Request, Response } from 'express';
import {
  NotificationService,
  NotificationPayload,
} from '../services/notification.service';
import { catchAsync } from '../utils/catchAsync';
import { v4 as uuidv4 } from 'uuid';

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

    const notification: NotificationPayload = {
      title,
      message,
      type,
      data,
    };

    const sentCount = this.notificationService.broadcast(notification);

    res.status(200).json({
      success: true,
      message: `Notification sent to ${sentCount} clients`,
      data: {
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

    const notification: NotificationPayload = {
      title,
      message,
      type,
      data,
    };

    const sent = this.notificationService.sendToClient(clientId, notification);

    if (sent) {
      res.status(200).json({
        success: true,
        message: `Notification sent to client ${clientId}`,
        data: { notification },
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
}
