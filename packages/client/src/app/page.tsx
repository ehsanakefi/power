'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

import { Loader2, Zap, User,  Lock ,Phone} from 'lucide-react';
import {
  CheckSquare,
  BarChart3,
  Search as SearchIcon,
  History as HistoryIcon,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';


interface User {
  id: string;
  phone: string;
  name: string;
  role: string;
}



export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [signInData, setSignInData] = useState({ phone: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!signInData.phone || !signInData.password) {
        throw new Error('لطفاً تمام فیلدها را پر کنید');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('با موفقیت وارد شدید');

    } catch (error: any) {
      toast.error(error.message || 'خطا در فرآیند ورود');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!signUpData.name || !signUpData.phone || !signUpData.password) {
        throw new Error('لطفاً تمام فیلدها را پر کنید');
      }

      if (signUpData.password !== signUpData.confirmPassword) {
        throw new Error('رمز عبور و تکرار آن یکسان نیستند');
      }

      if (signUpData.password.length < 6) {
        throw new Error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('حساب کاربری با موفقیت ایجاد شد');
      setActiveTab('signin');
      setSignInData({ phone: signUpData.phone, password: '' });

    } catch (error: any) {
      toast.error(error.message || 'خطا در فرآیند ثبت‌نام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div  className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 bg-praimary rounded-full w-16 h-16 flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">پنل مدیریت CRM</CardTitle>
            <p className="text-muted-foreground">شرکت توزیع نیروی برق</p>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">ورود</TabsTrigger>
              <TabsTrigger value="signup">ثبت‌نام</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form style={{direction: 'rtl'}}  onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">شماره تلفن</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="number"
                      placeholder="09185000000"
                      value={signInData.phone}
                      onChange={(e) => setSignInData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pr-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">رمز عبور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="رمز عبور خود را وارد کنید"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      در حال ورود...
                    </>
                  ) : (
                    'ورود'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form style={{direction: 'rtl'}}  onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">نام و نام خانوادگی</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="نام کامل خود را وارد کنید"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                      className="pr-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">شاره تلفن</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="number"
                      placeholder="09185000000"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pr-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">رمز عبور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="حداقل ۶ کاراکتر"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">تکرار رمز عبور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="رمز عبور را مجدداً وارد کنید"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pr-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      در حال ثبت‌نام...
                    </>
                  ) : (
                    'ثبت‌نام'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>سیستم مدیریت شکایات و درخواست‌های مشتریان</p>
            <p className="mt-1">شرکت توزیع نیروی برق</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
