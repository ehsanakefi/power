import { ApiResponse, PaginatedResponse } from './types';
import apiClient from '../api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface CustomerTicket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  source: string;
  authorId: number;
  assigneeId?: number;
  categoryId?: number;
  departmentId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerArea?: string;
  meterNumber?: string;
  accountNumber?: string;
  resolution?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedById?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  firstResponseAt?: string;
  metadata?: string;
  tags: string;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  author: {
    id: number;
    phone: string;
    name?: string;
    role: string;
  };
  assignee?: {
    id: number;
    phone: string;
    name?: string;
    role: string;
  };
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  department?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  pending: number;
  rejected: number;
  escalated: number;
  onHold: number;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  categoryId?: number;
  departmentId?: number;
  assigneeId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketsResponse {
  tickets: CustomerTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority?: string;
  type?: string;
  categoryId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerArea?: string;
  meterNumber?: string;
  accountNumber?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  priority?: string;
  type?: string;
  categoryId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerArea?: string;
  meterNumber?: string;
  accountNumber?: string;
  tags?: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    phone: string;
    name?: string;
    role: string;
  };
}

export interface TicketActivity {
  id: number;
  ticketId: number;
  userId: number;
  action: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  metadata?: string;
  createdAt: string;
  user: {
    id: number;
    phone: string;
    name?: string;
    role: string;
  };
}

// API Functions
export const ticketsApi = {
  // Get all tickets for current user (customer)
  getAll: (filters: TicketFilters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    return apiClient.get<ApiResponse<TicketsResponse>>(`/tickets?${params.toString()}`);
  },

  // Get ticket by ID
  getById: (id: number) =>
    apiClient.get<ApiResponse<{ ticket: CustomerTicket }>>(`/tickets/${id}`),

  // Create new ticket
  create: (data: CreateTicketData) =>
    apiClient.post<ApiResponse<{ ticket: CustomerTicket }>>('/tickets', data),

  // Update ticket
  update: (id: number, data: UpdateTicketData) =>
    apiClient.put<ApiResponse<{ ticket: CustomerTicket }>>(`/tickets/${id}`, data),

  // Update ticket status
  updateStatus: (id: number, status: string) =>
    apiClient.put<ApiResponse<{ ticket: CustomerTicket }>>(`/tickets/${id}/status`, { status }),

  // Delete ticket
  delete: (id: number) =>
    apiClient.delete<ApiResponse>(`/tickets/${id}`),

  // Get ticket history
  getHistory: (id: number) =>
    apiClient.get<ApiResponse<{ history: TicketActivity[] }>>(`/tickets/${id}/history`),

  // Get ticket stats for current user
  getStats: () =>
    apiClient.get<ApiResponse<{ stats: TicketStats }>>('/tickets/stats'),

  // Get ticket comments
  getComments: (id: number) =>
    apiClient.get<ApiResponse<{ comments: TicketComment[] }>>(`/tickets/${id}/comments`),

  // Add comment to ticket
  addComment: (id: number, content: string, isInternal: boolean = false) =>
    apiClient.post<ApiResponse<{ comment: TicketComment }>>(`/tickets/${id}/comments`, {
      content,
      isInternal,
    }),
};

// Helper Functions for Data Transformation

// Map backend status to frontend status
export const mapBackendStatusToFrontend = (backendStatus: string): 'unseen' | 'in_progress' | 'completed' | 'referred' | 'success' | 'failed' => {
  switch (backendStatus) {
    case 'OPEN':
      return 'unseen';
    case 'ASSIGNED':
    case 'IN_PROGRESS':
    case 'PENDING_INFO':
      return 'in_progress';
    case 'RESOLVED':
      return 'completed';
    case 'ESCALATED':
      return 'referred';
    case 'CLOSED':
      return 'success';
    case 'REJECTED':
      return 'failed';
    case 'ON_HOLD':
      return 'in_progress';
    default:
      return 'unseen';
  }
};

// Map frontend status to backend statuses (reverse mapping)
export const mapFrontendStatusToBackend = (frontendStatus: string): string[] => {
  switch (frontendStatus) {
    case 'unseen':
      return ['OPEN'];
    case 'in_progress':
      return ['ASSIGNED', 'IN_PROGRESS', 'PENDING_INFO', 'ON_HOLD'];
    case 'completed':
      return ['RESOLVED'];
    case 'referred':
      return ['ESCALATED'];
    case 'success':
      return ['CLOSED'];
    case 'failed':
      return ['REJECTED'];
    default:
      return ['OPEN'];
  }
};

// Map backend status to Persian label
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'OPEN':
      return 'باز';
    case 'ASSIGNED':
      return 'واگذار شده';
    case 'IN_PROGRESS':
      return 'در حال انجام';
    case 'PENDING_INFO':
      return 'در انتظار اطلاعات';
    case 'RESOLVED':
      return 'حل شده';
    case 'CLOSED':
      return 'بسته شده';
    case 'REJECTED':
      return 'رد شده';
    case 'ESCALATED':
      return 'ارجاع شده';
    case 'ON_HOLD':
      return 'در انتظار';
    default:
      return status;
  }
};

