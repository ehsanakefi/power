'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { DrawerFooter } from '@/components/ui/drawer';

const monthlyData = [
  { month: 'فروردین', complaints: 120, requests: 80, resolved: 160, avgResponseTime: 2.3 },
  { month: 'اردیبهشت', complaints: 98, requests: 65, resolved: 140, avgResponseTime: 2.1 },
  { month: 'خرداد', complaints: 86, requests: 92, resolved: 155, avgResponseTime: 2.5 },
  { month: 'تیر', complaints: 110, requests: 75, resolved: 170, avgResponseTime: 2.0 },
  { month: 'مرداد', complaints: 134, requests: 88, resolved: 180, avgResponseTime: 2.2 },
  { month: 'شهریور', complaints: 125, requests: 95, resolved: 185, avgResponseTime: 1.9 }
];

const categoryData = [
  { name: 'قطع برق', value: 35, color: '#ef4444' },
  { name: 'نوسان ولتاژ', value: 25, color: '#f59e0b' },
  { name: 'انشعاب جدید', value: 20, color: '#10b981' },
  { name: 'قبض برق', value: 12, color: '#8b5cf6' },
  { name: 'سایر', value: 8, color: '#6b7280' }
];

const statusDistribution = [
  { status: 'پایان با موفقیت', count: 85, percentage: 68 },
  { status: 'در حال انجام', count: 25, percentage: 20 },
  { status: 'پایان بدون نتیجه', count: 10, percentage: 8 },
  { status: 'ارجاع شده', count: 5, percentage: 4 }
];

const responseTimeData = [
  { day: 'شنبه', avgTime: 1.8 },
  { day: 'یکشنبه', avgTime: 2.1 },
  { day: 'دوشنبه', avgTime: 2.3 },
  { day: 'سه‌شنبه', avgTime: 1.9 },
  { day: 'چهارشنبه', avgTime: 2.0 },
  { day: 'پنج‌شنبه', avgTime: 2.2 },
  { day: 'جمعه', avgTime: 1.5 }
];

const departmentPerformance = [
  { department: 'شعبه مرکزی', tasks: 45, success: 38, successRate: 84 },
  { department: 'شعبه شمال', tasks: 32, success: 28, successRate: 87 },
  { department: 'شعبه جنوب', tasks: 28, success: 22, successRate: 79 },
  { department: 'شعبه شرق', tasks: 35, success: 31, successRate: 89 },
  { department: 'شعبه غرب', tasks: 25, success: 20, successRate: 80 }
];

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ماهانه');
  const [selectedYear, setSelectedYear] = useState<string>('1403');

  const totalComplaints = monthlyData.reduce((sum, item) => sum + item.complaints, 0);
  const totalRequests = monthlyData.reduce((sum, item) => sum + item.requests, 0);
  const totalResolved = monthlyData.reduce((sum, item) => sum + item.resolved, 0);
  const avgResponseTime = (monthlyData.reduce((sum, item) => sum + item.avgResponseTime, 0) / monthlyData.length).toFixed(1);

  const successRate = Math.round((totalResolved / (totalComplaints + totalRequests)) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">تحلیل‌ها و گزارشات</h2>

          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="روزانه">روزانه</SelectItem>
                <SelectItem value="هفتگی">هفتگی</SelectItem>
                <SelectItem value="ماهانه">ماهانه</SelectItem>
                <SelectItem value="سالانه">سالانه</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1401">1401</SelectItem>
                <SelectItem value="1402">1402</SelectItem>
                <SelectItem value="1403">1403</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">کل شکایات</p>
                <div className="text-2xl font-bold">{totalComplaints.toLocaleString('fa-IR')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center text-red-600">
                    <TrendingUp className="h-3 w-3 ml-1" />
                    +12%
                  </span>
                  {' '}نسبت به ماه قبل
                </p>
              </div>
              <div className="h-8 w-8 bg-red-500 rounded-md flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">کل درخواست‌ها</p>
                <div className="text-2xl font-bold">{totalRequests.toLocaleString('fa-IR')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center text-green-600">
                    <TrendingDown className="h-3 w-3 ml-1" />
                    -5%
                  </span>
                  {' '}نسبت به ماه قبل
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نرخ موفقیت</p>
                <div className="text-2xl font-bold">{successRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center text-green-600">
                    <TrendingUp className="h-3 w-3 ml-1" />
                    +8%
                  </span>
                  {' '}نسبت به ماه قبل
                </p>
              </div>
              <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">میانگین پاسخگویی</p>
                <div className="text-2xl font-bold">{avgResponseTime} روز</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center text-green-600">
                    <TrendingDown className="h-3 w-3 ml-1" />
                    -0.3
                  </span>
                  {' '}روز بهتر از قبل
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-500 rounded-md flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>روند ماهانه شکایات و درخواست‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  reversed
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ direction: 'rtl' }}
                />
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="شکایات"
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="درخواست‌ها"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تقسیم‌بندی بر اساس دسته‌بندی</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>میانگین زمان پاسخگویی (روز)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  reversed
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgTime"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="میانگین زمان (روز)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>عملکرد شعب</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="department"
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="tasks" fill="#3b82f6" name="کل وظایف" />
                <Bar dataKey="success" fill="#10b981" name="موفق" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>توزیع وضعیت وظایف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={item.status === 'پایان با موفقیت' ? 'default' : 'secondary'}
                    className="min-w-[120px] justify-center"
                  >
                    {item.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {item.count} مورد
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-background rounded-full h-2">
                    <div
                      className="h-2 bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium min-w-[40px]">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
