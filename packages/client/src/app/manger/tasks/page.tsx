'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Calendar, Clock, User, FileText, MessageCircle, Upload, Plus, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'دیده نشده' | 'در حال انجام' | 'انجام شده' | 'ارجاع شده به معاونت‌های دیگر' | 'پایان با موفقیت' | 'پایان بدون نتیجه مطلوب';
  priority: 'فوری' | 'بالا' | 'متوسط' | 'پایین';
  assigned_to: string;
  due_date: string;
  category: string;
  created_at: string;
  updated_at: string;
  comments: Array<{
    id: string;
    author: string;
    author_id: string;
    content: string;
    timestamp: string;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

const mockTasks: Task[] = [
  {
    id: 'T-001',
    title: 'قطع برق منطقه شهرک صدرا',
    description: 'شکایت مشتری از قطع مکرر برق در منطقه شهرک صدرا. نیاز به بررسی شبکه برق و رفع نقص.',
    status: 'دیده نشده',
    priority: 'فوری',
    assigned_to: 'احمد محمدی',
    due_date: '1403/02/15',
    category: 'قطع برق',
    created_at: '1403/02/10',
    updated_at: '1403/02/10',
    comments: [],
    attachments: []
  },
  {
    id: 'T-002',
    title: 'درخواست انشعاب جدید',
    description: 'درخواست انشعاب برق جدید برای ساختمان تجاری در خیابان ولیعصر',
    status: 'در حال انجام',
    priority: 'متوسط',
    assigned_to: 'فاطمه احمدی',
    due_date: '1403/02/20',
    category: 'انشعاب جدید',
    created_at: '1403/02/08',
    updated_at: '1403/02/12',
    comments: [
      {
        id: 'C-001',
        author: 'فاطمه احمدی',
        author_id: '2',
        content: 'بررسی اولیه انجام شد. منتظر تایید مدیریت هستیم.',
        timestamp: '1403/02/12 - 14:30'
      }
    ],
    attachments: []
  },
  {
    id: 'T-003',
    title: 'نوسان ولتاژ در منطقه میدان انقلاب',
    description: 'گزارش چندین مشتری از نوسان ولتاژ در منطقه میدان انقلاب',
    status: 'انجام شده',
    priority: 'بالا',
    assigned_to: 'علی رضایی',
    due_date: '1403/02/12',
    category: 'نوسان ولتاژ',
    created_at: '1403/02/05',
    updated_at: '1403/02/14',
    comments: [],
    attachments: []
  }
];

const statusColors = {
  'دیده نشده': 'status-unseen',
  'در حال انجام': 'status-in-progress',
  'انجام شده': 'status-completed',
  'ارجاع شده به معاونت‌های دیگر': 'status-referred',
  'پایان با موفقیت': 'status-successful',
  'پایان بدون نتیجه مطلوب': 'status-unsuccessful'
};

const priorityColors = {
  'فوری': 'bg-red-500 text-white',
  'بالا': 'bg-orange-500 text-white',
  'متوسط': 'bg-yellow-500 text-white',
  'پایین': 'bg-green-500 text-white'
};

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('همه');
  const [filterPriority, setFilterPriority] = useState<string>('همه');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'متوسط' as Task['priority'],
    category: '',
    due_date: '',
    assigned_to: ''
  });

  const loadTasks = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      else setIsRefreshing(true);

      await new Promise(resolve => setTimeout(resolve, 500));

      const savedTasks = localStorage.getItem('crm-tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(mockTasks);
        localStorage.setItem('crm-tasks', JSON.stringify(mockTasks));
      }
    } catch (error) {
      console.error('Load tasks error:', error);
      toast.error('خطا در بارگذاری وظایف');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = filterStatus === 'همه' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'همه' || task.priority === filterPriority;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, filterStatus, filterPriority, searchTerm]);

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setIsUpdatingStatus(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, updated_at: new Date().toLocaleDateString('fa-IR') }
          : task
      );

      setTasks(updatedTasks);
      localStorage.setItem('crm-tasks', JSON.stringify(updatedTasks));

      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }

      toast.success('وضعیت وظیفه با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error('Update task status error:', error);
      toast.error('خطا در به‌روزرسانی وضعیت');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const addComment = async (taskId: string) => {
    if (!newComment.trim()) return;

    setIsAddingComment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment = {
        id: `C-${Date.now()}`,
        author: 'کاربر فعلی',
        author_id: '1',
        content: newComment.trim(),
        timestamp: new Date().toLocaleString('fa-IR')
      };

      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              comments: [...task.comments, comment],
              updated_at: new Date().toLocaleDateString('fa-IR')
            }
          : task
      );

      setTasks(updatedTasks);
      localStorage.setItem('crm-tasks', JSON.stringify(updatedTasks));

      if (selectedTask?.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          comments: [...selectedTask.comments, comment]
        });
      }

      setNewComment('');
      toast.success('نظر شما با موفقیت اضافه شد');
    } catch (error) {
      console.error('Add comment error:', error);
      toast.error('خطا در افزودن نظر');
    } finally {
      setIsAddingComment(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title.trim() || !newTask.description.trim()) {
      toast.error('عنوان و شرح وظیفه الزامی است');
      return;
    }

    setIsCreatingTask(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const taskId = `T-${Date.now()}`;
      const now = new Date().toLocaleDateString('fa-IR');

      const task: Task = {
        id: taskId,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        status: 'دیده نشده',
        priority: newTask.priority,
        assigned_to: newTask.assigned_to || 'کاربر فعلی',
        due_date: newTask.due_date || now,
        category: newTask.category || 'عمومی',
        created_at: now,
        updated_at: now,
        comments: [],
        attachments: []
      };

      const updatedTasks = [task, ...tasks];
      setTasks(updatedTasks);
      localStorage.setItem('crm-tasks', JSON.stringify(updatedTasks));

      setShowCreateDialog(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'متوسط',
        category: '',
        due_date: '',
        assigned_to: ''
      });

      toast.success('وظیفه جدید با موفقیت ایجاد شد');
    } catch (error) {
      console.error('Create task error:', error);
      toast.error('خطا در ایجاد وظیفه');
    } finally {
      setIsCreatingTask(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری وظایف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">وظایف من</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadTasks(false)}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 ml-2" />
              )}
              به‌روزرسانی
            </Button>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  وظیفه جدید
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ایجاد وظیفه جدید</DialogTitle>
                </DialogHeader>
                <form onSubmit={createTask} className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">عنوان وظیفه</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="عنوان وظیفه را وارد کنید"
                      required
                      disabled={isCreatingTask}
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-description">شرح وظیفه</Label>
                    <Textarea
                      id="task-description"
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="شرح کاملی از وظیفه ارائه دهید"
                      className="min-h-[100px]"
                      required
                      disabled={isCreatingTask}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-priority">اولویت</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as Task['priority'] }))}
                        disabled={isCreatingTask}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="فوری">فوری</SelectItem>
                          <SelectItem value="بالا">بالا</SelectItem>
                          <SelectItem value="متوسط">متوسط</SelectItem>
                          <SelectItem value="پایین">پایین</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task-category">دسته‌بندی</Label>
                      <Input
                        id="task-category"
                        value={newTask.category}
                        onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="مثال: قطع برق، نوسان ولتاژ"
                        disabled={isCreatingTask}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={isCreatingTask}
                    >
                      انصراف
                    </Button>
                    <Button type="submit" disabled={isCreatingTask}>
                      {isCreatingTask ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          در حال ایجاد...
                        </>
                      ) : (
                        'ایجاد وظیفه'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="جستجو در وظایف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="فیلتر وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="همه">همه وضعیت‌ها</SelectItem>
              <SelectItem value="دیده نشده">دیده نشده</SelectItem>
              <SelectItem value="در حال انجام">در حال انجام</SelectItem>
              <SelectItem value="انجام شده">انجام شده</SelectItem>
              <SelectItem value="ارجاع شده به معاونت‌های دیگر">ارجاع شده</SelectItem>
              <SelectItem value="پایان با موفقیت">موفق</SelectItem>
              <SelectItem value="پایان بدون نتیجه مطلوب">ناموفق</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="فیلتر اولویت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="همه">همه اولویت‌ها</SelectItem>
              <SelectItem value="فوری">فوری</SelectItem>
              <SelectItem value="بالا">بالا</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="پایین">پایین</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.status === 'دیده نشده').length}
              </div>
              <div className="text-sm text-muted-foreground">دیده نشده</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {tasks.filter(t => t.status === 'در حال انجام').length}
              </div>
              <div className="text-sm text-muted-foreground">در حال انجام</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'انجام شده' || t.status === 'پایان با موفقیت').length}
              </div>
              <div className="text-sm text-muted-foreground">تکمیل شده</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{tasks.length}</div>
              <div className="text-sm text-muted-foreground">کل وظایف</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <Card key={task.id} className="mb-4 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {task.id}
                      </Badge>
                      <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mb-2">{task.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                  <Badge className={`${statusColors[task.status]} text-xs whitespace-nowrap`}>
                    {task.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assigned_to}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{task.due_date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{task.updated_at}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{task.category}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTask(task)}
                      >
                        جزئیات
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span>{selectedTask?.title}</span>
                          <Badge className={`${selectedTask && statusColors[selectedTask.status]} text-xs`}>
                            {selectedTask?.status}
                          </Badge>
                        </DialogTitle>
                      </DialogHeader>

                      {selectedTask && (
                        <div className="space-y-6">
                          <div>
                            <Label>شرح وظیفه</Label>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {selectedTask.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>تغییر وضعیت</Label>
                              <Select
                                value={selectedTask.status}
                                onValueChange={(value) => updateTaskStatus(selectedTask.id, value as Task['status'])}
                                disabled={isUpdatingStatus}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="دیده نشده">دیده نشده</SelectItem>
                                  <SelectItem value="در حال انجام">در حال انجام</SelectItem>
                                  <SelectItem value="انجام شده">انجام شده</SelectItem>
                                  <SelectItem value="ارجاع شده به معاونت‌های دیگر">ارجاع شده به معاونت‌های دیگر</SelectItem>
                                  <SelectItem value="پایان با موفقیت">پایان با موفقیت</SelectItem>
                                  <SelectItem value="پایان بدون نتیجه مطلوب">پایان بدون نتیجه مطلوب</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>مسئول فعلی</Label>
                              <Input
                                value={selectedTask.assigned_to}
                                disabled
                                className="mt-2 bg-muted"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="flex items-center gap-2 mb-3">
                              <MessageCircle className="w-4 h-4" />
                              نظرات و گزارش‌ها ({selectedTask.comments?.length || 0})
                            </Label>

                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                              {selectedTask.comments?.map(comment => (
                                <div key={comment.id} className="bg-muted p-3 rounded-md">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">{comment.author}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {comment.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              ))}
                              {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  هنوز نظری ثبت نشده است
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Textarea
                                placeholder="نظر یا گزارش خود را اینجا بنویسید..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[80px]"
                                disabled={isAddingComment}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => addComment(selectedTask.id)}
                                  disabled={!newComment.trim() || isAddingComment}
                                >
                                  {isAddingComment ? (
                                    <>
                                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                      در حال افزودن...
                                    </>
                                  ) : (
                                    'افزودن نظر'
                                  )}
                                </Button>
                                <Button variant="outline">
                                  <Upload className="w-4 h-4 ml-2" />
                                  پیوست فایل
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Select
                    value={task.status}
                    onValueChange={(value) => updateTaskStatus(task.id, value as Task['status'])}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="دیده نشده">دیده نشده</SelectItem>
                      <SelectItem value="در حال انجام">در حال انجام</SelectItem>
                      <SelectItem value="انجام شده">انجام شده</SelectItem>
                      <SelectItem value="ارجاع شده به معاونت‌های دیگر">ارجاع شده به معاونت‌های دیگر</SelectItem>
                      <SelectItem value="پایان با موفقیت">پایان با موفقیت</SelectItem>
                      <SelectItem value="پایان بدون نتیجه مطلوب">پایان بدون نتیجه مطلوب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {tasks.length === 0 ? 'هنوز وظیفه‌ای ثبت نشده است' : 'وظیفه‌ای با این فیلترها یافت نشد'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
