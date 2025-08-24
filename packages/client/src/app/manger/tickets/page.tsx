'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Calendar, Clock, User, FileText, MessageCircle, Upload, Plus, Loader2, RefreshCw, ChevronLeft, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import {
  CustomerTicket,
  getTickets,
  ticketsApi,
  getStatusLabel,
  getPriorityLabel,
  getTypeLabel,
  toPersianDate,
  TicketComment,
  getTicketComments,
  addTicketComment
} from '../../../lib/api/tickets';
import { getUserProfile, UserProfile } from '../../../lib/api/profile';

// Mock tickets for fallback data - will be filtered by assigneeId
const mockTickets: CustomerTicket[] = [
  {
    id: 1,
    ticketNumber: 'TK-001',
    title: 'قطع برق مکرر در منطقه شهرک صدرا',
    description: 'شکایت از قطع مکرر برق در منطقه شهرک صدرا. مشتری گزارش داده که روزانه 3-4 بار قطع برق رخ می‌دهد. نیاز به بازرسی شبکه برق و شناسایی نقاط ضعف.',
    status: 'ASSIGNED',
    priority: 'HIGH',
    type: 'COMPLAINT',
    source: 'PHONE',
    authorId: 1,
    assigneeId: undefined, // Will be set to current user in loadTickets
    customerName: 'احمد رضایی',
    customerPhone: '09121234567',
    customerEmail: 'ahmad@email.com',
    customerAddress: 'شهرک صدرا، خیابان گلستان، پلاک 15',
    customerArea: 'منطقه 2',
    meterNumber: 'M001234',
    accountNumber: 'A001234',
    tags: 'قطع برق,فوری,شبکه',
    attachmentCount: 2,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    author: {
      id: 1,
      phone: '09121234567',
      name: 'احمد رضایی',
      role: 'customer'
    },
    assignee: {
      id: 0, // Will be set to current user
      phone: '',
      name: '',
      role: 'manager'
    }
  },
  {
    id: 2,
    ticketNumber: 'TK-002',
    title: 'درخواست انشعاب جدید - ساختمان تجاری',
    description: 'درخواست انشعاب برق جدید برای ساختمان تجاری در خیابان ولیعصر. نیاز به بررسی ظرفیت شبکه و تهیه نقشه انشعاب.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    type: 'REQUEST',
    source: 'WEBSITE',
    authorId: 3,
    assigneeId: undefined, // Will be set to current user
    customerName: 'محمد کریمی',
    customerPhone: '09135555555',
    customerEmail: 'karimi@email.com',
    customerAddress: 'خیابان ولیعصر، نرسیده به میدان ونک، پلاک 120',
    customerArea: 'منطقه 1',
    accountNumber: 'A002345',
    tags: 'انشعاب,تجاری,بررسی',
    attachmentCount: 1,
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-16T11:45:00Z',
    author: {
      id: 3,
      phone: '09135555555',
      name: 'محمد کریمی',
      role: 'customer'
    },
    assignee: {
      id: 0, // Will be set to current user
      phone: '',
      name: '',
      role: 'manager'
    }
  },
  {
    id: 3,
    ticketNumber: 'TK-003',
    title: 'نوسان ولتاژ در منطقه میدان انقلاب',
    description: 'گزارش چندین مشتری از نوسان ولتاژ در منطقه میدان انقلاب. نیاز به بررسی ترانسفورمرها و تنظیم ولتاژ.',
    status: 'ESCALATED',
    priority: 'URGENT',
    type: 'TECHNICAL',
    source: 'CALL_CENTER',
    authorId: 4,
    assigneeId: undefined, // Will be set to current user
    customerName: 'زهرا احمدی',
    customerPhone: '09187654321',
    customerEmail: 'z.ahmadi@email.com',
    customerAddress: 'میدان انقلاب، خیابان کریمخان، پلاک 88',
    customerArea: 'منطقه 6',
    meterNumber: 'M003456',
    accountNumber: 'A003456',
    tags: 'نوسان ولتاژ,ترانسفورمر,فوری',
    attachmentCount: 3,
    createdAt: '2024-01-13T14:20:00Z',
    updatedAt: '2024-01-17T09:30:00Z',
    author: {
      id: 4,
      phone: '09187654321',
      name: 'زهرا احمدی',
      role: 'customer'
    },
    assignee: {
      id: 0, // Will be set to current user
      phone: '',
      name: '',
      role: 'manager'
    }
  }
];