// Map backend priority to Persian label
export const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'LOW':
      return 'کم';
    case 'MEDIUM':
      return 'متوسط';
    case 'HIGH':
      return 'زیاد';
    case 'URGENT':
      return 'فوری';
    case 'CRITICAL':
      return 'بحرانی';
    default:
      return priority;
  }
};

// Map backend type to Persian label
export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'COMPLAINT':
      return 'شکایت';
    case 'REQUEST':
      return 'درخواست';
    case 'INQUIRY':
      return 'استعلام';
    case 'TECHNICAL':
      return 'فنی';
    case 'BILLING':
      return 'قبض';
    case 'CONNECTION':
      return 'اتصال';
    case 'MAINTENANCE':
      return 'نگهداری';
    default:
      return type;
  }
};

// Convert Gregorian date to Persian date format
export const toPersianDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Tehran'
    }).format(date);

    return persianDate.replace(/\//g, '/');
  } catch (error) {
    console.error('Error converting date to Persian:', error);
    return dateString;
  }
};

// Transform backend ticket to frontend format
export const transformTicketToFrontend = (backendTicket: CustomerTicket) => {
  // Generate fake summary for tickets that don't have resolution notes
  const generateFakeSummary = (ticket: CustomerTicket): string | undefined => {
    if (ticket.resolutionNotes) {
      return ticket.resolutionNotes;
    }

    // Generate contextual fake summaries based on status and type
    const status = ticket.status;
    const type = ticket.type;

    if (status === 'IN_PROGRESS') {
      if (type === 'TECHNICAL') {
        return 'درخواست در حال بررسی توسط تیم فنی می‌باشد';
      } else if (type === 'BILLING') {
        return 'قبض در حال بررسی توسط واحد مالی می‌باشد';
      } else {
        return 'درخواست در حال بررسی می‌باشد';
      }
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      if (type === 'TECHNICAL') {
        return 'مشکل فنی برطرف شده است';
      } else if (type === 'BILLING') {
        return 'مسئله قبض حل شده است';
      } else {
        return 'درخواست با موفقیت انجام شد';
      }
    }

    if (status === 'ESCALATED') {
      return 'ارجاع به واحد مربوطه';
    }

    if (status === 'OPEN') {
      return undefined; // No summary for new tickets
    }

    return undefined;
  };

  return {
    id: backendTicket.ticketNumber || `TK-${backendTicket.id}`,
    date: toPersianDate(backendTicket.createdAt),
    description: backendTicket.title || backendTicket.description,
    status: mapBackendStatusToFrontend(backendTicket.status),
    category: getTypeLabel(backendTicket.type),
    summary: generateFakeSummary(backendTicket), // This field uses fake data
    // Additional fields for detailed view
    rawTicket: backendTicket,
    priority: backendTicket.priority,
    type: backendTicket.type,
    customerInfo: {
      name: backendTicket.customerName,
      phone: backendTicket.customerPhone,
      email: backendTicket.customerEmail,
      address: backendTicket.customerAddress,
      area: backendTicket.customerArea,
      meterNumber: backendTicket.meterNumber,
      accountNumber: backendTicket.accountNumber,
    }
  };
};

// Convenience functions for React Query
export const getTickets = async (filters: TicketFilters = {}): Promise<TicketsResponse> => {
  // Convert frontend status to backend statuses if provided
  const backendFilters = { ...filters };
  if (backendFilters.status) {
    const backendStatuses = mapFrontendStatusToBackend(backendFilters.status);
    // Send comma-separated statuses for backend to handle with IN operation
    backendFilters.status = backendStatuses.join(',');
  }

  const response = await ticketsApi.getAll(backendFilters);
  if (response.data.success) {
    return response.data.data!;
  }
  throw new Error(response.data.message || 'Failed to fetch tickets');
};

export const getTicketById = async (id: number): Promise<CustomerTicket> => {
  const response = await ticketsApi.getById(id);
  if (response.data.success) {
    return response.data.data!.ticket;
  }
  throw new Error(response.data.message || 'Failed to fetch ticket');
};

export const getTicketStats = async (): Promise<TicketStats> => {
  const response = await ticketsApi.getStats();
  if (response.data.success) {
    return response.data.data!.stats;
  }
  throw new Error(response.data.message || 'Failed to fetch ticket stats');
};

export const createTicket = async (data: CreateTicketData): Promise<CustomerTicket> => {
  const response = await ticketsApi.create(data);
  if (response.data.success) {
    return response.data.data!.ticket;
  }
  throw new Error(response.data.message || 'Failed to create ticket');
};

export const updateTicket = async (id: number, data: UpdateTicketData): Promise<CustomerTicket> => {
  const response = await ticketsApi.update(id, data);
  if (response.data.success) {
    return response.data.data!.ticket;
  }
  throw new Error(response.data.message || 'Failed to update ticket');
};

export const getTicketComments = async (id: number): Promise<TicketComment[]> => {
  const response = await ticketsApi.getComments(id);
  if (response.data.success) {
    return response.data.data!.comments;
  }
  throw new Error(response.data.message || 'Failed to fetch comments');
};

export const addTicketComment = async (id: number, content: string): Promise<TicketComment> => {
  const response = await ticketsApi.addComment(id, content);
  if (response.data.success) {
    return response.data.data!.comment;
  }
  throw new Error(response.data.message || 'Failed to add comment');
};
