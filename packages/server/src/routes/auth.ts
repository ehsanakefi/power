import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { AuthService } from '@/services/authService';
import { authenticateJWT, optionalAuth } from '@/middleware/auth';
import { env } from '@/config/env';

const router = Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login validation rules
const loginValidation = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('fa-IR')
    .withMessage('Invalid Iranian phone number format')
    .customSanitizer((value: string) => AuthService.normalizeIranianPhone(value)),
];

/**
 * POST /api/auth/login
 * Login with phone number (SMS-based authentication)
 * Creates user if doesn't exist
 */
router.post('/login', authRateLimit, loginValidation, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { phone } = req.body;

    // Validate phone number format
    if (!AuthService.validatePhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
    }

    // Find or create user and generate token
    const result = await AuthService.findOrCreateUserByPhone(phone);

    // In a real application, you would:
    // 1. Generate a verification code
    // 2. Send SMS with the code
    // 3. Store the code temporarily (Redis/memory/database)
    // 4. Return success without token
    // 5. Have a separate verify endpoint to check the code and return token

    // For now, we'll return the token directly (development only)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.user.id,
          phone: result.user.phone,
          role: result.user.role,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
        token: result.token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify SMS code (placeholder for future implementation)
 */
router.post('/verify', authRateLimit, [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('code').isLength({ min: 4, max: 6 }).withMessage('Verification code must be 4-6 digits'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { phone, code } = req.body;

    // TODO: Implement SMS verification logic
    // 1. Check if code exists and is valid
    // 2. Check if code hasn't expired
    // 3. Verify the code matches
    // 4. Create/update user
    // 5. Generate and return JWT token

    // For now, accept any 4-digit code for development
    if (code === '1234' || process.env.NODE_ENV === 'development') {
      const result = await AuthService.findOrCreateUserByPhone(phone);

      return res.status(200).json({
        success: true,
        message: 'Verification successful',
        data: {
          user: {
            id: result.user.id,
            phone: result.user.phone,
            role: result.user.role,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
          token: result.token,
        },
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid verification code',
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile (protected route)
 */
router.get('/profile', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get fresh user data from database
    const user = await AuthService.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Generate new token
    const newToken = AuthService.generateToken(req.user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal, server-side placeholder)
 */
router.post('/logout', optionalAuth, async (req: Request, res: Response) => {
  try {
    // With JWT, logout is typically handled client-side by removing the token
    // Server-side logout would require token blacklisting (Redis, database)
    // For now, just return success

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/auth/me
 * Alternative endpoint for getting current user (same as profile)
 */
router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          phone: req.user.phone,
          role: req.user.role,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

export default router;
