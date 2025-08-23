import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/customercomponents/ui/card';
import { Button } from '@/customercomponents/ui/button';
import { Badge } from '@/customercomponents/ui/badge';
import { Progress } from '@/customercomponents/ui/progress';
import { Separator } from '@/customercomponents/ui/separator';
import { Textarea } from '@/customercomponents/ui/textarea';
import {
  ArrowRight,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  Star,
  Send,
  Download
} from 'lucide-react';

interface RequestDetailsProps {
  requestId: string;
  onBack: () => void;
}

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  user: string;
  type: 'status_change' | 'comment' | 'attachment' | 'referral';
}

export function RequestDetails({ requestId, onBack }: RequestDetailsProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Mock request data
  const request = {
    id: requestId,
    date: '1403/11/15',
    time: '14:30',
    description: 'قطعی برق مکرر در منطقه',
    category: 'قطعی برق',
    status: 'in_progress',
    originalMessage: 'سلام. قطعی برق مکرر در خیابان آزادی کوچه 12 پلاک 25. لطفا پیگیری کنید.',
    currentStage: 2,
    totalStages: 4,
    estimatedCompletion: '1403/11/20'
  };

  const processStages = [
    { title: 'دریافت درخواست', completed: true },
    { title: 'در حال بررسی', completed: true },
    { title: 'اقدامات عملیاتی', completed: false },
    { title: 'تکمیل و بازخورد', completed: false }
  ];

  const timeline: TimelineEvent[] = [
    {
      id: '1',
      date: '1403/11/15',
      time: '14:30',
      title: 'درخواست ثبت شد',
      description: 'درخواست شما با موفقیت در سیستم ثبت گردید',
      user: 'سیستم خودکار',
      type: 'status_change'
    },
    {
      id: '2',
      date: '1403/11/15',
      time: '15:45',
      title: 'تایید و ارجاع اولیه',
      description: 'درخواست تایید و به بخش عملیات شبکه ارجاع داده شد',
      user: 'کارشناس مرکز تماس',
      type: 'referral'
    },
    {
      id: '3',
      date: '1403/11/16',
      time: '09:20',
      title: 'بازدید منطقه',
      description: 'تیم فنی به منطقه اعزام و بازدید انجام شد. علت قطعی شناسایی گردید.',
      user: 'تیم عملیات فنی',
      type: 'comment'
    },
    {
      id: '4',
      date: '1403/11/16',
      time: '16:10',
      title: 'شروع تعمیرات',
      description: 'تعمیرات کابل آسیب‌دیده آغاز شد. تکمیل عملیات طی ۲ روز آینده',
      user: 'مهندس شبکه',
      type: 'status_change'
    }
  ];

  const getProgressPercentage = () => {
    return (request.currentStage / request.totalStages) * 100;
  };

  const handleSubmitFeedback = () => {
    // Handle feedback submission
    setShowFeedbackForm(false);
    setFeedback('');
    setRating(0);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'status_change': return CheckCircle;
      case 'comment': return MessageSquare;
      case 'attachment': return FileText;
      case 'referral': return User;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowRight className="w-4 h-4" />
          بازگشت
        </Button>
        <div>
          <h2>جزئیات درخواست {request.id}</h2>
          <p className="text-muted-foreground">
            ثبت شده در {request.date} ساعت {request.time}
          </p>
        </div>
      </div>

      {/* Request Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            اطلاعات کلی درخواست
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">عنوان درخواست</label>
              <p>{request.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">دسته‌بندی</label>
              <div>
                <Badge variant="outline">{request.category}</Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">متن اصلی پیام</label>
            <div className="mt-1 p-3 bg-muted rounded-lg">
              <p className="text-sm">{request.originalMessage}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              تاریخ تخمینی تکمیل: {request.estimatedCompletion}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle>روند پیگیری</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>پیشرفت کلی</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>

          <Progress value={getProgressPercentage()} className="h-2" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {processStages.map((stage, index) => (
              <div key={index} className="text-center">
                <div className={`
                  w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center
                  ${stage.completed
                    ? 'bg-green-500 text-white'
                    : index === request.currentStage
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {stage.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <p className="text-xs font-medium">{stage.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            تاریخچه تغییرات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((event, index) => {
              const Icon = getEventIcon(event.type);
              return (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-px h-12 bg-border mt-2" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        {event.date} - {event.time}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      {event.user}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            بازخورد شما
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showFeedbackForm ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                آیا از روند پیگیری درخواست خود راضی هستید؟
              </p>
              <Button onClick={() => setShowFeedbackForm(true)}>
                ثبت بازخورد
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">امتیاز شما</label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${
                        star <= rating ? 'text-yellow-400' : 'text-muted-foreground'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">نظر شما</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="لطفا نظر خود را در مورد کیفیت خدمات ارائه شده بنویسید..."
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitFeedback} className="gap-2">
                  <Send className="w-4 h-4" />
                  ارسال بازخورد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackForm(false)}
                >
                  انصراف
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
