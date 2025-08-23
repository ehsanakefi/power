"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/customercomponents/ui/card';
import { Button } from '@/customercomponents/ui/button';
import { Badge } from '@/customercomponents/ui/badge';
import { Separator } from '@/customercomponents/ui/separator';
import {
  History,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
  Phone,
  Menu,
  X
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
interface DashboardProps {
  phoneNumber: string;
  onLogout: () => void;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'history' | 'details' | 'notifications'>('history');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const mockUserName = 'علی احمدی';

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleRequestSelect = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveTab('details');
  };

  const sidebarItems = [
    {
      id: 'history',
      label: 'تاریخچه درخواست‌ها',
      icon: History,
      active: activeTab === 'history',
      router:"/customer/history"
    },
    {
      id: 'notifications',
      label: 'اعلان‌ها',
      icon: Bell,
      active: activeTab === 'notifications',
      badge: notificationCount,
      router:"/customer/notifications"

    }
  ];

  return (
    // <div className="min-h-screen bg-background" dir="rtl">
    <div className={`min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <h1>پنل مشتری</h1>
        <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`
           lg:relative inset-y-0 right-0 z-50 w-64 bg-card border-l
          transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out lg:transform-none
        `}>
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{mockUserName}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {/*<span dir="ltr">{phoneNumber}</span>*/}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={pathname == item.router? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() =>  router.push(item.router)}

              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-right">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          <Separator className="mx-4" />

          {/* Settings and Theme */}
          <div className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="w-5 h-5" />
              تنظیمات
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hidden lg:flex"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDarkMode ? 'حالت روشن' : 'حالت تیره'}
            </Button>
          </div>

          {/* Logout */}
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              // onClick={onLogout}
            >
              <LogOut className="w-5 h-5" />
              خروج از حساب
            </Button>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:mr-64">
          <div className="p-6">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h1>خوش آمدید، {mockUserName}</h1>
                <p className="text-muted-foreground">
                  وضعیت درخواست‌ها و پیگیری شکایات شما
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm"
                  // onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {children}

              {/*{activeTab === 'history' && (
                <>
                  <DashboardStats />
                  <RequestHistory onRequestSelect={handleRequestSelect} />
                </>
              )}

              {activeTab === 'details' && selectedRequestId && (
                <RequestDetails
                  requestId={selectedRequestId}
                  onBack={() => setActiveTab('history')}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationCenter onNotificationRead={() => setNotificationCount(prev => Math.max(0, prev - 1))} />
              )}*/}
            </div>
          </div>
        </div>
      </div>
    </div>
       // </div>
  );
}
