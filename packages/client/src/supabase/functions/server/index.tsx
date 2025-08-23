import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Hono } from 'npm:hono@4.3.11';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.43.4';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Initialize Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Auth endpoints
app.post('/make-server-37be09a9/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'کارشناس' } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'ایمیل، رمز عبور و نام الزامی است' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Sign up error:', error);
      return c.json({ error: `خطا در ثبت‌نام: ${error.message}` }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
      is_active: true
    });

    return c.json({ 
      message: 'کاربر با موفقیت ثبت‌نام شد',
      user: { id: data.user.id, email, name, role }
    });
  } catch (error) {
    console.log('Sign up error:', error);
    return c.json({ error: 'خطای داخلی سرور در فرآیند ثبت‌نام' }, 500);
  }
});

// Get current user info
app.get('/make-server-37be09a9/auth/user', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'توکن احراز هویت ارائه نشده است' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'کاربر معتبر نیست' }, 401);
    }

    // Get additional user info from KV store
    const userProfile = await kv.get(`user:${user.id}`);
    
    return c.json({
      id: user.id,
      email: user.email,
      name: userProfile?.name || user.user_metadata?.name,
      role: userProfile?.role || user.user_metadata?.role || 'کارشناس'
    });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'خطا در دریافت اطلاعات کاربر' }, 500);
  }
});

// Task management endpoints
app.get('/make-server-37be09a9/tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user?.id) {
      return c.json({ error: 'احراز هویت ناموفق' }, 401);
    }

    // Get user's tasks
    const userTasks = await kv.getByPrefix(`task:user:${user.id}`);
    
    // Get all tasks if user is manager
    const userProfile = await kv.get(`user:${user.id}`);
    let allTasks = [];
    
    if (userProfile?.role === 'مدیر' || userProfile?.role === 'مدیر سیستم') {
      allTasks = await kv.getByPrefix('task:');
    }

    const tasks = [...userTasks, ...allTasks].filter((task, index, self) => 
      index === self.findIndex(t => t.id === task.id)
    );

    return c.json({ tasks: tasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)) });
  } catch (error) {
    console.log('Get tasks error:', error);
    return c.json({ error: 'خطا در دریافت وظایف' }, 500);
  }
});

app.post('/make-server-37be09a9/tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user?.id) {
      return c.json({ error: 'احراز هویت ناموفق' }, 401);
    }

    const taskData = await c.req.json();
    const taskId = `T-${Date.now()}`;
    const now = new Date().toISOString();

    const task = {
      id: taskId,
      title: taskData.title,
      description: taskData.description,
      status: 'دیده نشده',
      priority: taskData.priority || 'متوسط',
      assigned_to: taskData.assigned_to || user.id,
      category: taskData.category || 'عمومی',
      created_by: user.id,
      created_at: now,
      updated_at: now,
      due_date: taskData.due_date || null,
      comments: [],
      attachments: []
    };

    // Store task in multiple keys for efficient querying
    await kv.set(`task:${taskId}`, task);
    await kv.set(`task:user:${task.assigned_to}:${taskId}`, task);
    
    // Add to history
    await kv.set(`history:${taskId}:${Date.now()}`, {
      task_id: taskId,
      action: 'created',
      user_id: user.id,
      timestamp: now,
      details: 'وظیفه جدید ایجاد شد',
      changes: []
    });

    return c.json({ message: 'وظیفه با موفقیت ایجاد شد', task });
  } catch (error) {
    console.log('Create task error:', error);
    return c.json({ error: 'خطا در ایجاد وظیفه' }, 500);
  }
});

app.put('/make-server-37be09a9/tasks/:taskId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user?.id) {
      return c.json({ error: 'احراز هویت ناموفق' }, 401);
    }

    const taskId = c.req.param('taskId');
    const updates = await c.req.json();
    
    const existingTask = await kv.get(`task:${taskId}`);
    if (!existingTask) {
      return c.json({ error: 'وظیفه یافت نشد' }, 404);
    }

    const now = new Date().toISOString();
    const changes = [];

    // Track changes
    Object.keys(updates).forEach(key => {
      if (existingTask[key] !== updates[key]) {
        changes.push({
          field: key,
          from: existingTask[key],
          to: updates[key]
        });
      }
    });

    const updatedTask = {
      ...existingTask,
      ...updates,
      updated_at: now
    };

    // Update task in all relevant keys
    await kv.set(`task:${taskId}`, updatedTask);
    await kv.set(`task:user:${updatedTask.assigned_to}:${taskId}`, updatedTask);
    
    // Remove from old assignee if changed
    if (updates.assigned_to && updates.assigned_to !== existingTask.assigned_to) {
      await kv.del(`task:user:${existingTask.assigned_to}:${taskId}`);
    }

    // Add to history
    await kv.set(`history:${taskId}:${Date.now()}`, {
      task_id: taskId,
      action: updates.status ? 'status_changed' : 'updated',
      user_id: user.id,
      timestamp: now,
      details: updates.status ? `وضعیت به ${updates.status} تغییر یافت` : 'وظیفه به‌روزرسانی شد',
      changes
    });

    return c.json({ message: 'وظیفه با موفقیت به‌روزرسانی شد', task: updatedTask });
  } catch (error) {
    console.log('Update task error:', error);
    return c.json({ error: 'خطا در به‌روزرسانی وظیفه' }, 500);
  }
});

