import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'role', 'password', 'isVerified'],
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if user is admin
    if (user.role !== UserRole.ADMIN) {
      throw new ApiError(403, 'Access denied. Admin only.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to database
    await this.userRepository.update(user.id, { refreshToken });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwt.accessSecret,
      { expiresIn: env.jwt.accessExpiration } as jwt.SignOptions
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign({ id: user.id }, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiration,
    } as jwt.SignOptions);
  }
}