const statusColors: { [key: string]: string } = {
  'OPEN': 'bg-blue-100 text-blue-800',
  'ASSIGNED': 'bg-yellow-100 text-yellow-800',
  'IN_PROGRESS': 'bg-orange-100 text-orange-800',
  'PENDING_INFO': 'bg-purple-100 text-purple-800',
  'RESOLVED': 'bg-green-100 text-green-800',
  'CLOSED': 'bg-gray-100 text-gray-800',
  'REJECTED': 'bg-red-100 text-red-800',
  'ESCALATED': 'bg-indigo-100 text-indigo-800',
  'ON_HOLD': 'bg-gray-100 text-gray-600'
};

const priorityColors: { [key: string]: string } = {
  'LOW': 'bg-green-500 text-white',
  'MEDIUM': 'bg-yellow-500 text-white',
  'HIGH': 'bg-orange-500 text-white',
  'URGENT': 'bg-red-500 text-white',
  'CRITICAL': 'bg-red-700 text-white'
};

const typeColors: { [key: string]: string } = {
  'COMPLAINT': 'bg-red-100 text-red-800',
  'REQUEST': 'bg-blue-100 text-blue-800',
  'INQUIRY': 'bg-green-100 text-green-800',
  'TECHNICAL': 'bg-purple-100 text-purple-800',
  'BILLING': 'bg-yellow-100 text-yellow-800',
  'CONNECTION': 'bg-indigo-100 text-indigo-800',
  'MAINTENANCE': 'bg-gray-100 text-gray-800'
};

