import { Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Notification, NotificationType } from '../entities/Notification';

export interface NotificationPayload {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  data?: any;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: NotificationType;
  targetUserId?: string;
  senderId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationHistoryQuery {
  page?: number;
  limit?: number;
  type?: NotificationType;
  targetUserId?: string;
}

interface SSEClient {
  id: string;
  res: Response;
}

export class NotificationService {
  private static instance: NotificationService;
  private clients: Map<string, SSEClient> = new Map();
  private notificationRepository: Repository<Notification>;

  private constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Thêm client mới vào danh sách subscribers
   */
  public addClient(clientId: string, res: Response): void {
    this.clients.set(clientId, { id: clientId, res });
    console.log(
      `Client connected: ${clientId}. Total clients: ${this.clients.size}`
    );
  }

  /**
   * Xóa client khỏi danh sách subscribers
   */
  public removeClient(clientId: string): void {
    this.clients.delete(clientId);
    console.log(
      `Client disconnected: ${clientId}. Total clients: ${this.clients.size}`
    );
  }

  /**
   * Gửi thông báo đến một client cụ thể
   */
  public sendToClient(
    clientId: string,
    notification: NotificationPayload
  ): boolean {
    const client = this.clients.get(clientId);
    if (client) {
      const data = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...notification,
      };
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
      return true;
    }
    return false;
  }

  /**
   * Gửi thông báo đến tất cả clients (broadcast)
   */
  public broadcast(notification: NotificationPayload): number {
    const data = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...notification,
    };
    const message = `data: ${JSON.stringify(data)}\n\n`;

    let sentCount = 0;
    this.clients.forEach((client) => {
      try {
        client.res.write(message);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to client ${client.id}:`, error);
        this.removeClient(client.id);
      }
    });

    console.log(`Broadcast notification to ${sentCount} clients`);
    return sentCount;
  }

  /**
   * Lấy số lượng clients đang kết nối
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Lấy danh sách client IDs
   */
  public getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Lưu thông báo vào database
   */
  public async saveNotification(
    dto: CreateNotificationDto
  ): Promise<Notification> {
    const notification = new Notification();
    notification.title = dto.title;
    notification.message = dto.message;
    notification.type = dto.type || NotificationType.INFO;
    notification.targetUserId = dto.targetUserId || null;
    notification.senderId = dto.senderId || null;
    notification.metadata = dto.metadata || null;

    return await this.notificationRepository.save(notification);
  }

  /**
   * Lấy lịch sử thông báo với phân trang
   */
  public async getHistory(query: NotificationHistoryQuery): Promise<{
    data: Notification[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.sender', 'sender')
      .leftJoinAndSelect('notification.targetUser', 'targetUser')
      .orderBy('notification.createdAt', 'DESC');

    if (query.type) {
      queryBuilder.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.targetUserId) {
      queryBuilder.andWhere('notification.targetUserId = :targetUserId', {
        targetUserId: query.targetUserId,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
      },
    };
  }
}
