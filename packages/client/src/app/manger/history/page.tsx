'use client';


import React, { useState, useEffect } from 'react';
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
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { HistoryService, mockHistoryData, HistoryEntry } from '../../../services/historyService';
import { getUserProfile, UserProfile } from '../../../lib/api/profile';
import { toast } from 'sonner';




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
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Load current user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setCurrentUser(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast.error('خطا در بارگذاری اطلاعات کاربر');
      }
    };

    loadUserProfile();
  }, []);

  // Fetch combined history data for assigned tickets only
  useEffect(() => {
    if (!currentUser) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get combined history from API - filter by assigned tickets
        const result = await HistoryService.getAllHistory({
          page: 1,
          limit: 100, // Get more entries for manager view
          assignedToUserId: currentUser.id // Filter by tickets assigned to current user
        });

        if (result.history && result.history.length > 0) {
          setHistoryData(result.history);
          setUsingMockData(false);
        } else {
          // No real data available, use filtered mock data
          const filteredMockData = mockHistoryData.filter(entry =>
            // In real scenario, we'd filter by assigned tickets
            // For mock data, we'll show all for demo purposes
            true
          );
          setHistoryData(filteredMockData);
          setUsingMockData(true);
          setError('هنوز هیچ فعالیتی برای تیکت‌های واگذار شده به شما ثبت نشده است. داده‌های نمونه نمایش داده می‌شوند.');
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
        const errorMessage = (err as any)?.response?.status === 401
          ? 'لطفاً وارد سیستم شوید.'
          : 'خطا در اتصال به سرور. از داده‌های نمونه استفاده می‌شود.';
        setError(errorMessage);

        // Fallback to mock data
        const filteredMockData = mockHistoryData.filter(entry =>
          // Filter mock data to simulate assigned tickets
          true
        );
        setHistoryData(filteredMockData);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  const filteredHistory = historyData.filter(entry => {
    const matchesSearch = entry.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'همه' || entry.action === filterAction;
    const matchesUser = filterUser === 'همه' || entry.user.name === filterUser;
    const matchesTask = selectedTaskId === 'همه' || entry.taskId === selectedTaskId;

    return matchesSearch && matchesAction && matchesUser && matchesTask;
  });

  const uniqueUsers = [...new Set(historyData.map(entry => entry.user.name))];
  const uniqueTasks = [...new Set(historyData.map(entry => ({ id: entry.taskId, title: entry.taskTitle })))];

  const refreshHistory = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const result = await HistoryService.getAllHistory({
        page: 1,
        limit: 100,
        assignedToUserId: currentUser.id
      });

      if (result.history && result.history.length > 0) {
        setHistoryData(result.history);
        setUsingMockData(false);
        toast.success('تاریخچه با موفقیت به‌روزرسانی شد');
      } else {
        const filteredMockData = mockHistoryData.filter(entry => true);
        setHistoryData(filteredMockData);
        setUsingMockData(true);
        setError('هنوز هیچ فعالیتی برای تیکت‌های واگذار شده به شما ثبت نشده است.');
      }
    } catch (err) {
      console.error('Failed to refresh history:', err);
      const errorMessage = (err as any)?.response?.status === 401
        ? 'لطفاً مجدداً وارد سیستم شوید.'
        : 'خطا در به‌روزرسانی تاریخچه. لطفاً مجدداً تلاش کنید.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">در حال بارگذاری تاریخچه...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <HistoryIcon className="w-5 h-5" />
              تاریخچه تیکت‌های واگذار شده
              {usingMockData && (
                <Badge variant="outline" className="text-xs">
                  داده‌های نمونه
                </Badge>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              تاریخچه فعالیت‌های تیکت‌های واگذار شده به: <span className="font-medium">{currentUser?.name || currentUser?.phone}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshHistory}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            به‌روزرسانی
          </Button>
        </div>

        {error && (
          <div className={`border rounded-lg p-3 ${
            error.includes('وارد سیستم')
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm ${
              error.includes('وارد سیستم')
                ? 'text-red-800'
                : 'text-yellow-800'
            }`}>
              {error}
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 text-sm">در حال بارگیری تاریخچه...</p>
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <HistoryIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">تاریخچه تیکت‌های واگذار شده</h3>
                <p className="text-sm text-blue-700">
                  در این صفحه فقط تاریخچه و فعالیت‌های مربوط به تیکت‌هایی نمایش داده می‌شود که مستقیماً به شما واگذار شده‌اند.
                  شامل تغییرات وضعیت، نظرات اضافه شده و سایر فعالیت‌های انجام شده روی این تیکت‌ها.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <HistoryIcon className="w-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>هیچ تاریخچه‌ای برای تیکت‌های واگذار شده به شما یافت نشد</p>
                  <p className="text-xs mt-2 opacity-75">
                    فقط فعالیت‌های مربوط به تیکت‌هایی که به شما ({currentUser?.name || currentUser?.phone}) واگذار شده‌اند نمایش داده می‌شوند
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
