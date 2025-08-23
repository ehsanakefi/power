import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/customercomponents/card';
import { Button } from '@/customercomponents/button';
import { Input } from '@/customercomponents/input';
import { Label } from '@/customercomponents/label';
import { Alert, AlertDescription } from '@/customercomponents/alert';
import { Smartphone, Shield, RotateCcw } from 'lucide-react';

interface AuthPageProps {
  onLogin: (phoneNumber: string) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length !== 11) {
      setError('لطفا شماره موبایل معتبر وارد کنید');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('verification');
      setCountdown(120); // 2 minutes countdown

      // Simulate countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 5) {
      setError('لطفا کد ۵ رقمی را کامل وارد کنید');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      if (verificationCode === '12345') {
        onLogin(phoneNumber);
      } else {
        setError('کد وارد شده صحیح نمی‌باشد');
      }
    }, 1000);
  };

  const handleResendCode = () => {
    if (countdown > 0) return;

    setCountdown(120);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'phone' ? 'ورود به پنل مشتری' : 'تایید شماره موبایل'}
          </CardTitle>
          <p className="text-muted-foreground">
            {step === 'phone'
              ? 'برای ورود شماره موبایل خود را وارد کنید'
              : `کد تایید به شماره ${phoneNumber} ارسال شد`
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">شماره موبایل</Label>
                <div className="relative">
                  <Smartphone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pr-10"
                    maxLength={11}
                    dir="ltr"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'در حال ارسال...' : 'ارسال کد تایید'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                مشکلی دارید؟{' '}
                <button className="text-blue-600 hover:underline">
                  تماس با پشتیبانی
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">کد تایید</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="12345"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={5}
                  dir="ltr"
                  className="text-center tracking-widest"
                />
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'در حال تایید...' : 'تایید و ورود'}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => setStep('phone')}
                  className="text-blue-600 hover:underline"
                >
                  تغییر شماره
                </button>

                <button
                  onClick={handleResendCode}
                  disabled={countdown > 0}
                  className="text-blue-600 hover:underline disabled:text-muted-foreground flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {countdown > 0 ? `ارسال مجدد (${formatTime(countdown)})` : 'ارسال مجدد'}
                </button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                کد تایید به مدت ۵ دقیقه معتبر است
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
