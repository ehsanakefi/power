'use client';


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { ScrollArea } from '../../../components/ui/scroll-area';
import {
  History as HistoryIcon,
  User,
  Calendar,
  Edit,
  MessageCircle,
  FileText,
  ArrowRight,
  Clock,
  Search
} from 'lucide-react';

interface HistoryEntry {
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

const mockHistoryData: HistoryEntry[] = [
  {
    id: 'H-001',
    taskId: 'T-001',
    taskTitle: 'قطع برق منطقه شهرک صدرا',
    action: 'created',
    user: {
      name: 'سیستم خودکار',
      role: 'سیستم'
    },
    timestamp: '1403/02/10 - 09:15',
    details: 'وظیفه جدید از طریق SMS ایجاد شد'
  },
  {
    id: 'H-002',
    taskId: 'T-001',
    taskTitle: 'قطع برق منطقه شهرک صدرا',
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
        to: 'احمد محمدی'
      }
    ],
    details: 'وظیفه به احمد محمدی واگذار شد'
  },
  {
    id: 'H-003',
    taskId: 'T-002',
    taskTitle: 'درخواست انشعاب جدید',
    action: 'status_changed',
    user: {
      name: 'فاطمه احمدی',
      role: 'کارشناس'
    },
    timestamp: '1403/02/12 - 14:20',
    changes: [
      {
        field: 'وضعیت',
        from: 'دیده نشده',
        to: 'در حال انجام'
      }
    ],
    details: 'وضعیت وظیفه به "در حال انجام" تغییر یافت'
  },
  {
    id: 'H-004',
    taskId: 'T-002',
    taskTitle: 'درخواست انشعاب جدید',
    action: 'comment_added',
    user: {
      name: 'فاطمه احمدی',
      role: 'کارشناس'
    },
    timestamp: '1403/02/12 - 14:30',
    comment: 'بررسی اولیه انجام شد. منتظر تایید مدیریت هستیم.',
    details: 'نظر جدید اضافه شد'
  },
  {
    id: 'H-005',
    taskId: 'T-003',
    taskTitle: 'نوسان ولتاژ در منطقه میدان انقلاب',
    action: 'status_changed',
    user: {
      name: 'علی رضایی',
      role: 'تکنسین'
    },
    timestamp: '1403/02/14 - 16:45',
    changes: [
      {
        field: 'وضعیت',
        from: 'در حال انجام',
        to: 'انجام شده'
      }
    ],
    details: 'مشکل نوسان ولتاژ برطرف شد'
  },
  {
    id: 'H-006',
    taskId: 'T-001',
    taskTitle: 'قطع برق منطقه شهرک صدرا',
    action: 'file_attached',
    user: {
      name: 'احمد محمدی',
      role: 'کارشناس'
    },
    timestamp: '1403/02/14 - 11:20',
    details: 'فایل گزارش فنی به وظیفه پیوست شد'
  }
];

const actionIcons = {
  created: <FileText className="w-4 h-4" />,
  status_changed: <Edit className="w-4 h-4" />,
  assigned: <User className="w-4 h-4" />,
  comment_added: <MessageCircle className="w-4 h-4" />,
  file_attached: <FileText className="w-4 h-4" />,
  updated: <Edit className="w-4 h-4" />
};

const actionColors = {
  created: 'text-blue-600',
  status_changed: 'text-amber-600',
  assigned: 'text-purple-600',
  comment_added: 'text-green-600',
  file_attached: 'text-indigo-600',
  updated: 'text-gray-600'
};

const actionLabels = {
  created: 'ایجاد شده',
  status_changed: 'تغییر وضعیت',
  assigned: 'واگذاری',
  comment_added: 'نظر افزوده شد',
  file_attached: 'فایل پیوست شد',
  updated: 'به‌روزرسانی شد'
};

