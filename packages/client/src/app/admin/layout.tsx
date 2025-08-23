"use client";

import React, { useState } from 'react';
import {
  Settings,
  Users,
  Tag,
  GitBranch,
  BarChart3,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  Home,
  Shield,
  MessageSquare,
  Activity
} from 'lucide-react';
import { Button } from '../../admincomponents/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../admincomponents/ui/card';
import { Badge } from '../../admincomponents/ui/badge';
import { Separator } from '../../admincomponents/ui/separator';
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";


export default function Admin({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'داشبورد', icon: Home ,router:"/admin/dashboard"},
    { router:"/admin/labels",id: 'labels', label: 'مدیریت لیبل‌ها و تگ‌ها', icon: Tag },
    { id: 'users', label: 'مدیریت کاربران', icon: Users ,router:"/admin/users"},
    { id: 'orgchart', label: 'چارت سازمانی', icon: GitBranch,router:"/admin/orgchart" },
    { id: 'settings', label: 'تنظیمات سازمان', icon: Settings ,router:"/admin/settings"},
    { id: 'analytics', label: 'گزارشات و آمار', icon: BarChart3 ,router:"/admin/analytics"},
    { id: 'security', label: 'امنیت سیستم', icon: Shield ,router:"/admin/security"},
  ];



  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">پنل مدیریت CRM</h1>
                <p className="text-xs text-muted-foreground">شرکت توزیع برق</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                ۳
              </Badge>
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs text-primary-foreground">ادمین</span>
              </div>
              <div className="text-right">
                <p className="text-sm">علی احمدی</p>
                <p className="text-xs text-muted-foreground">مدیر سیستم</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-card border-l shadow-sm">
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={pathname == item.router? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 text-right"
                  onClick={() =>  router.push(item.router)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {pathname == item.router && (
                    <ChevronRight className="w-4 h-4 mr-auto" />
                  )}
                </Button>
              );
            })}
          </nav>

          {/* AI Assistant Widget */}
          <div className="mx-4 mt-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  دستیار هوشمند
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  سوالات خود را در مورد سیستم بپرسید
                </p>
                <Button size="sm" className="w-full text-xs">
                  شروع گفتگو
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
