import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateJWT, requireEmployee } from '@/middleware/auth';
import { prisma } from '../config/database';
import { AuthenticatedUser } from '@/config/passport';

const router = Router();

// All routes are protected - require authentication
router.use(authenticateJWT);

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface HistoryEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  action: 'created' | 'status_changed' | 'assigned' | 'comment_added' | 'file_attached' | 'updated';
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  timestamp: string;
  changes?: {
    field: string;
    from: string;
    to: string;
  }[];
  comment?: string;
  details: string;
}

/**
 * GET /api/history
 * Get comprehensive system history (tasks + tickets activities)
 */
router.get('/', requireEmployee, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('شماره صفحه باید عدد مثبت باشد'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('محدودیت تعداد باید بین 1 تا 100 باشد'),
  query('action')
    .optional()
    .isIn(['created', 'status_changed', 'assigned', 'comment_added', 'file_attached', 'updated'])
    .withMessage('نوع عملیات نامعتبر است'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('شناسه کاربر نامعتبر است'),
  query('assignedToUserId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('شناسه کاربر واگذارشده نامعتبر است'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('فرمت تاریخ شروع نامعتبر است'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('فرمت تاریخ پایان نامعتبر است'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'خطا در اعتبارسنجی داده‌ها',
        errors: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'کاربر احراز هویت نشده است',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (req.query.action) {
      where.action = {
        contains: req.query.action as string,
        mode: 'insensitive'
      };
    }

    if (req.query.userId) {
      where.userId = parseInt(req.query.userId as string);
    }

    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) {
        where.createdAt.gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        where.createdAt.lte = new Date(req.query.endDate as string);
      }
    }

    // If filtering by assignedToUserId, we need to join with tickets
    let ticketWhere = {};
    if (req.query.assignedToUserId) {
      ticketWhere = {
        assigneeId: parseInt(req.query.assignedToUserId as string)
      };
    }

    // Get ticket activities with pagination
    const [activities, total] = await Promise.all([
      prisma.ticketActivity.findMany({
        where: {
          ...where,
          ticket: ticketWhere
        },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
              profileImage: true,
            },
          },
          ticket: {
            select: {
              id: true,
              title: true,
              ticketNumber: true,
              type: true,
              assigneeId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.ticketActivity.count({
        where: {
          ...where,
          ticket: ticketWhere
        }
      })
    ]);

    // Transform to frontend format
    const history: HistoryEntry[] = activities.map(activity => {
      const historyEntry: HistoryEntry = {
        id: `H-${activity.id}`,
        taskId: activity.ticket.type === 'TASK' ? `T-${activity.ticketId}` : `TK-${activity.ticketId}`,
        taskTitle: activity.ticket.title,
        action: mapActionToFrontend(activity.action),
        user: {
          name: activity.user.name || activity.user.phone || 'کاربر ناشناس',
          avatar: activity.user.profileImage || undefined,
          role: mapRoleToFarsi(activity.user.role)
        },
        timestamp: toPersianDate(activity.createdAt),
        details: activity.description
      };

      // Add changes if old and new values exist
      if (activity.oldValue && activity.newValue) {
        historyEntry.changes = [{
          field: getFieldName(activity.action),
          from: activity.oldValue,
          to: activity.newValue
        }];
      }

      return historyEntry;
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'تاریخچه سیستم با موفقیت دریافت شد',
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching system history:', error);
    res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/history/audit
 * Get audit logs (admin only)
 */
router.get('/audit', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('شماره صفحه باید عدد مثبت باشد'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('محدودیت تعداد باید بین 1 تا 100 باشد'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('شناسه کاربر نامعتبر است'),
  query('resource')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('نام منبع نمی‌تواند خالی باشد'),
  query('action')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('نام عملیات نمی‌تواند خالی باشد'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'خطا در اعتبارسنجی داده‌ها',
        errors: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'کاربر احراز هویت نشده است',
      });
    }

    // Only admins and managers can access audit logs
    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'دسترسی غیرمجاز. فقط مدیران می‌توانند به گزارش‌های حسابرسی دسترسی داشته باشند.',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (req.query.userId) {
      where.userId = parseInt(req.query.userId as string);
    }

    if (req.query.resource) {
      where.resource = {
        contains: req.query.resource as string,
        mode: 'insensitive'
      };
    }

    if (req.query.action) {
      where.action = {
        contains: req.query.action as string,
        mode: 'insensitive'
      };
    }

    // Get audit logs
    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
              profileImage: true,
            },
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'گزارش‌های حسابرسی با موفقیت دریافت شدند',
      data: {
        auditLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/history/stats
 * Get history statistics
 */
router.get('/stats', requireEmployee, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'کاربر احراز هویت نشده است',
      });
    }

    // Get statistics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalActivities,
      recentActivities,
      activitiesByAction,
      activitiesByUser
    ] = await Promise.all([
      // Total activities count
      prisma.ticketActivity.count(),

      // Recent activities (last 30 days)
      prisma.ticketActivity.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),

      // Activities grouped by action type
      prisma.ticketActivity.groupBy({
        by: ['action'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),

      // Most active users (last 30 days)
      prisma.ticketActivity.groupBy({
        by: ['userId'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Get user details for most active users
    const userIds = activitiesByUser.map(item => item.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true
      }
    });

    const mostActiveUsers = activitiesByUser.map(item => {
      const user = users.find(u => u.id === item.userId);
      return {
        user: {
          id: user?.id,
          name: user?.name || user?.phone || 'کاربر ناشناس',
          role: mapRoleToFarsi(user?.role || 'CLIENT')
        },
        activityCount: item._count.id
      };
    });

    res.json({
      success: true,
      message: 'آمار تاریخچه با موفقیت دریافت شد',
      data: {
        totalActivities,
        recentActivities,
        activitiesByAction: activitiesByAction.map(item => ({
          action: item.action,
          actionLabel: getActionLabel(item.action),
          count: item._count.id
        })),
        mostActiveUsers
      }
    });

  } catch (error) {
    console.error('Error fetching history stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

// Helper functions
function mapActionToFrontend(action: string): 'created' | 'status_changed' | 'assigned' | 'comment_added' | 'file_attached' | 'updated' {
  switch (action.toLowerCase()) {
    case 'create':
    case 'created':
      return 'created';
    case 'status_change':
    case 'status_changed':
      return 'status_changed';
    case 'assign':
    case 'assigned':
      return 'assigned';
    case 'comment':
    case 'comment_added':
      return 'comment_added';
    case 'file_attach':
    case 'file_attached':
      return 'file_attached';
    default:
      return 'updated';
  }
}

function mapRoleToFarsi(role: string): string {
  switch (role.toUpperCase()) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return 'مدیر سیستم';
    case 'MANAGER':
      return 'مدیر';
    case 'EMPLOYEE':
      return 'کارشناس';
    case 'TECHNICIAN':
      return 'تکنسین';
    case 'CLIENT':
      return 'مشتری';
    default:
      return 'کاربر';
  }
}

function getFieldName(action: string): string {
  switch (action.toLowerCase()) {
    case 'status_change':
    case 'status_changed':
      return 'وضعیت';
    case 'assign':
    case 'assigned':
      return 'مسئول';
    case 'priority_change':
      return 'اولویت';
    default:
      return 'مقدار';
  }
}

function getActionLabel(action: string): string {
  switch (action.toLowerCase()) {
    case 'create':
    case 'created':
      return 'ایجاد شده';
    case 'status_change':
    case 'status_changed':
      return 'تغییر وضعیت';
    case 'assign':
    case 'assigned':
      return 'واگذاری';
    case 'comment':
    case 'comment_added':
      return 'نظر افزوده شد';
    case 'file_attach':
    case 'file_attached':
      return 'فایل پیوست شد';
    case 'update':
    case 'updated':
      return 'به‌روزرسانی';
    default:
      return action;
  }
}

function toPersianDate(date: Date): string {
  try {
    const persianDate = new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tehran'
    });
    return persianDate.replace(',', ' -');
  } catch (error) {
    return date.toISOString().split('T')[0];
  }
}

export default router;
