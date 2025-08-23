'use client';


import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Checkbox } from '../../../components/ui/checkbox';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Search as SearchIcon, Filter, Download, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { fa } from 'date-fns/locale';
import { Task } from './task/page';

// Mock data for search
const mockSearchData: Task[] = [
  {
    id: 'T-001',
    title: 'قطع برق منطقه شهرک صدرا',
    description: 'شکایت مشتری از قطع مکرر برق در منطقه شهرک صدرا',
    status: 'دیده نشده',
    priority: 'فوری',
    assignedTo: 'احمد محمدی',
    dueDate: '1403/02/15',
    category: 'قطع برق',
    createdAt: '1403/02/10',
    updatedAt: '1403/02/10',
    comments: [],
    attachments: []
  },
  {
    id: 'T-002',
    title: 'درخواست انشعاب جدید',
    description: 'درخواست انشعاب برق جدید برای ساختمان تجاری',
    status: 'در حال انجام',
    priority: 'متوسط',
    assignedTo: 'فاطمه احمدی',
    dueDate: '1403/02/20',
    category: 'انشعاب جدید',
    createdAt: '1403/02/08',
    updatedAt: '1403/02/12',
    comments: [],
    attachments: []
  },
  {
    id: 'T-003',
    title: 'نوسان ولتاژ در منطقه میدان انقلاب',
    description: 'گزارش چندین مشتری از نوسان ولتاژ',
    status: 'انجام شده',
    priority: 'بالا',
    assignedTo: 'علی رضایی',
    dueDate: '1403/02/12',
    category: 'نوسان ولتاژ',
    createdAt: '1403/02/05',
    updatedAt: '1403/02/14',
    comments: [],
    attachments: []
  },
  {
    id: 'T-004',
    title: 'شکایت از قبض برق بالا',
    description: 'شکایت مشتری از مبلغ بالای قبض برق ماهانه',
    status: 'ارجاع شده به معاونت‌های دیگر',
    priority: 'متوسط',
    assignedTo: 'مریم صادقی',
    dueDate: '1403/02/18',
    category: 'قبض برق',
    createdAt: '1403/02/11',
    updatedAt: '1403/02/13',
    comments: [],
    attachments: []
  },
  {
    id: 'T-005',
    title: 'تعمیر کنتور برق',
    description: 'درخواست تعمیر کنتور برق خراب',
    status: 'پایان با موفقیت',
    priority: 'بالا',
    assignedTo: 'حسن کریمی',
    dueDate: '1403/02/16',
    category: 'تعمیرات',
    createdAt: '1403/02/09',
    updatedAt: '1403/02/15',
    comments: [],
    attachments: []
  }
];

interface SearchFilters {
  searchTerm: string;
  status: string;
  priority: string;
  assignedTo: string;
  category: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  logicOperator: 'AND' | 'OR';
}

const statusColors = {
  'دیده نشده': 'bg-red-500 text-white',
  'در حال انجام': 'bg-amber-500 text-white',
  'انجام شده': 'bg-green-500 text-white',
  'ارجاع شده به معاونت‌های دیگر': 'bg-purple-500 text-white',
  'پایان با موفقیت': 'bg-emerald-500 text-white',
  'پایان بدون نتیجه مطلوب': 'bg-red-600 text-white'
};

const priorityColors = {
  'فوری': 'bg-red-500 text-white',
  'بالا': 'bg-orange-500 text-white',
  'متوسط': 'bg-yellow-500 text-white',
  'پایین': 'bg-green-500 text-white'
};

