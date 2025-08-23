"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/customercomponents/ui/card';
import { Badge } from '@/customercomponents/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/customercomponents/ui/tabs';
import {
  Bell,
  Check,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  Mail
} from 'lucide-react';
import { Button } from '@/customercomponents/ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  type: 'update' | 'sms' | 'system' | 'warning';
  isRead: boolean;
  requestId?: string;
}

interface NotificationCenterProps {
  onNotificationRead: () => void;
}

export default function NotificationCenter({ onNotificationRead }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'به‌روزرسانی وضعیت درخواست',
      message: 'وضعیت درخواست REQ-001 به "در حال انجام" تغییر یافت',
      date: '1403/11/16',
      time: '16:10',
      type: 'update',
      isRead: false,
      requestId: 'REQ-001'
    },
    {
      id: '2',
      title: 'پیام پیامکی ارسال شد',
      message: 'تیم فنی به منطقه اعزام شد. اقدامات لازم در حال انجام است.',
      date: '1403/11/16',
      time: '09:25',
      type: 'sms',
      isRead: false
    },
    {
      id: '3',
      title: 'درخواست جدید ثبت شد',
      message: 'درخواست شما با شماره REQ-005 در سیستم ثبت گردید',
      date: '1403/11/15',
      time: '14:35',
      type: 'system',
      isRead: true
    },
    {
      id: '4',
      title: 'هشدار سیستم',
      message: 'امکان قطعی برق در روز جمعه به دلیل تعمیرات شبکه',
      date: '1403/11/14',
      time: '10:00',
      type: 'warning',
      isRead: true
    },
    {
      id: '5',
      title: 'تکمیل درخواست',
      message: 'درخواست REQ-002 با موفقیت تکمیل شد',
      date: '1403/11/12',
      time: '15:20',
      type: 'update',
      isRead: true,
      requestId: 'REQ-002'
    }
  ]);

  const typeConfig = {
    update: {
      label: 'به‌روزرسانی',
      color: 'default',
      icon: CheckCircle,
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    sms: {
      label: 'پیامک',
      color: 'secondary',
      icon: MessageSquare,
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    system: {
      label: 'سیستم',
      color: 'outline',
      icon: Info,
      bgColor: 'bg-gray-50 dark:bg-gray-950'
    },
    warning: {
      label: 'هشدار',
      color: 'destructive',
      icon: AlertTriangle,
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    onNotificationRead();
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    // Update count based on unread notifications
    for (let i = 0; i < unreadNotifications.length; i++) {
      onNotificationRead();
    }
  };

  const NotificationCard = ({ notification, showActions = true }: { notification: Notification, showActions?: boolean }) => {
    const config = typeConfig[notification.type];
    const Icon = config.icon;

    return (
      <Card className={`
        ${!notification.isRead ? 'border-blue-200 ' + config.bgColor : ''}
        transition-all hover:shadow-md
      `}>
        <CardContent className="p-4" dir='rtl'>
          <div className="flex gap-4">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
              ${notification.type === 'update' && 'bg-blue-100 text-blue-600'}
              ${notification.type === 'sms' && 'bg-green-100 text-green-600'}
              ${notification.type === 'system' && 'bg-gray-100 text-gray-600'}
              ${notification.type === 'warning' && 'bg-orange-100 text-orange-600'}
            `}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {notification.date} - {notification.time}
                    </span>
                    <Badge variant={config.color as any} className="text-xs">
                      {config.label}
                    </Badge>
                    {notification.requestId && (
                      <Badge variant="outline" className="text-xs">
                        {notification.requestId}
                      </Badge>
                    )}
                  </div>
                </div>

                {showActions && (
                  <div className="flex flex-col gap-1">
                    {!notification.isRead ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsUnread(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            مرکز اعلان‌ها
          </h2>
          <p className="text-muted-foreground">
            {unreadNotifications.length} اعلان خوانده نشده از {notifications.length} اعلان
          </p>
        </div>

        {unreadNotifications.length > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="w-4 h-4 ml-2" />
            خواندن همه
          </Button>
        )}
      </div>

      {/* Notifications Tabs */}
      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unread" className="gap-2">
            خوانده نشده
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">همه اعلان‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-4 mt-6">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3>همه اعلان‌ها خوانده شده</h3>
                <p className="text-muted-foreground">
                  اعلان جدیدی برای نمایش وجود ندارد
                </p>
              </CardContent>
            </Card>
          ) : (
            unreadNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4 mt-6">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3>اعلانی موجود نیست</h3>
                <p className="text-muted-foreground">
                  هنوز اعلانی دریافت نکرده‌اید
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
