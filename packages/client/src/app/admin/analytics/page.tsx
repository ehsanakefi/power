"use client";

import React from 'react';
import { MessageSquare, BarChart3, Users, Activity } from 'lucide-react';
import { Button } from '../../../admincomponents/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../admincomponents/ui/card';

export default function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>گزارشات و آمار</h2>
        <Button>دانلود گزارش</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">کل شکایات</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">۱,۲۳۴</div>
            <p className="text-xs text-muted-foreground">
              +۲۰.۱% نسبت به ماه گذشته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">شکایات حل شده</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">۹۸۷</div>
            <p className="text-xs text-muted-foreground">
              ۸۰% نرخ حل مسئله
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">کاربران فعال</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">۱۴۲</div>
            <p className="text-xs text-muted-foreground">
              +۵ کاربر جدید این هفته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">زمان پاسخگویی</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">۲.۴ ساعت</div>
            <p className="text-xs text-muted-foreground">
              میانگین زمان پاسخ
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
