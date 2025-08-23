import { prisma } from '@/config/database';
import { AuthenticatedUser } from '@/config/passport';

export interface CreateTicketData {
  title: string;
  description: string;
  authorId?: number;
}

export interface UpdateTicketStatusData {
  status: string;
  user: AuthenticatedUser;
}

export interface TicketWithAuthor {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  source: string;
  authorId: number;
  assigneeId?: number | null;
  categoryId?: number | null;
  departmentId?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  customerArea?: string | null;
  meterNumber?: string | null;
  accountNumber?: string | null;
  resolution?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: Date | null;
  resolvedById?: number | null;
  dueDate?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  firstResponseAt?: Date | null;
  metadata?: string | null;
  tags: string;
  attachmentCount: number;
  author: {
    id: number;
    phone: string;
    role: string;
  };
  assignee?: {
    id: number;
    phone: string;
    role: string;
    name?: string | null;
  } | null;
  category?: {
    id: number;
    name: string;
  } | null;
  department?: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  type?: string;
  authorId?: number;
  assigneeId?: number;
  categoryId?: number;
  departmentId?: number;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Valid status values from our schema
const VALID_STATUSES = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_INFO',
  'PENDING_APPROVAL',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
  'ESCALATED',
  'ON_HOLD'
];

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'];
const VALID_TYPES = [
  'COMPLAINT',
  'REQUEST',
  'INQUIRY',
  'BILLING',
  'TECHNICAL',
  'MAINTENANCE',
  'INSTALLATION',
  'DISCONNECTION',
  'RECONNECTION',
  'METER_READING',
  'POWER_OUTAGE',
  'EMERGENCY'
];

export class TicketService {
  /**
   * Generate unique ticket number
   */
  private static generateTicketNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TK${timestamp.slice(-6)}${random}`;
  }

  /**
   * Create a new ticket
   */
  static async createTicket(data: CreateTicketData): Promise<TicketWithAuthor> {
    try {
      const ticketNumber = this.generateTicketNumber();

      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          title: data.title,
          description: data.description,
          authorId: data.authorId!,
          status: 'OPEN',
          priority: 'MEDIUM',
          type: 'COMPLAINT',
          source: 'WEBSITE',
          tags: '',
          attachmentCount: 0
        },
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              role: true,
            },
          },
          assignee: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create initial activity entry
      await this.createActivityEntry(ticket.id, data.authorId!, 'CREATED', 'تیکت ایجاد شد', null, null, {
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        status: ticket.status
      });

      return ticket as TicketWithAuthor;
    } catch (error) {
      throw new Error(`Failed to create ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all tickets for a specific user
   * Regular users can only see their own tickets
   * Employees, managers, and admins can see all tickets
   */
  static async getTicketsForUser(
    userId: number,
    userRole: string,
    filters: TicketFilters = {},
    pagination: PaginationOptions = {}
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = pagination;

      const skip = (page - 1) * limit;

      // Build where clause based on user role and filters
      const whereClause: any = {
        deletedAt: null, // Only get non-deleted tickets
      };

      // Role-based access control
      if (userRole === 'CLIENT') {
        whereClause.authorId = userId;
      } else if (filters.authorId) {
        whereClause.authorId = filters.authorId;
      }

      // Apply filters
      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.priority) {
        whereClause.priority = filters.priority;
      }

      if (filters.type) {
        whereClause.type = filters.type;
      }

      if (filters.assigneeId) {
        whereClause.assigneeId = filters.assigneeId;
      }

      if (filters.categoryId) {
        whereClause.categoryId = filters.categoryId;
      }

      if (filters.departmentId) {
        whereClause.departmentId = filters.departmentId;
      }

      if (filters.search) {
        whereClause.OR = [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
          { ticketNumber: { contains: filters.search } },
          { customerName: { contains: filters.search } },
          { customerPhone: { contains: filters.search } },
        ];
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.createdAt = {};
        if (filters.dateFrom) {
          whereClause.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          whereClause.createdAt.lte = filters.dateTo;
        }
      }

