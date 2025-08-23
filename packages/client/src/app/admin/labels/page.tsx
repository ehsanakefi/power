"use client";

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Download,
  Upload,
  Tag,
  Hash,
  Folder,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../../admincomponents/ui/button';
import { Input } from '../../../admincomponents/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../admincomponents/ui/card';
import { Badge } from '../../../admincomponents/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../admincomponents/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../admincomponents/ui/dialog';
import { Label } from '../../../admincomponents/ui/label';
import { Textarea } from '../../../admincomponents/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../admincomponents/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../admincomponents/ui/dropdown-menu';
import { Checkbox } from '../../../admincomponents/ui/checkbox';

export default function LabelsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock data
  const labels = [
    { id: '1', name: 'اولویت بالا', description: 'شکایات با اولویت بالا', color: '#ef4444', usageCount: 45 },
    { id: '2', name: 'قطعی برق', description: 'مشکلات مربوط به قطعی برق', color: '#f97316', usageCount: 128 },
    { id: '3', name: 'کیفیت برق', description: 'شکایات کیفیت برق', color: '#eab308', usageCount: 67 },
    { id: '4', name: 'حل شده', description: 'شکایات حل شده', color: '#22c55e', usageCount: 203 },
    { id: '5', name: 'در انتظار', description: 'شکایات در انتظار بررسی', color: '#3b82f6', usageCount: 89 },
  ];

  const tags = [
    { id: '1', name: 'فوری', description: 'نیاز به رسیدگی فوری', color: '#dc2626', linkedTo: 'شکایات' },
    { id: '2', name: 'منطقه‌۱', description: 'مربوط به منطقه شماره ۱', color: '#059669', linkedTo: 'مکان' },
    { id: '3', name: 'تکراری', description: 'شکایات تکراری', color: '#7c3aed', linkedTo: 'نوع' },
    { id: '4', name: 'VIP', description: 'مشتریان VIP', color: '#f59e0b', linkedTo: 'مشتری' },
  ];

  const categories = [
    { id: '1', name: 'شکایات فنی', description: 'مسائل فنی و قطعی', subCategories: ['قطعی برق', 'کیفیت برق', 'نوسان ولتاژ'] },
    { id: '2', name: 'خدمات مشتریان', description: 'خدمات و پشتیبانی', subCategories: ['صورتحساب', 'قرائت کنتور', 'تغییر نام'] },
    { id: '3', name: 'شکایات اداری', description: 'مسائل اداری و مالی', subCategories: ['تاخیر در خدمات', 'رفتار کارکنان'] },
  ];

  const CreateLabelDialog = ({ type }: { type: 'label' | 'tag' | 'category' }) => {
    const typeLabels = {
      label: 'لیبل',
      tag: 'تگ',
      category: 'دسته‌بندی'
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            ایجاد {typeLabels[type]} جدید
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>ایجاد {typeLabels[type]} جدید</DialogTitle>
            <DialogDescription>
              اطلاعات {typeLabels[type]} جدید را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>نام {typeLabels[type]}</Label>
              <Input placeholder={`نام ${typeLabels[type]} را وارد کنید`} />
            </div>

            <div className="space-y-2">
              <Label>توضیحات</Label>
              <Textarea placeholder="توضیحات اختیاری" />
            </div>

            <div className="space-y-2">
              <Label>رنگ</Label>
              <div className="flex gap-2">
                {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {type === 'tag' && (
              <div className="space-y-2">
                <Label>پیوند با</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نوع پیوند" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complaint">شکایات</SelectItem>
                    <SelectItem value="customer">مشتری</SelectItem>
                    <SelectItem value="location">مکان</SelectItem>
                    <SelectItem value="type">نوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">انصراف</Button>
            <Button>ایجاد</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>مدیریت لیبل‌ها، تگ‌ها و دسته‌بندی‌ها</h1>
          <p className="text-muted-foreground">
            سازماندهی و مدیریت سیستم برچسب‌گذاری CRM
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            ورود از CSV
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            خروج CSV
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="جستجو در لیبل‌ها، تگ‌ها و دسته‌بندی‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              فیلتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="labels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="labels" className="gap-2">
            <Tag className="w-4 h-4" />
            لیبل‌ها ({labels.length})
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Hash className="w-4 h-4" />
            تگ‌ها ({tags.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Folder className="w-4 h-4" />
            دسته‌بندی‌ها ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Labels Tab */}
        <TabsContent value="labels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>مدیریت لیبل‌ها</h3>
            <CreateLabelDialog type="label" />
          </div>

          <div className="grid gap-4">
            {labels.map((label) => (
              <Card key={label.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedItems.includes(label.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, label.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== label.id));
                          }
                        }}
                      />

                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <div>
                          <h4 className="font-medium">{label.name}</h4>
                          <p className="text-sm text-muted-foreground">{label.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="gap-1">
                        <Tag className="w-3 h-3" />
                        {label.usageCount} استفاده
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
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            حذف
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

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>مدیریت تگ‌ها</h3>
            <CreateLabelDialog type="tag" />
          </div>

          <div className="grid gap-4">
            {tags.map((tag) => (
              <Card key={tag.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedItems.includes(`tag-${tag.id}`)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, `tag-${tag.id}`]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== `tag-${tag.id}`));
                          }
                        }}
                      />

                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div>
                          <h4 className="font-medium">#{tag.name}</h4>
                          <p className="text-sm text-muted-foreground">{tag.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{tag.linkedTo}</Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            حذف
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

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>مدیریت دسته‌بندی‌ها</h3>
            <CreateLabelDialog type="category" />
          </div>

          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedItems.includes(`cat-${category.id}`)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, `cat-${category.id}`]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== `cat-${category.id}`));
                          }
                        }}
                      />

                      <div className="flex items-center gap-3">
                        <Folder className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {category.subCategories.map((sub, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">
                        {category.subCategories.length} زیرمجموعه
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
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            حذف
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
      </Tabs>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                {selectedItems.length} مورد انتخاب شده
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  حذف گروهی
                </Button>
                <Button variant="outline" size="sm">
                  ویرایش گروهی
                </Button>
                <Button variant="outline" size="sm">
                  خروج انتخاب شده‌ها
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
