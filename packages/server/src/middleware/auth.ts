import { Request, Response, NextFunction } from 'express';
import passport from '@/config/passport';
import { AuthenticatedUser } from '@/config/passport';
import { UserRole, UserRoleType } from '@/constants/userRoles';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

/**
 * JWT Authentication middleware
 * Protects routes by verifying JWT token
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: AuthenticatedUser | false, info: any) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: err.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: info?.message || 'Invalid or missing token',
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Role-based authorization middleware
 * Checks if authenticated user has required role
 */
export const requireRole = (roles: UserRoleType | UserRoleType[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Manager or Admin middleware
 */
export const requireManager = requireRole([UserRole.MANAGER, UserRole.ADMIN]);

/**
 * Employee, Manager or Admin middleware
 */
export const requireEmployee = requireRole([UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN]);

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require authentication
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  passport.authenticate('jwt', { session: false }, (err: any, user: AuthenticatedUser | false) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

/**
 * Check if user can access their own resources or is admin/manager
 */
export const requireOwnershipOrElevated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const userId = parseInt(req.params.userId || req.params.id);
  const isOwner = req.user.id === userId;
  const isElevated = (req.user.role === UserRole.ADMIN || req.user.role === UserRole.MANAGER);

  if (!isOwner && !isElevated) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
    });
  }

  next();
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This could be implemented with express-rate-limit or similar
  // For now, just pass through
  next();
};
