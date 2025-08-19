// Shared TypeScript types for Power CRM Client Application

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
  timestamp?: string;
}

// User Types
export interface User {
  id: number;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'CLIENT' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export interface CreateUserRequest {
  phone: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  role?: UserRole;
}

// Authentication Types
export interface LoginRequest {
  phone: string;
}

export interface VerifyRequest {
  phone: string;
  code: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Ticket Types
export interface Ticket {
  id: number;
  title: string;
  content: string;
  status: TicketStatus;
  authorId: number;
  author: {
    id: number;
    phone: string;
    role: UserRole;
  };
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = 'unseen' | 'in_progress' | 'resolved' | 'closed' | 'rejected';

export interface CreateTicketRequest {
  title: string;
  content: string;
}

export interface UpdateTicketRequest {
  title?: string;
  content?: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface TicketFilters {
  status?: TicketStatus;
  authorId?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TicketQuery extends TicketFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Ticket Log Types
export interface TicketLog {
  id: number;
  ticketId: number;
  before: Record<string, any>;
  after: Record<string, any>;
  changes: Record<string, any>;
  user: string;
  createdAt: string;
}

// Statistics Types
export interface TicketStats {
  total: number;
  unseen: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface DashboardStats {
  tickets: TicketStats;
  users?: {
    total: number;
    clients: number;
    employees: number;
    managers: number;
    admins: number;
  };
  recentActivity?: ActivityItem[];
}

// Activity Types
export interface ActivityItem {
  id: number;
  type: 'ticket_created' | 'ticket_updated' | 'status_changed' | 'user_login';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// UI State Types
export interface UIState {
  theme: 'light' | 'dark';
  language: 'fa' | 'en';
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: Record<string, boolean>;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  selection?: {
    selectedKeys: string[];
    onSelectionChange: (keys: string[]) => void;
  };
  actions?: {
    title: string;
    handler: (record: T) => void;
    icon?: React.ReactNode;
    disabled?: (record: T) => boolean;
  }[];
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: UserRole[];
  title?: string;
}

// Error Types
export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Search Types
export interface SearchState {
  query: string;
  filters: Record<string, any>;
  results: any[];
  loading: boolean;
  error?: string;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// Settings Types
export interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showPhone: boolean;
    showActivity: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'fa' | 'en';
    fontSize: 'small' | 'medium' | 'large';
  };
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Status color mappings
export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  unseen: '#ff9800',
  in_progress: '#2196f3',
  resolved: '#4caf50',
  closed: '#9e9e9e',
  rejected: '#f44336',
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  CLIENT: '#9c27b0',
  EMPLOYEE: '#2196f3',
  MANAGER: '#ff9800',
  ADMIN: '#f44336',
};

// Status labels in Persian
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  unseen: 'دیده نشده',
  in_progress: 'در حال بررسی',
  resolved: 'حل شده',
  closed: 'بسته شده',
  rejected: 'رد شده',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: 'مشتری',
  EMPLOYEE: 'کارمند',
  MANAGER: 'مدیر',
  ADMIN: 'ادمین',
};
