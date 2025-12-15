import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';

export interface AuthRequest extends Request {
  user?: User;
}

export const auth = (roles: UserRole[] = []) => async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Please authenticate');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.jwt.accessSecret) as any;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: payload.sub } });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (roles.length && !roles.includes(user.role)) {
      throw new ApiError(403, 'Forbidden');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Please authenticate'));
  }
};
