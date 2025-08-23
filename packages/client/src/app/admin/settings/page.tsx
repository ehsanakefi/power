"use client";

import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Bell,
  Mail,
  MessageSquare,
  Zap,
  Database,
  Shield,
  Palette,
  Globe,
  Calendar,
  Clock,
  Upload
} from 'lucide-react';
import { Button } from '../../../admincomponents/ui/button';
import { Input } from '../../../admincomponents/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../admincomponents/ui/card';
import { Label } from '../../../admincomponents/ui/label';
import { Switch } from '../../../admincomponents/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../admincomponents/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../admincomponents/ui/select';
import { Textarea } from '../../../admincomponents/ui/textarea';
import { Slider } from '../../../admincomponents/ui/slider';
import { Separator } from '../../../admincomponents/ui/separator';
import { Badge } from '../../../admincomponents/ui/badge';

export default function OrganizationSettings() {
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = () => {
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsDirty(false);
    // Save logic here
  };

  const handleReset = () => {
    setIsDirty(false);
    // Reset logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>تنظیمات سازمان</h1>
          <p className="text-muted-foreground">
            پیکربندی کلی سیستم CRM و تنظیمات سازمانی
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            بازگردانی
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            ذخیره تغییرات
          </Button>
        </div>
      </div>

      {isDirty && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              تغییرات ذخیره نشده وجود دارد. برای اعمال تغییرات دکمه ذخیره را کلیک کنید.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            عمومی
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <Zap className="w-4 h-4" />
            گردش کار
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            اطلاع‌رسانی
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            هوش مصنوعی
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-2">
            <Database className="w-4 h-4" />
            یکپارچه‌سازی
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            ظاهر
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات پایه سازمان</CardTitle>
              <CardDescription>
                تنظیمات کلی و اطلاعات اساسی شرکت
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام شرکت</Label>
                  <Input
                    defaultValue="شرکت توزیع برق"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>کد شرکت</Label>
                  <Input
                    defaultValue="ELD-001"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>شماره تلفن پشتیبانی</Label>
                  <Input
                    defaultValue="۱۲۱"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ایمیل پشتیبانی</Label>
                  <Input
                    defaultValue="support@electricity.ir"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>آدرس</Label>
                <Textarea
                  defaultValue="تهران، خیابان ولیعصر، شماره ۱۲۳"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>لوگو شرکت</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    آپلود لوگو
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تنظیمات زمان و منطقه</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>منطقه زمانی</Label>
                  <Select defaultValue="tehran">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tehran">تهران (UTC+3:30)</SelectItem>
                      <SelectItem value="tabriz">تبریز (UTC+3:30)</SelectItem>
                      <SelectItem value="isfahan">اصفهان (UTC+3:30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>نوع تقویم</Label>
                  <Select defaultValue="jalali">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jalali">شمسی (جلالی)</SelectItem>
                      <SelectItem value="gregorian">میلادی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>فرمت ۲۴ ساعته</Label>
                  <p className="text-sm text-muted-foreground">
                    استفاده از فرمت ۲۴ ساعته به جای ۱۲ ساعته
                  </p>
                </div>
                <Switch defaultChecked onChange={handleChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Settings */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>وضعیت‌های پیش‌فرض وظایف</CardTitle>
              <CardDescription>
                تنظیم مراحل و وضعیت‌های مختلف برای مدیریت وظایف
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'دیده نشده', color: '#6b7280', default: true },
                { name: 'در حال بررسی', color: '#3b82f6', default: true },
                { name: 'در انتظار اطلاعات', color: '#f59e0b', default: true },
                { name: 'در حال انجام', color: '#8b5cf6', default: true },
                { name: 'حل شده', color: '#10b981', default: true },
                { name: 'بسته شده', color: '#374151', default: true }
              ].map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <div>
                      <p className="font-medium">{status.name}</p>
                      {status.default && (
                        <Badge variant="outline" className="text-xs">پیش‌فرض</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch defaultChecked onChange={handleChange} />
                    <Button variant="ghost" size="sm">ویرایش</Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full gap-2">
                <Zap className="w-4 h-4" />
                افزودن وضعیت جدید
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>قوانین خودکار</CardTitle>
              <CardDescription>
                تنظیم قوانین خودکار برای تخصیص و مسیریابی وظایف
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>تخصیص خودکار بر اساس منطقه</Label>
                  <p className="text-sm text-muted-foreground">
                    تخصیص خودکار شکایات به تیم مربوط بر اساس منطقه جغرافیایی
                  </p>
                </div>
                <Switch defaultChecked onChange={handleChange} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>ارجاع خودکار شکایات اولویت بالا</Label>
                  <p className="text-sm text-muted-foreground">
                    ارجاع فوری شکایات با اولویت بالا به مدیران
                  </p>
                </div>
                <Switch defaultChecked onChange={handleChange} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>بستن خودکار شکایات حل شده</Label>
                  <p className="text-sm text-muted-foreground">
                    بستن خودکار شکایات پس از ۴۸ ساعت در وضعیت حل شده
                  </p>
                </div>
                <Switch onChange={handleChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات اطلاع‌رسانی</CardTitle>
              <CardDescription>
                پیکربندی سیستم اطلاع‌رسانی و هشدارها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  اطلاع‌رسانی ایمیلی
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>ایمیل شکایات جدید</Label>
                    <p className="text-sm text-muted-foreground">
                      ارسال ایمیل برای شکایات جدید به مدیران
                    </p>
                  </div>
                  <Switch defaultChecked onChange={handleChange} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>گزارش روزانه</Label>
                    <p className="text-sm text-muted-foreground">
                      ارسال گزارش روزانه عملکرد سیستم
                    </p>
                  </div>
                  <Switch defaultChecked onChange={handleChange} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  اطلاع‌رسانی پیامکی
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>پیامک شکایات فوری</Label>
                    <p className="text-sm text-muted-foreground">
                      ارسال پیامک برای شکایات فوری
                    </p>
                  </div>
                  <Switch defaultChecked onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label>شماره پیامک سرویس</Label>
                  <Input
                    defaultValue="50002020"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  هشدارهای سیستم
                </h4>

                <div className="space-y-2">
                  <Label>حد آستانه شکایات روزانه</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      defaultValue={[100]}
                      max={500}
                      step={10}
                      className="flex-1"
                      onValueChange={handleChange}
                    />
                    <span className="w-16 text-sm">۱۰۰ مورد</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    هشدار در صورت دریافت بیش از این تعداد شکایت در روز
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>حداکثر زمان پاسخگویی (ساعت)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      defaultValue={[4]}
                      max={24}
                      step={1}
                      className="flex-1"
                      onValueChange={handleChange}
                    />
                    <span className="w-16 text-sm">۴ ساعت</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات هوش مصنوعی</CardTitle>
              <CardDescription>
                پیکربندی سیستم تحلیل هوشمند پیام‌ها و شکایات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>تحلیل خودکار پیام‌ها</Label>
                  <p className="text-sm text-muted-foreground">
                    استفاده از هوش مصنوعی برای تحلیل و دسته‌بندی پیام‌ها
                  </p>
                </div>
                <Switch defaultChecked onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>حد آستانه اطمینان AI (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    defaultValue={[85]}
                    max={100}
                    step={5}
                    className="flex-1"
                    onValueChange={handleChange}
                  />
                  <span className="w-16 text-sm">۸۵%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  حداقل درصد اطمینان برای پذیرش تحلیل خودکار
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>تشخیص احساسات</Label>
                  <p className="text-sm text-muted-foreground">
                    تحلیل لحن و احساسات مشتریان در پیام‌ها
                  </p>
                </div>
                <Switch defaultChecked onChange={handleChange} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>پیشنهاد پاسخ خودکار</Label>
                  <p className="text-sm text-muted-foreground">
                    ایجاد پیشنهاد پاسخ برای اپراتورها
                  </p>
                </div>
                <Switch onChange={handleChange} />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4>کلمات کلیدی فوری</h4>
                <Textarea
                  placeholder="کلمات کلیدی که باعث اولویت‌بندی فوری می‌شوند (با کامای انگلیسی جدا کنید)"
                  defaultValue="آتش‌سوزی، انفجار، خطر، فوری، فوت، جراحت"
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات یکپارچه‌سازی</CardTitle>
              <CardDescription>
                پیکربندی اتصال به سیستم‌ها و سرویس‌های خارجی
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4>درگاه پیامک</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نام کاربری</Label>
                    <Input
                      placeholder="username"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>رمز عبور</Label>
                    <Input
                      type="password"
                      placeholder="password"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>URL سرویس</Label>
                    <Input
                      placeholder="https://api.sms-service.com"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>شماره فرستنده</Label>
                    <Input
                      placeholder="50002020"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Button variant="outline" className="gap-2">
                  <Zap className="w-4 h-4" />
                  تست اتصال
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4>سیستم مدیریت مشتریان (CRM)</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>همگام‌سازی خودکار مشتریان</Label>
                    <p className="text-sm text-muted-foreground">
                      دریافت خودکار اطلاعات مشتریان از CRM اصلی
                    </p>
                  </div>
                  <Switch onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="your-api-key-here"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات ظاهری</CardTitle>
              <CardDescription>
                شخصی‌سازی ظاهر و رنگ‌بندی سیستم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4>رنگ‌بندی سیستم</h4>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'آبی', value: 'blue', color: '#3b82f6' },
                    { name: 'سبز', value: 'green', color: '#10b981' },
                    { name: 'بنفش', value: 'purple', color: '#8b5cf6' },
                    { name: 'نارنجی', value: 'orange', color: '#f59e0b' }
                  ].map((theme) => (
                    <div key={theme.value} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 cursor-pointer"
                        style={{ backgroundColor: theme.color }}
                        onClick={handleChange}
                      />
                      <span className="text-sm">{theme.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>حالت تاریک پیش‌فرض</Label>
                  <p className="text-sm text-muted-foreground">
                    حالت تاریک به عنوان ظاهر پیش‌فرض سیستم
                  </p>
                </div>
                <Switch onChange={handleChange} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>نمایش اطلاعات اضافی</Label>
                  <p className="text-sm text-muted-foreground">
                    نمایش جزئیات بیشتر در کارت‌ها و فهرست‌ها
                  </p>
                </div>
                <Switch defaultChecked onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>اندازه فونت پیش‌فرض</Label>
                <Select defaultValue="medium" onValueChange={handleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">کوچک</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="large">بزرگ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
