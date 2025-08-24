import apiClient from '../lib/api';

export interface HistoryEntry {
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class HistoryService {
  /**
   * Get task history by task ID
   */
  static async getTaskHistory(taskId: string): Promise<HistoryEntry[]> {
    try {
      console.log(`Fetching task history for taskId: ${taskId}`);
      const response = await apiClient.get<ApiResponse<HistoryEntry[]>>(`/tasks/${taskId}/history`);
      console.log('Task history response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching task history:', error);
      throw error;
    }
  }

  /**
   * Get ticket history by ticket ID (if needed)
   */
  static async getTicketHistory(ticketId: string): Promise<HistoryEntry[]> {
    try {
      console.log(`Fetching ticket history for ticketId: ${ticketId}`);
      const response = await apiClient.get<ApiResponse<{ history: HistoryEntry[] }>>(`/tickets/${ticketId}/history`);
      console.log('Ticket history response:', response.data);
      return response.data.data.history;
    } catch (error) {
      console.error('Error fetching ticket history:', error);
      throw error;
    }
  }

  /**
   * Get combined history (tasks + tickets) - for manager view
   */
  static async getAllHistory(filters?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
    userId?: string;
    assignedToUserId?: number;
  }): Promise<{
    history: HistoryEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.action) queryParams.append('action', filters.action);
      if (filters?.userId) queryParams.append('userId', filters.userId);
      if (filters?.assignedToUserId) queryParams.append('assignedToUserId', filters.assignedToUserId.toString());

      const url = `/history?${queryParams.toString()}`;
      console.log('Fetching all history with URL:', url);
      console.log('Filters applied:', filters);

      const response = await apiClient.get<ApiResponse<{
        history: HistoryEntry[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>>(url);

      console.log('All history response:', response.data);

      const data = response.data.data;
      return {
        history: data.history,
        total: data.pagination.total,
        page: data.pagination.page,
        totalPages: data.pagination.totalPages
      };
    } catch (error: any) {
      console.error('Error fetching all history:', error);
      console.error('Error details:', (error as any)?.response?.data || (error as any)?.message);
      throw error;
    }
  }

  /**
   * Get history for all tasks
   */
  private static async getTasksHistory(filters?: any): Promise<HistoryEntry[]> {
    try {
      // This would need a backend endpoint that returns all task histories
      // For now, we'll return empty array
      return [];
    } catch (error) {
      console.error('Error fetching tasks history:', error);
      return [];
    }
  }

  /**
   * Get history for all tickets
   */
  private static async getTicketsHistory(filters?: any): Promise<HistoryEntry[]> {
    try {
      // This would need a backend endpoint that returns all ticket histories
      // For now, we'll return empty array
      return [];
    } catch (error) {
      console.error('Error fetching tickets history:', error);
      return [];
    }
  }

  /**
   * Get history statistics
   */
  static async getHistoryStats(): Promise<{
    totalActivities: number;
    recentActivities: number;
    activitiesByAction: Array<{
      action: string;
      actionLabel: string;
      count: number;
    }>;
    mostActiveUsers: Array<{
      user: {
        id: number;
        name: string;
        role: string;
      };
      activityCount: number;
    }>;
  }> {
    try {
      console.log('Fetching history statistics');
      const response = await apiClient.get<ApiResponse<{
        totalActivities: number;
        recentActivities: number;
        activitiesByAction: Array<{
          action: string;
          actionLabel: string;
          count: number;
        }>;
        mostActiveUsers: Array<{
          user: {
            id: number;
            name: string;
            role: string;
          };
          activityCount: number;
        }>;
      }>>('/history/stats');

      console.log('History stats response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching history statistics:', error);
      console.error('Error details:', (error as any)?.response?.data || (error as any)?.message);
      throw error;
    }
  }
}

