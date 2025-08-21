import { prisma } from '@/config/database';
import { UserRole, UserRoleType } from '@/constants/userRoles';
import { AuthenticatedUser } from '@/config/passport';

export interface CreateTicketData {
  title: string;
  content: string;
  authorId?: number;
}

export interface UpdateTicketStatusData {
  status: string;
  user: AuthenticatedUser;
}

export interface TicketWithAuthor {
  id: number;
  title: string;
  content: string;
  status: string;
  authorId: number;
  author: {
    id: number;
    phone: string;
    role: UserRoleType;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketFilters {
  status?: string;
  authorId?: number;
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

export class TicketService {
  /**
   * Create a new ticket
   */
  static async createTicket(data: CreateTicketData): Promise<TicketWithAuthor> {
    try {
      const ticket = await prisma.ticket.create({
        data: {
          title: data.title,
          content: data.content,
          authorId: data.authorId!,
          status: 'unseen',
        },
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              role: true,
            },
          },
        },
      });

      // Create initial log entry
      await this.createLogEntry(ticket.id, {}, {
        title: ticket.title,
        content: ticket.content,
        status: ticket.status,
        authorId: ticket.authorId,
      }, {
        action: 'created',
        title: ticket.title,
        status: ticket.status,
      }, `User:${ticket.authorId}`);

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
    userRole: UserRoleType,
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
      const whereClause: any = {};

      // Role-based access control
      if (userRole === UserRole.CLIENT) {
        whereClause.authorId = userId;
      } else if (filters.authorId) {
        whereClause.authorId = filters.authorId;
      }

      // Apply filters
      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.search) {
        whereClause.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
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
  static async getTicketById(ticketId: number, userId: number, userRole: UserRoleType): Promise<TicketWithAuthor | null> {
    try {
      const whereClause: any = { id: ticketId };

      // Role-based access control
      if (userRole === UserRole.CLIENT) {
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
        },
      });

      return ticket as TicketWithAuthor | null;
    } catch (error) {
      throw new Error(`Failed to fetch ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update ticket status and create log entry
   */
  static async updateTicketStatus(
    ticketId: number,
    newStatus: string,
    user: AuthenticatedUser,
    userId?: number
  ): Promise<TicketWithAuthor> {
    try {
      // First, get the current ticket to check permissions and get old values
      const currentTicket = await this.getTicketById(ticketId, user.id, user.role);

      if (!currentTicket) {
        throw new Error('Ticket not found or access denied');
      }

      // Check if user can update this ticket
      if (user.role === UserRole.CLIENT && currentTicket.authorId !== user.id) {
        throw new Error('You can only update your own tickets');
      }

      const oldStatus = currentTicket.status;

      // Update the ticket
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: newStatus,
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
        },
      });

      // Create log entry for the status change
      await this.createLogEntry(
        ticketId,
        { status: oldStatus },
        { status: newStatus },
        {
          action: 'status_changed',
          from: oldStatus,
          to: newStatus,
          updatedBy: user.role,
        },
        `User:${user.id}`
      );

      return updatedTicket as TicketWithAuthor;
    } catch (error) {
      throw new Error(`Failed to update ticket status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update ticket content (title, description)
   */
  static async updateTicketContent(
    ticketId: number,
    updateData: { title?: string; content?: string },
    user: AuthenticatedUser
  ): Promise<TicketWithAuthor> {
    try {
      // Get the current ticket to check permissions and get old values
      const currentTicket = await this.getTicketById(ticketId, user.id, user.role);

      if (!currentTicket) {
        throw new Error('Ticket not found or access denied');
      }

      // Check if user can update this ticket
      if (user.role === UserRole.CLIENT && currentTicket.authorId !== user.id) {
        throw new Error('You can only update your own tickets');
      }

      const oldData = {
        title: currentTicket.title,
        content: currentTicket.content,
      };

      const newData = {
        title: updateData.title || currentTicket.title,
        content: updateData.content || currentTicket.content,
      };

      // Update the ticket
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.content && { content: updateData.content }),
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
        },
      });

      // Create log entry for the content change
      const changes: any = { action: 'content_updated' };
      if (updateData.title && updateData.title !== oldData.title) {
        changes.title = { from: oldData.title, to: updateData.title };
      }
      if (updateData.content && updateData.content !== oldData.content) {
        changes.content = { from: oldData.content, to: updateData.content };
      }

      await this.createLogEntry(ticketId, oldData, newData, changes, `User:${user.id}`);

      return updatedTicket as TicketWithAuthor;
    } catch (error) {
      throw new Error(`Failed to update ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get ticket history (logs)
   */
  static async getTicketHistory(ticketId: number, userId: number, userRole: UserRoleType) {
    try {
      // First check if user can access this ticket
      const ticket = await this.getTicketById(ticketId, userId, userRole);
      if (!ticket) {
        throw new Error('Ticket not found or access denied');
      }

      const logs = await prisma.log.findMany({
        where: { ticketId },
        orderBy: { createdAt: 'desc' },
      });

      return logs;
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
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
        throw new Error('Only administrators and managers can delete tickets');
      }

      // Check if ticket exists
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Delete associated logs first (due to foreign key constraint)
      await prisma.log.deleteMany({ where: { ticketId } });

      // Delete the ticket
      await prisma.ticket.delete({ where: { id: ticketId } });
    } catch (error) {
      throw new Error(`Failed to delete ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get ticket statistics
   */
  static async getTicketStats(userId?: number, userRole?: UserRoleType) {
    try {
      const whereClause: any = {};

      // Role-based filtering
      if (userRole === UserRole.CLIENT && userId) {
        whereClause.authorId = userId;
      }

      const [total, unseen, inProgress, resolved] = await Promise.all([
        prisma.ticket.count({ where: whereClause }),
        prisma.ticket.count({ where: { ...whereClause, status: 'unseen' } }),
        prisma.ticket.count({ where: { ...whereClause, status: 'in_progress' } }),
        prisma.ticket.count({ where: { ...whereClause, status: 'resolved' } }),
      ]);

      return {
        total,
        unseen,
        inProgress,
        resolved,
        closed: total - unseen - inProgress - resolved,
      };
    } catch (error) {
      throw new Error(`Failed to fetch ticket statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a log entry for ticket changes
   */
  private static async createLogEntry(
    ticketId: number,
    before: Record<string, any>,
    after: Record<string, any>,
    changes: Record<string, any>,
    user: string
  ) {
    try {
      await prisma.log.create({
        data: {
          ticketId,
          before: JSON.stringify(before),
          after: JSON.stringify(after),
          changes: JSON.stringify(changes),
          user,
        },
      });
    } catch (error) {
      console.error('Failed to create log entry:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Validate ticket status
   */
  static validateStatus(status: string): boolean {
    const validStatuses = ['unseen', 'in_progress', 'resolved', 'closed', 'rejected'];
    return validStatuses.includes(status);
  }

  /**
   * Get available status transitions based on current status and user role
   */
  static getAvailableStatusTransitions(currentStatus: string, userRole: UserRoleType): string[] {
    const transitions: Record<string, Record<string, string[]>> = {
      unseen: {
        [UserRole.CLIENT]: [],
        [UserRole.EMPLOYEE]: ['in_progress', 'resolved', 'rejected'],
        [UserRole.MANAGER]: ['in_progress', 'resolved', 'rejected', 'closed'],
        [UserRole.ADMIN]: ['in_progress', 'resolved', 'rejected', 'closed'],
      },
      in_progress: {
        [UserRole.CLIENT]: [],
        [UserRole.EMPLOYEE]: ['resolved', 'unseen'],
        [UserRole.MANAGER]: ['resolved', 'unseen', 'closed', 'rejected'],
        [UserRole.ADMIN]: ['resolved', 'unseen', 'closed', 'rejected'],
      },
      resolved: {
        [UserRole.CLIENT]: [],
        [UserRole.EMPLOYEE]: ['closed'],
        [UserRole.MANAGER]: ['closed', 'in_progress'],
        [UserRole.ADMIN]: ['closed', 'in_progress'],
      },
      closed: {
        [UserRole.CLIENT]: [],
        [UserRole.EMPLOYEE]: [],
        [UserRole.MANAGER]: ['in_progress'],
        [UserRole.ADMIN]: ['in_progress'],
      },
      rejected: {
        [UserRole.CLIENT]: [],
        [UserRole.EMPLOYEE]: ['in_progress'],
        [UserRole.MANAGER]: ['in_progress'],
        [UserRole.ADMIN]: ['in_progress'],
      },
    };

    return transitions[currentStatus]?.[userRole] || [];
  }
}