      // Get tickets with pagination
      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where: whereClause,
          include: {
            author: {
              select: {
                id: true,
                phone: true,
                role: true,
              },
            },
            assignee: {
              select: {
                id: true,
                phone: true,
                role: true,
                name: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: limit,
        }),
        prisma.ticket.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        tickets,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch tickets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific ticket by ID
   * Ensures the user can access this ticket based on their role
   */
  static async getTicketById(ticketId: number, userId: number, userRole: string): Promise<TicketWithAuthor | null> {
    try {
      const whereClause: any = {
        id: ticketId,
        deletedAt: null
      };

      // Role-based access control
      if (userRole === 'CLIENT') {
        whereClause.authorId = userId;
      }

      const ticket = await prisma.ticket.findFirst({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              role: true,
            },
          },
          assignee: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return ticket as TicketWithAuthor | null;
    } catch (error) {
      throw new Error(`Failed to fetch ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update ticket status and create activity entry
   */
  static async updateTicketStatus(
    ticketId: number,
    newStatus: string,
    user: AuthenticatedUser,
    notes?: string
  ): Promise<TicketWithAuthor> {
    try {
      // Validate status
      if (!this.validateStatus(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      // First, get the current ticket to check permissions and get old values
      const currentTicket = await this.getTicketById(ticketId, user.id, user.role);

      if (!currentTicket) {
        throw new Error('Ticket not found or access denied');
      }

      // Check if user can update this ticket
      if (user.role === 'CLIENT' && currentTicket.authorId !== user.id) {
        throw new Error('You can only update your own tickets');
      }

      const oldStatus = currentTicket.status;
      const now = new Date();

      // Prepare update data
      const updateData: any = {
        status: newStatus,
        updatedAt: now,
      };

      // Set resolution fields if resolving
      if (newStatus === 'RESOLVED' && oldStatus !== 'RESOLVED') {
        updateData.resolvedAt = now;
        updateData.resolvedById = user.id;
        if (notes) {
          updateData.resolution = notes;
        }
      }

      // Set first response time if this is the first staff response
      if (user.role !== 'CLIENT' && !currentTicket.firstResponseAt &&
          ['IN_PROGRESS', 'ASSIGNED'].includes(newStatus)) {
        updateData.firstResponseAt = now;
      }

      // Update the ticket
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              role: true,
            },
          },
          assignee: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create activity entry for the status change
      await this.createActivityEntry(
        ticketId,
        user.id,
        'STATUS_CHANGED',
        `وضعیت تیکت از ${oldStatus} به ${newStatus} تغییر کرد`,
        oldStatus,
        newStatus,
        {
          notes,
          updatedBy: user.role,
        }
      );

      return updatedTicket as TicketWithAuthor;
    } catch (error) {
      throw new Error(`Failed to update ticket status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assign ticket to a user
   */
  static async assignTicket(
    ticketId: number,
    assigneeId: number,
    user: AuthenticatedUser
  ): Promise<TicketWithAuthor> {
    try {
      // Check if user has permission to assign tickets
      if (!['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        throw new Error('You do not have permission to assign tickets');
      }

      const currentTicket = await this.getTicketById(ticketId, user.id, user.role);
      if (!currentTicket) {
        throw new Error('Ticket not found or access denied');
      }

      const oldAssigneeId = currentTicket.assigneeId;

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          assigneeId,
          status: oldAssigneeId ? 'ASSIGNED' : 'ASSIGNED', // Keep as assigned
          updatedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              role: true,
            },
          },
          assignee: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create activity entry
      const action = oldAssigneeId ? 'REASSIGNED' : 'ASSIGNED';
      const description = oldAssigneeId
        ? `تیکت مجدداً واگذار شد`
        : `تیکت واگذار شد`;

      await this.createActivityEntry(
        ticketId,
        user.id,
        action,
        description,
        oldAssigneeId?.toString() || null,
        assigneeId.toString(),
        {
          assignedBy: user.role,
        }
      );

      return updatedTicket as TicketWithAuthor;
    } catch (error) {
      throw new Error(`Failed to assign ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update ticket content (title, description)
   */
  static async updateTicketContent(
    ticketId: number,
    updateData: { title?: string; description?: string },
    user: AuthenticatedUser
  ): Promise<TicketWithAuthor> {
    try {
      // Get the current ticket to check permissions and get old values
      const currentTicket = await this.getTicketById(ticketId, user.id, user.role);

      if (!currentTicket) {
        throw new Error('Ticket not found or access denied');
      }

      // Check if user can update this ticket
      if (user.role === 'CLIENT' && currentTicket.authorId !== user.id) {
        throw new Error('You can only update your own tickets');
      }

      const oldData = {
        title: currentTicket.title,
        description: currentTicket.description,
      };

      const newData = {
        title: updateData.title || currentTicket.title,
        description: updateData.description || currentTicket.description,
      };

      // Update the ticket
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.description && { description: updateData.description }),
          updatedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              role: true,
            },
          },
          assignee: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create activity entry for the content change
      const changes: any = {};
      if (updateData.title && updateData.title !== oldData.title) {
        changes.title = { from: oldData.title, to: updateData.title };
      }
      if (updateData.description && updateData.description !== oldData.description) {
        changes.description = { from: oldData.description, to: updateData.description };
      }

      await this.createActivityEntry(
        ticketId,
        user.id,
        'UPDATED',
        'محتوای تیکت بروزرسانی شد',
        JSON.stringify(oldData),
        JSON.stringify(newData),
        changes
      );

      return updatedTicket as TicketWithAuthor;
    } catch (error) {
      throw new Error(`Failed to update ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get ticket history (activities)
   */
  static async getTicketHistory(ticketId: number, userId: number, userRole: string) {
    try {
      // First check if user can access this ticket
      const ticket = await this.getTicketById(ticketId, userId, userRole);
      if (!ticket) {
        throw new Error('Ticket not found or access denied');
      }

      const activities = await prisma.ticketActivity.findMany({
        where: { ticketId },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return activities;
    } catch (error) {
      throw new Error(`Failed to fetch ticket history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a ticket (admin/manager only)
   */
  static async deleteTicket(ticketId: number, user: AuthenticatedUser): Promise<void> {
    try {
      // Check permissions
      if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
        throw new Error('Only administrators and managers can delete tickets');
      }

      // Check if ticket exists
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId, deletedAt: null }
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Soft delete - just set deletedAt
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          deletedAt: new Date(),
        },
      });

      // Create activity entry
      await this.createActivityEntry(
        ticketId,
        user.id,
        'UPDATED',
        'تیکت حذف شد',
        null,
        null,
        {
          action: 'deleted',
          deletedBy: user.role,
        }
      );
    } catch (error) {
      throw new Error(`Failed to delete ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get ticket statistics
   */
  static async getTicketStats(userId?: number, userRole?: string) {
    try {
      const whereClause: any = {
        deletedAt: null,
      };

      // Role-based filtering
      if (userRole === 'CLIENT' && userId) {
        whereClause.authorId = userId;
      }

      const [total, open, inProgress, resolved, closed] = await Promise.all([
        prisma.ticket.count({ where: whereClause }),
        prisma.ticket.count({ where: { ...whereClause, status: 'OPEN' } }),
        prisma.ticket.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
        prisma.ticket.count({ where: { ...whereClause, status: 'RESOLVED' } }),
        prisma.ticket.count({ where: { ...whereClause, status: 'CLOSED' } }),
      ]);

      const assigned = await prisma.ticket.count({
        where: { ...whereClause, status: 'ASSIGNED' }
      });

      const rejected = await prisma.ticket.count({
        where: { ...whereClause, status: 'REJECTED' }
      });

      const escalated = await prisma.ticket.count({
        where: { ...whereClause, status: 'ESCALATED' }
      });

      const onHold = await prisma.ticket.count({
        where: { ...whereClause, status: 'ON_HOLD' }
      });

      return {
        total,
        open,
        assigned,
        inProgress,
        resolved,
        closed,
        rejected,
        escalated,
        onHold,
      };
    } catch (error) {
      throw new Error(`Failed to fetch ticket statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create an activity entry for ticket changes
   */
  private static async createActivityEntry(
    ticketId: number,
    userId: number,
    action: string,
    description: string,
    oldValue?: string | null,
    newValue?: string | null,
    metadata?: Record<string, any>
  ) {
    try {
      await prisma.ticketActivity.create({
        data: {
          ticketId,
          userId,
          action,
          description,
          oldValue,
          newValue,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (error) {
      console.error('Failed to create activity entry:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Validate ticket status
   */
  static validateStatus(status: string): boolean {
    return VALID_STATUSES.includes(status);
  }

  /**
   * Validate ticket priority
   */
  static validatePriority(priority: string): boolean {
    return VALID_PRIORITIES.includes(priority);
  }

  /**
   * Validate ticket type
   */
  static validateType(type: string): boolean {
    return VALID_TYPES.includes(type);
  }

  /**
   * Get available status transitions based on current status and user role
   */
  static getAvailableStatusTransitions(currentStatus: string, userRole: string): string[] {
    const transitions: Record<string, Record<string, string[]>> = {
      OPEN: {
        CLIENT: [],
        EMPLOYEE: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
        MANAGER: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED', 'ESCALATED'],
        ADMIN: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED', 'ESCALATED'],
        SUPER_ADMIN: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED', 'ESCALATED'],
      },
      ASSIGNED: {
        CLIENT: [],
        EMPLOYEE: ['IN_PROGRESS', 'RESOLVED', 'ON_HOLD'],
        MANAGER: ['IN_PROGRESS', 'RESOLVED', 'OPEN', 'CLOSED', 'REJECTED', 'ON_HOLD'],
        ADMIN: ['IN_PROGRESS', 'RESOLVED', 'OPEN', 'CLOSED', 'REJECTED', 'ON_HOLD'],
        SUPER_ADMIN: ['IN_PROGRESS', 'RESOLVED', 'OPEN', 'CLOSED', 'REJECTED', 'ON_HOLD'],
      },
      IN_PROGRESS: {
        CLIENT: [],
        EMPLOYEE: ['RESOLVED', 'PENDING_INFO', 'ON_HOLD'],
        MANAGER: ['RESOLVED', 'PENDING_INFO', 'ASSIGNED', 'CLOSED', 'REJECTED', 'ON_HOLD'],
        ADMIN: ['RESOLVED', 'PENDING_INFO', 'ASSIGNED', 'CLOSED', 'REJECTED', 'ON_HOLD'],
        SUPER_ADMIN: ['RESOLVED', 'PENDING_INFO', 'ASSIGNED', 'CLOSED', 'REJECTED', 'ON_HOLD'],
      },
      PENDING_INFO: {
        CLIENT: [],
        EMPLOYEE: ['IN_PROGRESS', 'RESOLVED'],
        MANAGER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'],
        ADMIN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'],
        SUPER_ADMIN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'],
      },
      RESOLVED: {
        CLIENT: [],
        EMPLOYEE: ['CLOSED'],
        MANAGER: ['CLOSED', 'IN_PROGRESS'],
        ADMIN: ['CLOSED', 'IN_PROGRESS'],
        SUPER_ADMIN: ['CLOSED', 'IN_PROGRESS'],
      },
      CLOSED: {
        CLIENT: [],
        EMPLOYEE: [],
        MANAGER: ['IN_PROGRESS'],
        ADMIN: ['IN_PROGRESS'],
        SUPER_ADMIN: ['IN_PROGRESS'],
      },
      REJECTED: {
        CLIENT: [],
        EMPLOYEE: ['IN_PROGRESS'],
        MANAGER: ['IN_PROGRESS'],
        ADMIN: ['IN_PROGRESS'],
        SUPER_ADMIN: ['IN_PROGRESS'],
      },
      ESCALATED: {
        CLIENT: [],
        EMPLOYEE: ['IN_PROGRESS'],
        MANAGER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        ADMIN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        SUPER_ADMIN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      },
      ON_HOLD: {
        CLIENT: [],
        EMPLOYEE: ['IN_PROGRESS'],
        MANAGER: ['IN_PROGRESS', 'ASSIGNED'],
        ADMIN: ['IN_PROGRESS', 'ASSIGNED'],
        SUPER_ADMIN: ['IN_PROGRESS', 'ASSIGNED'],
      },
    };

    return transitions[currentStatus]?.[userRole] || [];
  }

  /**
   * Get ticket comments
   */
  static async getTicketComments(ticketId: number, userId: number, userRole: string) {
    try {
      // First check if user can access this ticket
      const ticket = await this.getTicketById(ticketId, userId, userRole);
      if (!ticket) {
        throw new Error('Ticket not found or access denied');
      }

      const comments = await prisma.ticketComment.findMany({
        where: {
          ticketId,
          // Only show internal comments to staff members
          ...(userRole === 'CLIENT' ? { isInternal: false } : {})
        },
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return comments;
    } catch (error) {
      throw new Error(`Failed to fetch ticket comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add comment to ticket
   */
  static async addComment(
    ticketId: number,
    content: string,
    isInternal: boolean,
    user: AuthenticatedUser
  ) {
    try {
      // Check if user can access this ticket
      const ticket = await this.getTicketById(ticketId, user.id, user.role);
      if (!ticket) {
        throw new Error('Ticket not found or access denied');
      }

      // Only staff can add internal comments
      if (isInternal && user.role === 'CLIENT') {
        throw new Error('Clients cannot add internal comments');
      }

      const comment = await prisma.ticketComment.create({
        data: {
          ticketId,
          authorId: user.id,
          content,
          isInternal,
        },
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              role: true,
              name: true,
            },
          },
        },
      });

      // Create activity entry
      await this.createActivityEntry(
        ticketId,
        user.id,
        'COMMENTED',
        isInternal ? 'نظر داخلی اضافه شد' : 'نظر جدید اضافه شد',
        null,
        null,
        {
          isInternal,
          commentId: comment.id,
        }
      );

      return comment;
    } catch (error) {
      throw new Error(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