export default function TicketManager() {
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('همه');
  const [filterPriority, setFilterPriority] = useState<string>('همه');
  const [filterType, setFilterType] = useState<string>('همه');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<CustomerTicket | null>(null);
  const [ticketComments, setTicketComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState<string>('');
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchTerm(value);
          setCurrentPage(1);
        }, 500);
      };
    })(),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const loadTickets = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      else setIsRefreshing(true);

      // Ensure we have current user info
      if (!currentUser) {
        console.warn('No current user found, cannot filter tickets');
        return;
      }

      // Build filters for API call - only show tickets assigned to current user
      const filters: any = {
        assigneeId: currentUser.id // Filter by current user's ID
      };
      if (filterStatus !== 'همه') {
        // Map Persian status to English
        const statusMap: { [key: string]: string } = {
          'باز': 'OPEN',
          'واگذار شده': 'ASSIGNED',
          'در حال انجام': 'IN_PROGRESS',
          'در انتظار اطلاعات': 'PENDING_INFO',
          'حل شده': 'RESOLVED',
          'بسته شده': 'CLOSED',
          'رد شده': 'REJECTED',
          'ارجاع شده': 'ESCALATED',
          'در انتظار': 'ON_HOLD'
        };
        filters.status = statusMap[filterStatus];
      }

      if (filterPriority !== 'همه') {
        const priorityMap: { [key: string]: string } = {
          'کم': 'LOW',
          'متوسط': 'MEDIUM',
          'زیاد': 'HIGH',
          'فوری': 'URGENT',
          'بحرانی': 'CRITICAL'
        };
        filters.priority = priorityMap[filterPriority];
      }

      if (filterType !== 'همه') {
        const typeMap: { [key: string]: string } = {
          'شکایت': 'COMPLAINT',
          'درخواست': 'REQUEST',
          'استعلام': 'INQUIRY',
          'فنی': 'TECHNICAL',
          'قبض': 'BILLING',
          'اتصال': 'CONNECTION',
          'نگهداری': 'MAINTENANCE'
        };
        filters.type = typeMap[filterType];
      }

      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const response = await getTickets({
        page: currentPage,
        limit: 10,
        ...filters
      });

      setTickets(response.tickets);
      setTotalPages(response.pagination.totalPages);

    } catch (error) {
      console.error('Load tickets error:', error);
      toast.error('خطا در بارگذاری تیکت‌ها. از داده‌های آفلاین استفاده می‌شود.');
      // Fallback to mock data on error - assign current user to tickets
      const updatedMockTickets = mockTickets.map(ticket => ({
        ...ticket,
        assigneeId: currentUser?.id,
        assignee: {
          id: currentUser?.id || 0,
          phone: currentUser?.phone || '',
          name: currentUser?.name || currentUser?.phone || 'نامشخص',
          role: currentUser?.role || 'manager'
        }
      }));
      setTickets(updatedMockTickets);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

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

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [currentUser, currentPage, filterStatus, filterPriority, filterType, searchTerm]);

  // Handle filter changes and reset to first page
  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handlePriorityChange = (value: string) => {
    setFilterPriority(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadTickets(false);
  };

  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const updatedTicket = await ticketsApi.updateStatus(ticketId, newStatus);

      if (updatedTicket.data.success) {
        // Update local state
        const updatedTickets = tickets.map(ticket =>
          ticket.id === ticketId ? updatedTicket.data.data!.ticket : ticket
        );
        setTickets(updatedTickets);

        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(updatedTicket.data.data!.ticket);
        }

        toast.success('وضعیت تیکت با موفقیت بروزرسانی شد');
      }
    } catch (error) {
      console.error('Update ticket status error:', error);
      toast.error('خطا در بروزرسانی وضعیت تیکت');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleTicketClick = async (ticket: CustomerTicket) => {
    setSelectedTicket(ticket);
    setShowTicketDialog(true);

    // Load comments for the selected ticket
    try {
      const comments = await getTicketComments(ticket.id);
      setTicketComments(comments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setTicketComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    setIsAddingComment(true);
    try {
      const comment = await addTicketComment(selectedTicket.id, newComment.trim());
      setTicketComments([...ticketComments, comment]);
      setNewComment('');
      toast.success('نظر با موفقیت اضافه شد');
    } catch (error) {
      console.error('Add comment error:', error);
      toast.error('خطا در افزودن نظر');
    } finally {
      setIsAddingComment(false);
    }
  };

  if (isLoading || !currentUser) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">در حال بارگذاری تیکت‌ها...</span>
    </div>
  );
}

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مدیریت تیکت‌ها</h1>
          <p className="text-sm text-gray-600 mt-1">
            تیکت‌های واگذار شده به: <span className="font-medium">{currentUser?.name || currentUser?.phone}</span>
          </p>
          <p className="text-xs text-gray-500">
            فقط تیکت‌هایی که مستقیماً به شما واگذار شده‌اند در این لیست نمایش داده می‌شوند
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'در حال بروزرسانی...' : 'بروزرسانی'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">کل تیکت‌ها</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">در انتظار</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">در حال انجام</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING_INFO').length}
                </p>
              </div>
              <Loader2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تکمیل شده</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">تیکت‌های واگذار شده</h3>
              <p className="text-sm text-blue-700">
                در این صفحه فقط تیکت‌هایی نمایش داده می‌شوند که مستقیماً به شما واگذار شده‌اند.
                شما می‌توانید وضعیت این تیکت‌ها را تغییر دهید، نظرات اضافه کنید و جزئیات کامل هر تیکت را مشاهده کنید.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>فیلترها و جستجو</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>جستجو</Label>
              <Input
                placeholder="جستجو در عنوان، شماره تیکت یا توضیحات..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select value={filterStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="همه">همه</SelectItem>
                  <SelectItem value="باز">باز</SelectItem>
                  <SelectItem value="واگذار شده">واگذار شده</SelectItem>
                  <SelectItem value="در حال انجام">در حال انجام</SelectItem>
                  <SelectItem value="در انتظار اطلاعات">در انتظار اطلاعات</SelectItem>
                  <SelectItem value="حل شده">حل شده</SelectItem>
                  <SelectItem value="بسته شده">بسته شده</SelectItem>
                  <SelectItem value="رد شده">رد شده</SelectItem>
                  <SelectItem value="ارجاع شده">ارجاع شده</SelectItem>
                  <SelectItem value="در انتظار">در انتظار</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اولویت</Label>
              <Select value={filterPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب اولویت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="همه">همه</SelectItem>
                  <SelectItem value="کم">کم</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="زیاد">زیاد</SelectItem>
                  <SelectItem value="فوری">فوری</SelectItem>
                  <SelectItem value="بحرانی">بحرانی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع</Label>
              <Select value={filterType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="همه">همه</SelectItem>
                  <SelectItem value="شکایت">شکایت</SelectItem>
                  <SelectItem value="درخواست">درخواست</SelectItem>
                  <SelectItem value="استعلام">استعلام</SelectItem>
                  <SelectItem value="فنی">فنی</SelectItem>
                  <SelectItem value="قبض">قبض</SelectItem>
                  <SelectItem value="اتصال">اتصال</SelectItem>
                  <SelectItem value="نگهداری">نگهداری</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">هیچ تیکت واگذار شده‌ای یافت نشد</p>
              <p className="text-xs text-gray-400 mt-2">
                این صفحه فقط تیکت‌هایی را نمایش می‌دهد که مستقیماً به شما (<span className="font-medium">{currentUser?.name || currentUser?.phone}</span>) واگذار شده‌اند
              </p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTicketClick(ticket)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {ticket.ticketNumber}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{ticket.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{ticket.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{toPersianDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={statusColors[ticket.status] || 'bg-blue-100 text-blue-800'}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                    <Badge className={priorityColors[ticket.priority] || 'bg-yellow-500 text-white'}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                    <Badge className={typeColors[ticket.type] || 'bg-blue-100 text-blue-800'} variant="outline">
                      {getTypeLabel(ticket.type)}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {ticket.assignee && (
                      <span>واگذار شده به: {ticket.assignee.name}</span>
                    )}
                    {ticket.attachmentCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {ticket.attachmentCount} فایل
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">باز</SelectItem>
                        <SelectItem value="ASSIGNED">واگذار شده</SelectItem>
                        <SelectItem value="IN_PROGRESS">در حال انجام</SelectItem>
                        <SelectItem value="PENDING_INFO">در انتظار اطلاعات</SelectItem>
                        <SelectItem value="RESOLVED">حل شده</SelectItem>
                        <SelectItem value="CLOSED">بسته شده</SelectItem>
                        <SelectItem value="REJECTED">رد شده</SelectItem>
                        <SelectItem value="ESCALATED">ارجاع شده</SelectItem>
                        <SelectItem value="ON_HOLD">در انتظار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronRight className="h-4 w-4" />
            قبلی
          </Button>
          <span className="px-4 py-2 text-sm">
            صفحه {currentPage} از {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            بعدی
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              جزئیات تیکت - {selectedTicket?.ticketNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">اطلاعات تیکت</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">عنوان</Label>
                      <p className="text-sm mt-1">{selectedTicket.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">توضیحات</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">وضعیت</Label>
                        <div className="mt-1">
                          <Badge className={statusColors[selectedTicket.status] || 'bg-blue-100 text-blue-800'}>
                            {getStatusLabel(selectedTicket.status)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">اولویت</Label>
                        <div className="mt-1">
                          <Badge className={priorityColors[selectedTicket.priority] || 'bg-yellow-500 text-white'}>
                            {getPriorityLabel(selectedTicket.priority)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">نوع</Label>
                      <div className="mt-1">
                        <Badge className={typeColors[selectedTicket.type] || 'bg-blue-100 text-blue-800'} variant="outline">
                          {getTypeLabel(selectedTicket.type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">تاریخ ایجاد</Label>
                        <p className="text-sm mt-1">{toPersianDate(selectedTicket.createdAt)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">آخرین بروزرسانی</Label>
                        <p className="text-sm mt-1">{toPersianDate(selectedTicket.updatedAt)}</p>
                      </div>
                    </div>
                    {selectedTicket.tags && (
                      <div>
                        <Label className="text-sm font-medium">برچسب‌ها</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTicket.tags.split(',').map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">اطلاعات مشتری</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">نام</Label>
                      <p className="text-sm mt-1">{selectedTicket.customerName}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-sm font-medium">تلفن</Label>
                        <p className="text-sm mt-1 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedTicket.customerPhone}
                        </p>
                      </div>
                      {selectedTicket.customerEmail && (
                        <div>
                          <Label className="text-sm font-medium">ایمیل</Label>
                          <p className="text-sm mt-1 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {selectedTicket.customerEmail}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedTicket.customerAddress && (
                      <div>
                        <Label className="text-sm font-medium">آدرس</Label>
                        <p className="text-sm mt-1 flex items-start gap-1">
                          <MapPin className="h-3 w-3 mt-1 flex-shrink-0" />
                          {selectedTicket.customerAddress}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTicket.meterNumber && (
                        <div>
                          <Label className="text-sm font-medium">شماره کنتور</Label>
                          <p className="text-sm mt-1">{selectedTicket.meterNumber}</p>
                        </div>
                      )}
                      {selectedTicket.accountNumber && (
                        <div>
                          <Label className="text-sm font-medium">شماره حساب</Label>
                          <p className="text-sm mt-1">{selectedTicket.accountNumber}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Update */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">تغییر وضعیت</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-center">
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">باز</SelectItem>
                        <SelectItem value="ASSIGNED">واگذار شده</SelectItem>
                        <SelectItem value="IN_PROGRESS">در حال انجام</SelectItem>
                        <SelectItem value="PENDING_INFO">در انتظار اطلاعات</SelectItem>
                        <SelectItem value="RESOLVED">حل شده</SelectItem>
                        <SelectItem value="CLOSED">بسته شده</SelectItem>
                        <SelectItem value="REJECTED">رد شده</SelectItem>
                        <SelectItem value="ESCALATED">ارجاع شده</SelectItem>
                        <SelectItem value="ON_HOLD">در انتظار</SelectItem>
                      </SelectContent>
                    </Select>
                    {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    نظرات و گزارشات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ticketComments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">هنوز نظری ثبت نشده است</p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {ticketComments.map((comment) => (
                          <div key={comment.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{comment.user.name}</span>
                              <span className="text-xs text-gray-500">{toPersianDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="space-y-3 border-t pt-4">
                      <Label>افزودن نظر جدید</Label>
                      <Textarea
                        placeholder="نظر خود را بنویسید..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isAddingComment}
                        className="w-full"
                      >
                        {isAddingComment ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            در حال افزودن...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 ml-2" />
                            افزودن نظر
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