// Fallback mock data for when API calls fail - represents history of assigned tickets
export const mockHistoryData: HistoryEntry[] = [
  {
    id: 'H-001',
    taskId: 'TK-001',
    taskTitle: 'قطع برق مکرر در منطقه شهرک صدرا',
    action: 'assigned',
    user: {
      name: 'مدیر سیستم',
      role: 'مدیر'
    },
    timestamp: '1403/02/10 - 09:30',
    changes: [
      {
        field: 'مسئول',
        from: 'تعیین نشده',
        to: 'شما'
      }
    ],
    details: 'تیکت به شما واگذار شد'
  },
  {
    id: 'H-002',
    taskId: 'TK-001',
    taskTitle: 'قطع برق مکرر در منطقه شهرک صدرا',
    action: 'status_changed',
    user: {
      name: 'شما',
      role: 'مدیر'
    },
    timestamp: '1403/02/10 - 10:15',
    changes: [
      {
        field: 'وضعیت',
        from: 'واگذار شده',
        to: 'در حال انجام'
      }
    ],
    details: 'وضعیت تیکت به "در حال انجام" تغییر یافت'
  },
  {
    id: 'H-003',
    taskId: 'TK-001',
    taskTitle: 'قطع برق مکرر در منطقه شهرک صدرا',
    action: 'comment_added',
    user: {
      name: 'شما',
      role: 'مدیر'
    },
    timestamp: '1403/02/10 - 11:45',
    comment: 'بررسی اولیه انجام شد. تیم فنی اعزام شده و در حال بررسی شبکه برق منطقه هستند.',
    details: 'نظر مدیریتی اضافه شد'
  },
  {
    id: 'H-004',
    taskId: 'TK-002',
    taskTitle: 'درخواست انشعاب جدید - ساختمان تجاری',
    action: 'assigned',
    user: {
      name: 'سیستم خودکار',
      role: 'سیستم'
    },
    timestamp: '1403/02/12 - 08:20',
    changes: [
      {
        field: 'مسئول',
        from: 'تعیین نشده',
        to: 'شما'
      }
    ],
    details: 'تیکت جدید به شما واگذار شد'
  },
  {
    id: 'H-005',
    taskId: 'TK-002',
    taskTitle: 'درخواست انشعاب جدید - ساختمان تجاری',
    action: 'status_changed',
    user: {
      name: 'شما',
      role: 'مدیر'
    },
    timestamp: '1403/02/12 - 14:20',
    changes: [
      {
        field: 'وضعیت',
        from: 'واگذار شده',
        to: 'در حال انجام'
      }
    ],
    details: 'شروع بررسی درخواست انشعاب'
  },
  {
    id: 'H-006',
    taskId: 'TK-002',
    taskTitle: 'درخواست انشعاب جدید - ساختمان تجاری',
    action: 'file_attached',
    user: {
      name: 'شما',
      role: 'مدیر'
    },
    timestamp: '1403/02/12 - 16:30',
    details: 'گزارش بازدید فنی و نقشه پیشنهادی انشعاب پیوست شد'
  },
  {
    id: 'H-007',
    taskId: 'TK-003',
    taskTitle: 'نوسان ولتاژ در منطقه میدان انقلاب',
    action: 'assigned',
    user: {
      name: 'مدیر ارشد',
      role: 'مدیر'
    },
    timestamp: '1403/02/13 - 07:15',
    changes: [
      {
        field: 'مسئول',
        from: 'تکنسین',
        to: 'شما'
      }
    ],
    details: 'تیکت فوری به مدیریت شما ارجاع شد'
  },
  {
    id: 'H-008',
    taskId: 'TK-003',
    taskTitle: 'نوسان ولتاژ در منطقه میدان انقلاب',
    action: 'comment_added',
    user: {
      name: 'شما',
      role: 'مدیر'
    },
    timestamp: '1403/02/13 - 08:30',
    comment: 'اولویت بالا. تیم اضطراری تشکیل شده و در حال بررسی ترانسفورمرهای منطقه هستیم.',
    details: 'نظر اورژانسی اضافه شد'
  },
  {
    id: 'H-009',
    taskId: 'TK-001',
    taskTitle: 'قطع برق مکرر در منطقه شهرک صدرا',
    action: 'status_changed',
    user: {
      name: 'شما',
      role: 'مدیر'
    },
    timestamp: '1403/02/14 - 16:45',
    changes: [
      {
        field: 'وضعیت',
        from: 'در حال انجام',
        to: 'حل شده'
      }
    ],
    details: 'مشکل قطع برق برطرف شد و به مرحله بررسی نهایی رسید'
  },
  {
    id: 'H-010',
    taskId: 'TK-003',
    taskTitle: 'نوسان ولتاژ در منطقه میدان انقلاب',
    action: 'status_changed',
    user: {
      name: 'شما',
      role: 'مدیر'
    },
    timestamp: '1403/02/15 - 12:20',
    changes: [
      {
        field: 'وضعیت',
        from: 'ارجاع شده',
        to: 'حل شده'
      }
    ],
    details: 'مشکل نوسان ولتاژ به طور کامل برطرف شد'
  }
];
