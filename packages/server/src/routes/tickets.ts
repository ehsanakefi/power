import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { TicketService } from '@/services/ticketService';
import { authenticateJWT, requireRole, requireEmployee } from '@/middleware/auth';
import { UserRole } from '@/constants/userRoles';
import { prisma } from '../config/database';

const router = Router();

// All routes are protected - require authentication
router.use(authenticateJWT);

// Validation rules
const createTicketValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
];

const updateStatusValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid ticket ID is required'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .custom((value) => {
      if (!TicketService.validateStatus(value)) {
        throw new Error('Invalid status. Valid statuses: unseen, in_progress, resolved, closed, rejected');
      }
      return true;
    }),
];

const updateContentValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid ticket ID is required'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body()
    .custom((value) => {
      if (!value.title && !value.content) {
        throw new Error('At least one field (title or content) must be provided');
      }
      return true;
    }),
];

const getTicketsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('status').optional().custom((value) => {
    if (value && !TicketService.validateStatus(value)) {
      throw new Error('Invalid status filter');
    }
    return true;
  }),
  query('authorId').optional().isInt({ min: 1 }).withMessage('Author ID must be a positive integer'),
  query('assigneeId').optional().isInt({ min: 1 }).withMessage('Assignee ID must be a positive integer'),
];

/**
 * POST /api/tickets
 * Create a new ticket
 */
