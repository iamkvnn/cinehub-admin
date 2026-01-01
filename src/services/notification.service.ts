import { Response } from 'express';

export interface NotificationPayload {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  data?: any;
}

interface SSEClient {
  id: string;
  res: Response;
}

export class NotificationService {
  private static instance: NotificationService;
  private clients: Map<string, SSEClient> = new Map();

  private constructor() {}

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
}
