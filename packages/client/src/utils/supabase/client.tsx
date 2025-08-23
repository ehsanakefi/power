import { createClient } from '@supabase/supabase-js@2';
import { projectId, publicAnonKey } from './info';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-37be09a9`;

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error for ${endpoint}:`, data);
        return { error: data.error || 'خطای نامشخص رخ داد' };
      }

      return { data };
    } catch (error) {
      console.error(`Network error for ${endpoint}:`, error);
      return { error: 'خطا در اتصال به سرور' };
    }
  }

  // Auth methods
  async signUp(email: string, password: string, name: string, role: string = 'کارشناس') {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/user');
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error: `خطا در ورود: ${error.message}` };
      }

      return { data: data.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'خطا در فرآیند ورود' };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return { error: `خطا در خروج: ${error.message}` };
      }
      return { message: 'با موفقیت خارج شدید' };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: 'خطا در فرآیند خروج' };
    }
  }

  // Task methods
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(taskData: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, updates: any) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async addComment(taskId: string, content: string) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // History methods
  async getHistory() {
    return this.request('/history');
  }

  // Analytics methods
  async getAnalytics() {
    return this.request('/analytics');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();