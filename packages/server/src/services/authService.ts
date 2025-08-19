import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { UserRole } from '@prisma/client';
import { JwtPayload } from '@/config/passport';

export interface LoginResult {
  user: {
    id: number;
    phone: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export interface CreateUserData {
  phone: string;
  role?: UserRole;
}

export class AuthService {
  /**
   * Find or create user by phone number
   * This is used for SMS-based authentication where users are created automatically
   */
  static async findOrCreateUserByPhone(phone: string, role: UserRole = UserRole.CLIENT): Promise<LoginResult> {
    try {
      // Normalize phone number (remove spaces, dashes, etc.)
      const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

      // Find existing user
      let user = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: {
          id: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create user if not exists
      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: normalizedPhone,
            role,
          },
          select: {
            id: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user,
        token,
      };
    } catch (error) {
      throw new Error(`Failed to find or create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find user by phone number
   */
  static async findUserByPhone(phone: string) {
    try {
      const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

      return await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: {
          id: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find user by ID
   */
  static async findUserById(id: number) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate JWT token for user
   */
  static generateToken(user: { id: number; phone: string; role: UserRole }): string {
    const payload: JwtPayload = {
      id: user.id,
      phone: user.phone,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
      algorithm: 'HS256',
    } as jwt.SignOptions);
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as JwtPayload;
    } catch (error) {
      throw new Error(`Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(currentToken: string): Promise<string> {
    try {
      const decoded = this.verifyToken(currentToken);
      const user = await this.findUserById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateToken(user);
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId: number, newRole: UserRole) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: {
          id: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate phone number format (Iranian phone numbers)
   */
  static validatePhoneNumber(phone: string): boolean {
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Iranian mobile phone number pattern
    // Supports formats: 09xxxxxxxxx, +989xxxxxxxxx, 0989xxxxxxxxx
    const iranianMobilePattern = /^(\+98|0098|0)?9\d{9}$/;

    return iranianMobilePattern.test(normalizedPhone);
  }

  /**
   * Normalize Iranian phone number to standard format
   */
  static normalizeIranianPhone(phone: string): string {
    let normalized = phone.replace(/[\s\-\(\)]/g, '');

    // Remove country code if present
    if (normalized.startsWith('+98')) {
      normalized = '0' + normalized.substring(3);
    } else if (normalized.startsWith('0098')) {
      normalized = '0' + normalized.substring(4);
    } else if (normalized.startsWith('98') && normalized.length === 12) {
      normalized = '0' + normalized.substring(2);
    }

    // Ensure it starts with 0
    if (!normalized.startsWith('0')) {
      normalized = '0' + normalized;
    }

    return normalized;
  }
}
