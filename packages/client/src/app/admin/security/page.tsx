"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../admincomponents/ui/card';
import { Switch } from '../../../admincomponents/ui/switch';

export default function SecuritySection() {
  return (
    <div className="space-y-6">
      <h2>امنیت سیستم</h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تنظیمات امنیتی</CardTitle>
            <CardDescription>
              پیکربندی امنیت و دسترسی‌های سیستم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>احراز هویت دو مرحله‌ای</p>
                <p className="text-sm text-muted-foreground">
                  فعال‌سازی ۲FA برای تمام مدیران
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p>محدودیت IP</p>
                <p className="text-sm text-muted-foreground">
                  دسترسی محدود به IP‌های مشخص
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p>لاگ فعالیت‌ها</p>
                <p className="text-sm text-muted-foreground">
                  ثبت تمام فعالیت‌های مدیریتی
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخرین فعالیت‌های امنیتی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">ورود موفق علی احمدی</p>
                  <p className="text-xs text-muted-foreground">۱۰ دقیقه پیش</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">تلاش ورود ناموفق</p>
                  <p className="text-xs text-muted-foreground">۲ ساعت پیش</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">تغییر تنظیمات سیستم</p>
                  <p className="text-xs text-muted-foreground">۵ ساعت پیش</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
