import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/admincomponents/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/admincomponents/ui/dialog';
import { Label } from '@/admincomponents/ui/label';
import { Input } from '@/admincomponents/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/admincomponents/ui/select';
import { Textarea } from '@/admincomponents/ui/textarea';
import { departments, positions } from './constants';

export function CreateNodeDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          افزودن نود جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>افزودن عضو جدید به چارت سازمانی</DialogTitle>
          <DialogDescription>
            اطلاعات فرد جدید را وارد کنید
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>نام و نام خانوادگی</Label>
            <Input placeholder="نام کامل فرد" />
          </div>

          <div className="space-y-2">
            <Label>سمت</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب سمت" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
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
            <Label>مدیر مستقیم</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب مدیر مستقیم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">احمد محمودی - مدیر عامل</SelectItem>
                <SelectItem value="2">علی احمدی - مدیر IT</SelectItem>
                <SelectItem value="3">فاطمه کریمی - مدیر خدمات مشتریان</SelectItem>
                <SelectItem value="4">حسین رضوی - مدیر فنی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ایمیل</Label>
            <Input type="email" placeholder="email@company.com" />
          </div>

          <div className="space-y-2">
            <Label>شماره تلفن</Label>
            <Input placeholder="021-xxxxxxxx" />
          </div>

          <div className="col-span-2 space-y-2">
            <Label>توضیحات</Label>
            <Textarea placeholder="توضیحات اختیاری در مورد فرد" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">انصراف</Button>
          <Button>افزودن به چارت</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