// Comments
app.post('/make-server-37be09a9/tasks/:taskId/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user?.id) {
      return c.json({ error: 'احراز هویت ناموفق' }, 401);
    }

    const taskId = c.req.param('taskId');
    const { content } = await c.req.json();
    
    if (!content?.trim()) {
      return c.json({ error: 'متن نظر الزامی است' }, 400);
    }

    const task = await kv.get(`task:${taskId}`);
    if (!task) {
      return c.json({ error: 'وظیفه یافت نشد' }, 404);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    const now = new Date().toISOString();
    
    const comment = {
      id: `C-${Date.now()}`,
      author: userProfile?.name || 'کاربر',
      author_id: user.id,
      content: content.trim(),
      timestamp: now
    };

    const updatedTask = {
      ...task,
      comments: [...(task.comments || []), comment],
      updated_at: now
    };

    await kv.set(`task:${taskId}`, updatedTask);
    await kv.set(`task:user:${updatedTask.assigned_to}:${taskId}`, updatedTask);

    // Add to history
    await kv.set(`history:${taskId}:${Date.now()}`, {
      task_id: taskId,
      action: 'comment_added',
      user_id: user.id,
      timestamp: now,
      details: 'نظر جدید اضافه شد',
      comment: content.trim()
    });

    return c.json({ message: 'نظر با موفقیت اضافه شد', comment });
  } catch (error) {
    console.log('Add comment error:', error);
    return c.json({ error: 'خطا در افزودن نظر' }, 500);
  }
});

// History
app.get('/make-server-37be09a9/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user?.id) {
      return c.json({ error: 'احراز هویت ناموفق' }, 401);
    }

    const historyEntries = await kv.getByPrefix('history:');
    
    // Enrich with user and task information
    const enrichedHistory = await Promise.all(
      historyEntries.map(async (entry) => {
        const userProfile = await kv.get(`user:${entry.user_id}`);
        const task = await kv.get(`task:${entry.task_id}`);
        
        return {
          ...entry,
          user: {
            name: userProfile?.name || 'کاربر نامشخص',
            role: userProfile?.role || 'کارشناس'
          },
          task_title: task?.title || 'وظیفه حذف شده'
        };
      })
    );

    return c.json({ 
      history: enrichedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) 
    });
  } catch (error) {
    console.log('Get history error:', error);
    return c.json({ error: 'خطا در دریافت تاریخچه' }, 500);
  }
});

// Analytics
app.get('/make-server-37be09a9/analytics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user?.id) {
      return c.json({ error: 'احراز هویت ناموفق' }, 401);
    }

    const allTasks = await kv.getByPrefix('task:');
    const tasks = allTasks.filter(task => task.id && task.id.startsWith('T-'));

    // Calculate analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'انجام شده' || t.status === 'پایان با موفقیت').length;
    const inProgressTasks = tasks.filter(t => t.status === 'در حال انجام').length;
    const unseenTasks = tasks.filter(t => t.status === 'دیده نشده').length;

    // Category breakdown
    const categoryStats = {};
    tasks.forEach(task => {
      categoryStats[task.category] = (categoryStats[task.category] || 0) + 1;
    });

    // Status distribution
    const statusStats = {};
    tasks.forEach(task => {
      statusStats[task.status] = (statusStats[task.status] || 0) + 1;
    });

    // Priority distribution
    const priorityStats = {};
    tasks.forEach(task => {
      priorityStats[task.priority] = (priorityStats[task.priority] || 0) + 1;
    });

    return c.json({
      summary: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        unseen_tasks: unseenTasks,
        success_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      category_stats: categoryStats,
      status_stats: statusStats,
      priority_stats: priorityStats
    });
  } catch (error) {
    console.log('Get analytics error:', error);
    return c.json({ error: 'خطا در دریافت تحلیل‌ها' }, 500);
  }
});

// Health check
app.get('/make-server-37be09a9/health', (c) => {
  return c.json({ status: 'سرور فعال است', timestamp: new Date().toISOString() });
});

// Start server
serve(app.fetch);