router.post('/', createTicketValidation, async (req: Request, res: Response) => {
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { title, description } = req.body;

    // Create the ticket
    const ticket = await TicketService.createTicket({
      title,
      description,
      authorId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: { ticket },
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/tickets
 * Get tickets list with pagination and filtering
 */
router.get('/', getTicketsValidation, async (req: Request, res: Response) => {
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
    const status = req.query.status as string;
    const authorId = req.query.authorId ? parseInt(req.query.authorId as string) : undefined;
    const assigneeId = req.query.assigneeId ? parseInt(req.query.assigneeId as string) : undefined;
    const search = req.query.search as string;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    // Build filters
    const filters = {
      ...(status && { status }),
      ...(authorId && { authorId }),
      ...(assigneeId && { assigneeId }),
      ...(search && { search }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    };

    // Get tickets
    const result = await TicketService.getTicketsForUser(
      req.user.id,
      req.user.role,
      filters,
      { page, limit, sortBy, sortOrder }
    );

    res.status(200).json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tickets',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/tickets/stats
 * Get ticket statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const stats = await TicketService.getTicketStats(req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Ticket statistics retrieved successfully',
      data: { stats },
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket statistics',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/tickets/dashboard-stats
 * Get comprehensive dashboard statistics for admin panel
 */
router.get('/dashboard-stats', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Basic ticket stats
    const [
      totalTickets,
      todayTickets,
      yesterdayTickets,
      resolvedTickets,
      pendingTickets,
      openTickets
    ] = await Promise.all([
      prisma.ticket.count({ where: { deletedAt: null } }),
      prisma.ticket.count({
        where: {
          deletedAt: null,
          createdAt: { gte: today, lt: tomorrow }
        }
      }),
      prisma.ticket.count({
        where: {
          deletedAt: null,
          createdAt: { gte: yesterday, lt: today }
        }
      }),
      prisma.ticket.count({
        where: {
          deletedAt: null,
          status: 'RESOLVED'
        }
      }),
      prisma.ticket.count({
        where: {
          deletedAt: null,
          status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] }
        }
      }),
      prisma.ticket.count({
        where: {
          deletedAt: null,
          status: 'OPEN'
        }
      })
    ]);

    // Calculate percentage change from yesterday
    const changePercent = yesterdayTickets > 0
      ? Math.round(((todayTickets - yesterdayTickets) / yesterdayTickets) * 100)
      : todayTickets > 0 ? 100 : 0;

    // Get user stats
    const [totalUsers, onlineUsers] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({
        where: {
          deletedAt: null,
          lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      })
    ]);

    // Calculate resolution rate
    const resolutionRate = totalTickets > 0
      ? Math.round((resolvedTickets / totalTickets) * 100)
      : 0;

    // Calculate average waiting time (dummy calculation for now)
    const avgWaitingTime = pendingTickets > 0 ? "1.2" : "0";

    // Get current server time for greeting
    const now = new Date();

    // Add time-based greeting
    let greeting: string;

    try {
      const hour = now.getHours();
      if (hour >= 6 && hour < 12) {
        greeting = 'صبح بخیر';
      } else if (hour >= 12 && hour < 17) {
        greeting = 'ظهر بخیر';
      } else if (hour >= 17 && hour < 21) {
        greeting = 'عصر بخیر';
      } else {
        greeting = 'شب بخیر';
      }
    } catch (error) {
      greeting = 'سلام';
    }

    const dashboardStats = {
      tickets: {
        today: todayTickets,
        resolved: resolvedTickets,
        pending: pendingTickets,
        changePercent,
        resolutionRate,
        avgWaitingTime
      },
      users: {
        total: totalUsers,
        online: onlineUsers
      },
      system: {
        serverUsage: 72,
        messageProcessing: 95,
        aiAccuracy: 88,
        responseTime: 92
      },
      serverInfo: {
        greeting: greeting,
        timestamp: now.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: dashboardStats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/tickets/recent-activities
 * Get recent ticket activities for admin dashboard
 */
router.get('/recent-activities', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent ticket activities
    const recentTickets = await prisma.ticket.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
            phone: true
          }
        },
        assignee: {
          select: {
            name: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });

    const activities = recentTickets.map((ticket: any) => {
      const timeDiff = Date.now() - ticket.updatedAt.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));

      let timeString;
      if (minutesAgo < 1) {
        timeString = "همین الان";
      } else if (minutesAgo < 60) {
        timeString = `${minutesAgo} دقیقه پیش`;
      } else {
        const hoursAgo = Math.floor(minutesAgo / 60);
        timeString = `${hoursAgo} ساعت پیش`;
      }

      let activityType = "جدید";
      let description = `شکایت جدید دریافت شد`;

      if (ticket.status === 'RESOLVED') {
        activityType = "حل شده";
        description = `شکایت #${ticket.ticketNumber} حل شد`;
      } else if (ticket.status === 'ASSIGNED') {
        activityType = "تخصیص";
        description = `تخصیص شکایت به ${ticket.assignee?.name || 'کارشناس'}`;
      }

      return {
        id: ticket.id,
        type: activityType,
        description,
        details: ticket.title,
        time: timeString,
        status: ticket.status,
        user: ticket.assignee?.name || ticket.author.name || 'نامشخص'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Recent activities retrieved successfully',
      data: { activities }
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activities',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/tickets/top-performers
 * Get top performing users based on resolved tickets
 */
router.get('/top-performers', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const limit = parseInt(req.query.limit as string) || 5;

    // Get top performers based on resolved tickets
    const topPerformers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        role: { in: ['EMPLOYEE', 'MANAGER'] }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        assignedTickets: {
          where: {
            status: 'RESOLVED',
            deletedAt: null
          },
          select: { id: true }
        }
      },
      take: limit * 2 // Get more to filter out users with 0 tickets
    });

    const performersWithCount = topPerformers
      .map((user: any) => ({
        id: user.id,
        name: user.name || user.phone,
        resolvedCount: user.assignedTickets.length
      }))
      .filter((user: any) => user.resolvedCount > 0)
      .sort((a: any, b: any) => b.resolvedCount - a.resolvedCount)
      .slice(0, limit)
      .map((user: any, index: number) => ({
        ...user,
        rank: index + 1,
        badge: index === 0 ? 'طلایی' : index === 1 ? 'نقره‌ای' : index === 2 ? 'برنزی' : 'عادی'
      }));

    res.status(200).json({
      success: true,
      message: 'Top performers retrieved successfully',
      data: { performers: performersWithCount }
    });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve top performers',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/tickets/:id
 * Get a specific ticket by ID
 */
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('Valid ticket ID is required'),
], async (req: Request, res: Response) => {
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const ticketId = parseInt(req.params.id);

    const ticket = await TicketService.getTicketById(ticketId, req.user.id, req.user.role);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket retrieved successfully',
      data: { ticket },
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/tickets/:id/history
 * Get ticket history/logs
 */
router.get('/:id/history', [
  param('id').isInt({ min: 1 }).withMessage('Valid ticket ID is required'),
], async (req: Request, res: Response) => {
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const ticketId = parseInt(req.params.id);

    const history = await TicketService.getTicketHistory(ticketId, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Ticket history retrieved successfully',
      data: { history },
    });
  } catch (error) {
    console.error('Get ticket history error:', error);

    if ((error as Error).message.includes('not found or access denied')) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket history',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * PUT /api/tickets/:id/status
 * Update ticket status
 */
router.put('/:id/status', updateStatusValidation, async (req: Request, res: Response) => {
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const ticketId = parseInt(req.params.id);
    const { status } = req.body;

    // Check if user can transition to this status
    const currentTicket = await TicketService.getTicketById(ticketId, req.user.id, req.user.role);
    if (!currentTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied',
      });
    }

    const availableTransitions = TicketService.getAvailableStatusTransitions(
      currentTicket.status,
      req.user.role
    );

    if (!availableTransitions.includes(status)) {
      return res.status(403).json({
        success: false,
        message: 'Status transition not allowed',
        availableTransitions,
        currentStatus: currentTicket.status,
      });
    }

    const updatedTicket = await TicketService.updateTicketStatus(ticketId, status, req.user);

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: { ticket: updatedTicket },
    });
  } catch (error) {
    console.error('Update ticket status error:', error);

    if ((error as Error).message.includes('not found or access denied')) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied',
      });
    }

    if ((error as Error).message.includes('can only update your own')) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own tickets',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * PUT /api/tickets/:id
 * Update ticket content (title, description)
 */
router.put('/:id', updateContentValidation, async (req: Request, res: Response) => {
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const ticketId = parseInt(req.params.id);
    const { title, description } = req.body;

    const updatedTicket = await TicketService.updateTicketContent(
      ticketId,
      { title, description },
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket: updatedTicket },
    });
  } catch (error) {
    console.error('Update ticket error:', error);

    if ((error as Error).message.includes('not found or access denied')) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied',
      });
    }

    if ((error as Error).message.includes('can only update your own')) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own tickets',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * DELETE /api/tickets/:id
 * Delete a ticket (admin/manager only)
 */
router.delete('/:id', requireRole([UserRole.ADMIN, UserRole.MANAGER]), [
  param('id').isInt({ min: 1 }).withMessage('Valid ticket ID is required'),
], async (req: Request, res: Response) => {
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const ticketId = parseInt(req.params.id);

    await TicketService.deleteTicket(ticketId, req.user);

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    console.error('Delete ticket error:', error);

    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if ((error as Error).message.includes('Only administrators')) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators and managers can delete tickets',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

export default router;
