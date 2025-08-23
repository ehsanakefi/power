'use client';

import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Toaster } from '../../components/ui/sonner';
import { Loader2, Zap, User,  Lock ,Phone} from 'lucide-react';
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  BarChart3,
  Search as SearchIcon,
  History as HistoryIcon,
  Settings,
  Bell,
  Moon,
  Sun,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';
interface User {
  id: string;
  phone: string;
  name: string;
  role: string;
}
import { usePathname } from "next/navigation";
type PageType = 'tasks' | 'analytics' | 'search' | 'history';

const navigationItems = [
  { id: 'tasks', label: 'وظایف من', icon: CheckSquare ,router:"/manger/tasks"},
  { id: 'analytics', label: 'تحلیل‌ها و گزارشات', icon: BarChart3, router:"/manger/analytics" },
  { id: 'search', label: 'جستجوی پیشرفته', icon: SearchIcon, router:"/manger/search" },
  { id: 'history', label: 'تاریخچه و رهگیری', icon: HistoryIcon, router:"/manger/history" },
];


export default function Manger({children}: {children: React.ReactNode}) {
 const router = useRouter();
 const pathname = usePathname();

  const [activePage, setActivePage] = useState<PageType>('tasks');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<number>(3);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const savedUser = localStorage.getItem('crm-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Auth status check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    const demoUser: User = {
      id: '1',
      phone: 'user@company.com',
      name: 'کاربر آزمایشی',
      role: 'کارشناس'
    };

    localStorage.setItem('crm-user', JSON.stringify(demoUser));
    setUser(demoUser);
    toast.success('خوش آمدید!');
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('crm-user');
      setUser(null);
      toast.success('با موفقیت خارج شدید');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('خطا در فرآیند خروج');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="p-4 bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SidebarProvider>
        <Sidebar side="right" className="border-l border-sidebar-border">
          <SidebarHeader className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">پنل مدیریت CRM</h1>
                <p className="text-sm text-muted-foreground">شرکت توزیع نیروی برق</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-sidebar-accent rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>
                  {user&&user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?user.name:""}</p>
                <p className="text-xs text-muted-foreground">{user?user.role:""}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                آنلاین
              </Badge>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() =>  router.push(item.router)}
                    className={`w-full justify-start gap-3 p-3 rounded-lg transition-colors ${
                      pathname == item.router
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.id === 'tasks' && (
                      <Badge variant="secondary" className="mr-auto">
                        جدید
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <Separator className="my-4" />

            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">دستیار هوشمند</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                برای کمک سریع از دستیار هوشمند استفاده کنید
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs">
                شروع گفتگو
              </Button>
            </div>

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start gap-3 p-3 rounded-lg hover:bg-sidebar-accent">
                  <Settings className="w-5 h-5" />
                  <span>تنظیمات</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 min-w-0">
          <header className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <div>
                  <h2 className="text-xl font-semibold">
                    {navigationItems.find(item => item.id === activePage)?.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {activePage === 'tasks' && 'مدیریت وظایف شخصی و پیگیری درخواست‌ها'}
                    {activePage === 'analytics' && 'تحلیل عملکرد و گزارش‌های مدیریتی'}
                    {activePage === 'search' && 'جستجوی پیشرفته در وظایف و درخواست‌ها'}
                    {activePage === 'history' && 'رهگیری تغییرات و تاریخچه فعالیت‌ها'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -left-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                      >
                        {notifications}
                      </Badge>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <Switch
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                  <Moon className="w-4 h-4" />
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4" />
                  <span>{user?user.name:""}</span>
                </div>

                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6">
           {children}
          </div>

          <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">آنلاین - {user?user.role:""}</span>
          </div>
        </main>
      </SidebarProvider>

      <Toaster position="top-left" />
    </div>
  );
}