export default function Search() {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: 'همه',
    priority: 'همه',
    assignedTo: 'همه',
    category: 'همه',
    dateFrom: null,
    dateTo: null,
    logicOperator: 'AND'
  });

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const filteredData = useMemo(() => {
    return mockSearchData.filter(task => {
      const conditions: boolean[] = [];

      // Search term condition
      if (filters.searchTerm) {
        const searchMatch =
          task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          task.id.toLowerCase().includes(filters.searchTerm.toLowerCase());
        conditions.push(searchMatch);
      }

      // Status condition
      if (filters.status !== 'همه') {
        conditions.push(task.status === filters.status);
      }

      // Priority condition
      if (filters.priority !== 'همه') {
        conditions.push(task.priority === filters.priority);
      }

      // Assigned to condition
      if (filters.assignedTo !== 'همه') {
        conditions.push(task.assignedTo === filters.assignedTo);
      }

      // Category condition
      if (filters.category !== 'همه') {
        conditions.push(task.category === filters.category);
      }

      // Date range conditions would go here
      // For now, we'll skip date filtering implementation

      // Apply logic operator
      if (conditions.length === 0) return true;

      return filters.logicOperator === 'AND'
        ? conditions.every(condition => condition)
        : conditions.some(condition => condition);
    });
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'همه',
      priority: 'همه',
      assignedTo: 'همه',
      category: 'همه',
      dateFrom: null,
      dateTo: null,
      logicOperator: 'AND'
    });
    setSelectedTasks([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredData.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const exportToCSV = () => {
    const selectedData = filteredData.filter(task =>
      selectedTasks.length > 0 ? selectedTasks.includes(task.id) : true
    );

    const headers = ['شناسه', 'عنوان', 'وضعیت', 'اولویت', 'مسئول', 'تاریخ تحویل', 'دسته‌بندی'];
    const csvContent = [
      headers.join(','),
      ...selectedData.map(task => [
        task.id,
        `"${task.title}"`,
        task.status,
        task.priority,
        task.assignedTo,
        task.dueDate,
        task.category
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm') return value !== '';
    if (key === 'dateFrom' || key === 'dateTo') return value !== null;
    if (key === 'logicOperator') return false;
    return value !== 'همه';
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">جستجوی پیشرفته</h2>

        {/* Main Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو در عنوان، شرح یا شناسه وظیفه..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pr-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="whitespace-nowrap"
          >
            <Filter className="w-4 h-4 ml-2" />
            فیلترهای پیشرفته
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="mr-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="w-4 h-4 ml-2" />
              پاک کردن فیلترها
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">فیلترهای پیشرفته</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">وضعیت</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="همه">همه وضعیت‌ها</SelectItem>
                      <SelectItem value="دیده نشده">دیده نشده</SelectItem>
                      <SelectItem value="در حال انجام">در حال انجام</SelectItem>
                      <SelectItem value="انجام شده">انجام شده</SelectItem>
                      <SelectItem value="ارجاع شده به معاونت‌های دیگر">ارجاع شده</SelectItem>
                      <SelectItem value="پایان با موفقیت">پایان با موفقیت</SelectItem>
                      <SelectItem value="پایان بدون نتیجه مطلوب">پایان بدون نتیجه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">اولویت</Label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => handleFilterChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="همه">همه اولویت‌ها</SelectItem>
                      <SelectItem value="فوری">فوری</SelectItem>
                      <SelectItem value="بالا">بالا</SelectItem>
                      <SelectItem value="متوسط">متوسط</SelectItem>
                      <SelectItem value="پایین">پایین</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">مسئول</Label>
                  <Select
                    value={filters.assignedTo}
                    onValueChange={(value) => handleFilterChange('assignedTo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="همه">همه کاربران</SelectItem>
                      <SelectItem value="احمد محمدی">احمد محمدی</SelectItem>
                      <SelectItem value="فاطمه احمدی">فاطمه احمدی</SelectItem>
                      <SelectItem value="علی رضایی">علی رضایی</SelectItem>
                      <SelectItem value="مریم صادقی">مریم صادقی</SelectItem>
                      <SelectItem value="حسن کریمی">حسن کریمی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">دسته‌بندی</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="همه">همه دسته‌ها</SelectItem>
                      <SelectItem value="قطع برق">قطع برق</SelectItem>
                      <SelectItem value="نوسان ولتاژ">نوسان ولتاژ</SelectItem>
                      <SelectItem value="انشعاب جدید">انشعاب جدید</SelectItem>
                      <SelectItem value="قبض برق">قبض برق</SelectItem>
                      <SelectItem value="تعمیرات">تعمیرات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">منطق ترکیب فیلترها:</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="and"
                    checked={filters.logicOperator === 'AND'}
                    onCheckedChange={() => handleFilterChange('logicOperator', 'AND')}
                  />
                  <Label htmlFor="and" className="text-sm">و (AND)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="or"
                    checked={filters.logicOperator === 'OR'}
                    onCheckedChange={() => handleFilterChange('logicOperator', 'OR')}
                  />
                  <Label htmlFor="or" className="text-sm">یا (OR)</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">
              نتایج جستجو ({filteredData.length.toLocaleString('fa-IR')} مورد)
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredData.length === 0}
              >
                <Download className="w-4 h-4 ml-2" />
                خروجی CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTasks.length === filteredData.length && filteredData.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>شناسه</TableHead>
                    <TableHead>عنوان</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>اولویت</TableHead>
                    <TableHead>مسئول</TableHead>
                    <TableHead>تاریخ تحویل</TableHead>
                    <TableHead>دسته‌بندی</TableHead>
                    <TableHead>آخرین به‌روزرسانی</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{task.id}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={task.title}>
                          {task.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColors[task.status]}`}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.assignedTo}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>{task.category}</TableCell>
                      <TableCell>{task.updatedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              هیچ نتیجه‌ای برای جستجوی شما یافت نشد
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}
