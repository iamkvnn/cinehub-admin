import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';

export class SocketService {
  private static instance: SocketService;
  private io: Server;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.cors.origin,
        methods: ['GET', 'POST'],
      },
    });

    const adminNamespace = this.io.of('/admin');

    adminNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const payload = jwt.verify(token, env.jwt.accessSecret) as any;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: payload.sub } });

        if (!user || user.role !== UserRole.ADMIN) {
          return next(new Error('Authentication error'));
        }

        socket.data.user = user;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    adminNamespace.on('connection', (socket: Socket) => {
      console.log('Admin connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Admin disconnected:', socket.id);
      });
    });
  }

  public emitToAdmin(event: string, data: any) {
    if (this.io) {
      this.io.of('/admin').emit(event, data);
    }
  }
}
