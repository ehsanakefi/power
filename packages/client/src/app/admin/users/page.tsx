"use client";

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Key,
  UserPlus,
  Download
} from 'lucide-react';
import { Button } from '../../../admincomponents/ui/button';
import { Input } from '../../../admincomponents/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../admincomponents/ui/card';
import { Badge } from '../../../admincomponents/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../admincomponents/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../admincomponents/ui/dialog';
import { Label } from '../../../admincomponents/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../admincomponents/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../admincomponents/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../admincomponents/ui/tabs';
import { Switch } from '../../../admincomponents/ui/switch';
import { Textarea } from '../../../admincomponents/ui/textarea';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock user data
  const users = [
    {
      id: '1',
      name: 'علی احمدی',
      email: 'ali.ahmadi@company.com',
      phone: '09121234567',
      role: 'مدیر سیستم',
      department: 'IT',
      status: 'active',
      lastLogin: '۱۰ دقیقه پیش',
      avatar: '',
      joinDate: '۱۴۰۱/۰۵/۱۵',
      permissions: ['مدیریت کاربران', 'مدیریت سیستم', 'مشاهده گزارشات']
    },
    {
      id: '2',
      name: 'فاطمه رضایی',
      email: 'f.rezaei@company.com',
      phone: '09129876543',
      role: 'مدیر پشتیبانی',
      department: 'پشتیبانی',
      status: 'active',
      lastLogin: '۲ ساعت پیش',
      avatar: '',
      joinDate: '۱۴۰۲/۰۲/۱۰',
      permissions: ['مدیریت تیم', 'پاسخگویی', 'مشاهده آمار']
    },
    {
      id: '3',
      name: 'محمد حسینی',
      email: 'm.hosseini@company.com',
      phone: '09125555555',
      role: 'کارشناس فنی',
      department: 'فنی',
      status: 'active',
      lastLogin: '۱ روز پیش',
      avatar: '',
      joinDate: '۱۴۰۲/۰۸/۰۵',
      permissions: ['بررسی شکایات', 'ثبت گزارش']
    },
    {
      id: '4',
      name: 'مریم کریمی',
      email: 'm.karimi@company.com',
      phone: '09123333333',
      role: 'کارشناس خدمات',
      department: 'خدمات مشتریان',
      status: 'inactive',
      lastLogin: '۱ هفته پیش',
      avatar: '',
      joinDate: '۱۴۰۱/۱۱/۲۰',
      permissions: ['پاسخگویی مشتریان']
    }
  ];

  const roles = [
    { id: 'admin', name: 'مدیر سیستم', permissions: 15, color: 'red' },
    { id: 'manager', name: 'مدیر بخش', permissions: 8, color: 'blue' },
    { id: 'specialist', name: 'کارشناس', permissions: 5, color: 'green' },
    { id: 'operator', name: 'اپراتور', permissions: 3, color: 'gray' }
  ];

  const departments = [
    'IT', 'پشتیبانی', 'فنی', 'خدمات مشتریان', 'اداری', 'مالی'
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.includes(searchTerm) ||
                         user.email.includes(searchTerm) ||
                         user.role.includes(searchTerm);
    const matchesFilter = selectedFilter === 'all' || user.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const CreateUserDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          افزودن کاربر جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>افزودن کاربر جدید</DialogTitle>
          <DialogDescription>
            اطلاعات کاربر جدید را وارد کنید
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>نام و نام خانوادگی</Label>
            <Input placeholder="نام کامل کاربر" />
          </div>

          <div className="space-y-2">
            <Label>ایمیل</Label>
            <Input type="email" placeholder="email@company.com" />
          </div>

          <div className="space-y-2">
            <Label>شماره تلفن</Label>
            <Input placeholder="09xxxxxxxxx" />
          </div>

          <div className="space-y-2">
            <Label>نقش</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب نقش" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>بخش</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب بخش" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>رمز عبور موقت</Label>
            <Input type="password" placeholder="حداقل ۸ کاراکتر" />
          </div>

          <div className="col-span-2 space-y-2">
            <Label>توضیحات</Label>
            <Textarea placeholder="توضیحات اختیاری در مورد کاربر" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">انصراف</Button>
          <Button>ایجاد کاربر</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const UserDetailsDialog = ({ user }: { user: typeof users[0] }) => (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Eye className="w-4 h-4" />
          مشاهده جزئیات
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>جزئیات کاربر</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg">{user.name}</h3>
              <p className="text-muted-foreground">{user.role}</p>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status === 'active' ? 'فعال' : 'غیرفعال'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ایمیل</Label>
              <p className="text-sm">{user.email}</p>
            </div>

            <div className="space-y-2">
              <Label>شماره تلفن</Label>
              <p className="text-sm">{user.phone}</p>
            </div>

            <div className="space-y-2">
              <Label>بخش</Label>
              <p className="text-sm">{user.department}</p>
            </div>

            <div className="space-y-2">
              <Label>تاریخ عضویت</Label>
              <p className="text-sm">{user.joinDate}</p>
            </div>

            <div className="space-y-2">
              <Label>آخرین ورود</Label>
              <p className="text-sm">{user.lastLogin}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>دسترسی‌ها</Label>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((perm, index) => (
                <Badge key={index} variant="outline">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>مدیریت کاربران</h1>
          <p className="text-muted-foreground">
            مدیریت کاربران، نقش‌ها و دسترسی‌های سیستم
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            خروج کاربران
          </Button>
          <CreateUserDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل کاربران</p>
                <p className="text-2xl">{users.length}</p>
              </div>
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کاربران فعال</p>
                <p className="text-2xl text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کاربران غیرفعال</p>
                <p className="text-2xl text-red-600">
                  {users.filter(u => u.status === 'inactive').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">آنلاین الان</p>
                <p className="text-2xl text-blue-600">۳</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">لیست کاربران</TabsTrigger>
          <TabsTrigger value="roles">مدیریت نقش‌ها</TabsTrigger>
          <TabsTrigger value="permissions">دسترسی‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="جستجو کاربران..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه کاربران</SelectItem>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="inactive">غیرفعال</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  فیلتر پیشرفته
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {user.role}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          آخرین ورود: {user.lastLogin}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{user.department}</Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <UserDetailsDialog user={user} />
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Key className="w-4 h-4" />
                            تغییر رمز عبور
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            حذف کاربر
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>مدیریت نقش‌ها</h3>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              ایجاد نقش جدید
            </Button>
          </div>

          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded bg-${role.color}-500`} />
                      <div>
                        <h4 className="font-medium">{role.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {role.permissions} دسترسی فعال
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {users.filter(u => u.role === role.name).length} کاربر
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            ویرایش نقش
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Shield className="w-4 h-4" />
                            مدیریت دسترسی‌ها
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            حذف نقش
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مدیریت دسترسی‌ها</CardTitle>
              <CardDescription>
                تنظیم دسترسی‌های مختلف برای نقش‌های سیستم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {['مدیریت کاربران', 'مدیریت شکایات', 'مشاهده گزارشات', 'تنظیمات سیستم', 'مدیریت محتوا'].map((permission) => (
                <div key={permission} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{permission}</p>
                    <p className="text-sm text-muted-foreground">
                      دسترسی به {permission.toLowerCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center gap-2">
                        <Switch defaultChecked={Math.random() > 0.3} />
                        <span className="text-sm">{role.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
