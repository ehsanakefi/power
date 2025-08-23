"use client";

import React from 'react';
import {
  Activity,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Calendar,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../admincomponents/ui/card';
import { Badge } from '../../../admincomponents/ui/badge';
import { Progress } from '../../../admincomponents/ui/progress';
import { Button } from '../../../admincomponents/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../admincomponents/ui/tabs';

export default function SystemDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">داشبورد مدیریت</h1>
          <p className="text-muted-foreground">
            خوش آمدید، آقای احمدی - آخرین وضعیت سیستم CRM شرکت توزیع برق
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>پنجشنبه، ۱ بهمن ۱۴۰۳</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">شکایات جدید امروز</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-700 dark:text-blue-400">۴۲</div>
            <p className="text-xs text-muted-foreground">
              +۱۲% نسبت به دیروز
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">شکایات حل شده</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-700 dark:text-green-400">۱۵۸</div>
            <p className="text-xs text-muted-foreground">
              ۸۵% نرخ حل مسئله
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">شکایات در انتظار</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-700 dark:text-orange-400">۲۳</div>
            <p className="text-xs text-muted-foreground">
              میانگین انتظار: ۱.۲ ساعت
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">کاربران آنلاین</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-700 dark:text-purple-400">۳۷</div>
            <p className="text-xs text-muted-foreground">
              از ۱۴۲ کاربر کل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-1 w-full">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="tasks">وظایف امروز</TabsTrigger>
          <TabsTrigger value="performance">عملکرد تیم</TabsTrigger>
          <TabsTrigger value="alerts">هشدارها</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  آخرین فعالیت‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">شکایت #۱۲۳۴ حل شد</p>
                    <p className="text-xs text-muted-foreground">توسط محمد رضایی - ۵ دقیقه پیش</p>
                  </div>
                  <Badge variant="secondary">حل شده</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">شکایت جدید دریافت شد</p>
                    <p className="text-xs text-muted-foreground">قطعی برق - منطقه شهرک غرب - ۱۰ دقیقه پیش</p>
                  </div>
                  <Badge variant="outline">جدید</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">تخصیص شکایت به تیم فنی</p>
                    <p className="text-xs text-muted-foreground">شکایت #۱۲۳۲ - ۱۵ دقیقه پیش</p>
                  </div>
                  <Badge variant="secondary">تخصیص</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">بروزرسانی سیستم</p>
                    <p className="text-xs text-muted-foreground">نسخه ۲.۱.۳ نصب شد - ۳۰ دقیقه پیش</p>
                  </div>
                  <Badge variant="outline">سیستم</Badge>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  وضعیت سیستم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>استفاده از سرور</span>
                    <span>۷۲%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>پردازش پیام‌ها</span>
                    <span>۹۵%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>دقت هوش مصنوعی</span>
                    <span>۸۸%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>زمان پاسخگویی</span>
                    <span>۹۲%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>وظایف امروز</CardTitle>
                <CardDescription>لیست کارهای در انتظار و اولویت‌دار</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-4 h-4 border-2 border-orange-500 rounded"></div>
                  <div className="flex-1">
                    <p className="text-sm">بررسی شکایات اولویت بالا</p>
                    <p className="text-xs text-muted-foreground">۸ مورد در انتظار بررسی</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    اولویت بالا
                  </Badge>
                </div>

                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                  <div className="flex-1">
                    <p className="text-sm">بروزرسانی چارت سازمانی</p>
                    <p className="text-xs text-muted-foreground">اضافه کردن کارمندان جدید</p>
                  </div>
                  <Badge variant="secondary">متوسط</Badge>
                </div>

                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm line-through opacity-60">تنظیم کردن لیبل‌های جدید</p>
                    <p className="text-xs text-muted-foreground">تکمیل شده</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    انجام شده
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>عملکرد تیم‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">تیم پشتیبانی فنی</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-20 h-2" />
                    <span className="text-sm">۸۵%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">تیم خدمات مشتریان</span>
                  <div className="flex items-center gap-2">
                    <Progress value={92} className="w-20 h-2" />
                    <span className="text-sm">۹۲%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">تیم عملیات</span>
                  <div className="flex items-center gap-2">
                    <Progress value={78} className="w-20 h-2" />
                    <span className="text-sm">۷۸%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>کارمندان برتر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white text-xs">
                    ۱
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">محمد رضایی</p>
                    <p className="text-xs text-muted-foreground">۳۲ شکایت حل شده</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    طلایی
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                    ۲
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">فاطمه احمدی</p>
                    <p className="text-xs text-muted-foreground">۲۸ شکایت حل شده</p>
                  </div>
                  <Badge variant="secondary">نقره‌ای</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs">
                    ۳
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">علی حسینی</p>
                    <p className="text-xs text-muted-foreground">۲۴ شکایت حل شده</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    برنزی
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  هشدار: افزایش شکایات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 dark:text-red-300">
                  تعداد شکایات امروز ۲۵% بیشتر از میانگین هفتگی است. احتمال مشکل در شبکه برق منطقه ۵.
                </p>
                <Button size="sm" className="mt-3" variant="outline">
                  بررسی جزئیات
                </Button>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <Clock className="w-5 h-5" />
                  توجه: زمان پاسخگویی بالا
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  میانگین زمان پاسخگویی در ۲ ساعت گذشته به ۳.۵ ساعت رسیده است.
                </p>
                <Button size="sm" className="mt-3" variant="outline">
                  مشاهده گزارش
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                  اطلاعیه: بروزرسانی سیستم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  بروزرسانی جدید سیستم CRM فردا ساعت ۲۴:۰۰ انجام خواهد شد. مدت زمان تخمینی: ۳۰ دقیقه.
                </p>
                <Button size="sm" className="mt-3" variant="outline">
                  اطلاعات بیشتر
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