export default function History() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('همه');
  const [filterUser, setFilterUser] = useState<string>('همه');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('همه');

  const filteredHistory = mockHistoryData.filter(entry => {
    const matchesSearch = entry.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'همه' || entry.action === filterAction;
    const matchesUser = filterUser === 'همه' || entry.user.name === filterUser;
    const matchesTask = selectedTaskId === 'همه' || entry.taskId === selectedTaskId;

    return matchesSearch && matchesAction && matchesUser && matchesTask;
  });

  const uniqueUsers = [...new Set(mockHistoryData.map(entry => entry.user.name))];
  const uniqueTasks = [...new Set(mockHistoryData.map(entry => ({ id: entry.taskId, title: entry.taskTitle })))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HistoryIcon className="w-5 h-5" />
          تاریخچه و رهگیری تغییرات
        </h2>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو در تاریخچه..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue placeholder="نوع عملیات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="همه">همه عملیات‌ها</SelectItem>
              <SelectItem value="created">ایجاد شده</SelectItem>
              <SelectItem value="status_changed">تغییر وضعیت</SelectItem>
              <SelectItem value="assigned">واگذاری</SelectItem>
              <SelectItem value="comment_added">نظر افزوده شد</SelectItem>
              <SelectItem value="file_attached">فایل پیوست شد</SelectItem>
              <SelectItem value="updated">به‌روزرسانی شد</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger>
              <SelectValue placeholder="کاربر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="همه">همه کاربران</SelectItem>
              {uniqueUsers.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
            <SelectTrigger>
              <SelectValue placeholder="وظیفه" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="همه">همه وظایف</SelectItem>
              {uniqueTasks.map(task => (
                <SelectItem key={task.id} value={task.id}>
                  {task.id} - {task.title.substring(0, 30)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockHistoryData.filter(h => h.action === 'created').length}
              </div>
              <div className="text-sm text-muted-foreground">وظایف ایجاد شده</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {mockHistoryData.filter(h => h.action === 'status_changed').length}
              </div>
              <div className="text-sm text-muted-foreground">تغییرات وضعیت</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockHistoryData.filter(h => h.action === 'comment_added').length}
              </div>
              <div className="text-sm text-muted-foreground">نظرات افزوده شده</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {uniqueUsers.length}
              </div>
              <div className="text-sm text-muted-foreground">کاربران فعال</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            تاریخچه فعالیت‌ها ({filteredHistory.length.toLocaleString('fa-IR')} مورد)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((entry, index) => (
                  <div key={entry.id}>
                    <div className="flex gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full bg-background border-2 ${actionColors[entry.action]} border-current`}>
                          {actionIcons[entry.action]}
                        </div>
                        {index < filteredHistory.length - 1 && (
                          <div className="w-px h-16 bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <Card className="shadow-sm">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {entry.taskId}
                                    </Badge>
                                    <Badge className={`text-xs ${actionColors[entry.action]} bg-transparent border-current`}>
                                      {actionLabels[entry.action]}
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium text-sm mb-1">
                                    {entry.taskTitle}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.details}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {entry.timestamp}
                                </div>
                              </div>

                              {/* Changes */}
                              {entry.changes && entry.changes.length > 0 && (
                                <div className="bg-muted p-3 rounded-lg">
                                  <div className="text-xs font-medium text-muted-foreground mb-2">
                                    تغییرات:
                                  </div>
                                  <div className="space-y-2">
                                    {entry.changes.map((change, changeIndex) => (
                                      <div key={changeIndex} className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">{change.field}:</span>
                                        <Badge variant="outline" className="text-xs">
                                          {change.from}
                                        </Badge>
                                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                        <Badge className="text-xs bg-green-100 text-green-800">
                                          {change.to}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Comment */}
                              {entry.comment && (
                                <div className="bg-blue-50 p-3 rounded-lg border-r-2 border-blue-200">
                                  <div className="text-xs font-medium text-blue-600 mb-1">
                                    نظر:
                                  </div>
                                  <p className="text-sm text-blue-800">
                                    {entry.comment}
                                  </p>
                                </div>
                              )}

                              {/* User info */}
                              <div className="flex items-center gap-2 pt-2 border-t">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={entry.user.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {entry.user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {entry.user.name}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {entry.user.role}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>هیچ تاریخچه‌ای برای فیلترهای انتخابی یافت نشد</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
