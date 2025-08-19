// Common API Response Types
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
export interface UserResponse {
  id: number;
  phone: string;
  role: import('@prisma/client').UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  phone: string;
  role?: import('@prisma/client').UserRole;
}

export interface UpdateUserRequest {
  role?: import('@prisma/client').UserRole;
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
  user: UserResponse;
  token: string;
}

export interface TokenPayload {
  id: number;
  phone: string;
  role: import('@prisma/client').UserRole;
  iat?: number;
  exp?: number;
}

// Ticket Types
export interface TicketResponse {
  id: number;
  title: string;
  content: string;
  status: string;
  authorId: number;
  author: UserResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketRequest {
  title: string;
  content: string;
  authorId?: number; // Optional for SMS-created tickets
}

export interface UpdateTicketRequest {
  title?: string;
  content?: string;
  status?: string;
}

// Log Types
export interface LogResponse {
  id: number;
  ticketId: number;
  before: Record<string, any>;
  after: Record<string, any>;
  changes: Record<string, any>;
  user: string;
  createdAt: Date;
}

// Query Parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketQuery extends PaginationQuery {
  status?: string;
  authorId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserQuery extends PaginationQuery {
  role?: string;
  search?: string;
}

// SMS Types
export interface SMSMessage {
  to: string;
  message: string;
  sender?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Database Connection Types
export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError {
  name: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
  stack?: string;
}

// Middleware Types
export interface AuthenticatedRequest extends Express.Request {
  user?: UserResponse;
}

// Configuration Types
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  smsApiUrl?: string;
  smsApiKey?: string;
  smsSender: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Export Prisma types for convenience
export type {
  User,
  Ticket,
  Log,
  UserRole,
  Prisma
} from '@prisma/client';
