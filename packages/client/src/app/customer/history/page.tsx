"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/customercomponents/ui/card';
import { Button } from '@/customercomponents/ui/button';
import { Input } from '@/customercomponents/ui/input';
import { Badge } from '@/customercomponents/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/customercomponents/ui/select';
import { Separator } from '@/customercomponents/ui/separator';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { DashboardStats } from '@/customercomponents/DashboardStats';
import { RequestDetails } from '@/customercomponents/RequestDetails';

interface Request {
  id: string;
  date: string;
  description: string;
  status: 'unseen' | 'in_progress' | 'completed' | 'referred' | 'success' | 'failed';
  category: string;
  summary?: string;
}

interface RequestHistoryProps {
  onRequestSelect: (requestId: string) => void;
}

export default function RequestHistory({ onRequestSelect }: RequestHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Mock data
  const requests: Request[] = [
    {
      id: 'REQ-001',
      date: '1403/11/15',
      description: 'قطعی برق مکرر در منطقه',
      status: 'in_progress',
      category: 'قطعی برق',
      summary: 'درخواست در حال بررسی توسط تیم فنی می‌باشد'
    },
    {
      id: 'REQ-002',
      date: '1403/11/10',
      description: 'کیفیت پایین ولتاژ برق',
      status: 'completed',
      category: 'کیفیت برق',
      summary: 'مشکل برطرف و دستگاه تنظیم‌کننده نصب شد'
    },
    {
      id: 'REQ-003',
      date: '1403/11/05',
      description: 'قبض برق نادرست',
      status: 'success',
      category: 'قبض',
      summary: 'قبض اصلاح و مبلغ اضافی برگشت داده شد'
    },
    {
      id: 'REQ-004',
      date: '1403/10/28',
      description: 'درخواست نصب کنتور جدید',
      status: 'referred',
      category: 'نصب کنتور',
      summary: 'ارجاع به معاونت توسعه شبکه'
    },
    {
      id: 'REQ-005',
      date: '1403/10/20',
      description: 'شکایت از عملکرد پرسنل',
      status: 'unseen',
      category: 'شکایت',
    }
  ];

  const statusConfig = {
    unseen: { label: 'دیده نشده', color: 'secondary', icon: AlertCircle },
    in_progress: { label: 'در حال انجام', color: 'default', icon: Clock },
    completed: { label: 'انجام شده', color: 'secondary', icon: CheckCircle },
    referred: { label: 'ارجاع شده', color: 'outline', icon: FileText },
    success: { label: 'پایان با موفقیت', color: 'default', icon: CheckCircle },
    failed: { label: 'پایان بدون نتیجه', color: 'destructive', icon: XCircle }
  };

  const categories = ['همه دسته‌ها', 'قطعی برق', 'کیفیت برق', 'قبض', 'نصب کنتور', 'شکایت'];
  const dateRanges = ['همه تاریخ‌ها', 'هفته گذشته', 'ماه گذشته', 'سه ماه گذشته'];

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = searchTerm === '' ||
        request.description.includes(searchTerm) ||
        request.id.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchTerm, statusFilter, categoryFilter, requests]);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.color as any} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
  <>
    <DashboardStats />
    {/*{activeTab === 'details' && selectedRequestId && (
      <RequestDetails
        requestId={selectedRequestId}
        onBack={() => setActiveTab('history')}
      />
    )}*/}

    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2>تاریخچه درخواست‌ها</h2>
          <p className="text-muted-foreground">
            مجموع {requests.length} درخواست | {filteredRequests.length} نمایش داده شده
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="جستجو در درخواست‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category, index) => (
                  <SelectItem key={index} value={index === 0 ? 'all' : category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="بازه زمانی" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range, index) => (
                  <SelectItem key={index} value={index === 0 ? 'all' : range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3>درخواستی یافت نشد</h3>
              <p className="text-muted-foreground">
                با فیلترهای انتخابی درخواستی موجود نیست
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  {/* Request Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-muted-foreground">
                        {request.id}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {request.date}
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <Badge variant="outline" className="text-xs">
                        {request.category}
                      </Badge>
                    </div>

                    <h4 className="font-medium">{request.description}</h4>

                    {request.summary && (
                      <p className="text-sm text-muted-foreground">{request.summary}</p>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    {getStatusBadge(request.status)}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestSelect(request.id)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      مشاهده جزئیات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  </>
    );
}
