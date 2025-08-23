export interface OrgNode {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  parentId?: string;
  level: number;
  children: OrgNode[];
  employeeCount?: number;
}

export const mockOrgData: OrgNode = {
  id: '1',
  name: 'احمد محمودی',
  position: 'مدیر عامل',
  department: 'مدیریت',
  email: 'a.mahmoudi@company.com',
  phone: '021-12345678',
  level: 0,
  children: [
    {
      id: '2',
      name: 'علی احمدی',
      position: 'مدیر IT',
      department: 'فناوری اطلاعات',
      email: 'ali.ahmadi@company.com',
      phone: '021-12345679',
      parentId: '1',
      level: 1,
      employeeCount: 8,
      children: [
        {
          id: '21',
          name: 'سارا رضایی',
          position: 'کارشناس شبکه',
          department: 'فناوری اطلاعات',
          email: 's.rezaei@company.com',
          phone: '021-12345680',
          parentId: '2',
          level: 2,
          children: []
        },
        {
          id: '22',
          name: 'محمد حسنی',
          position: 'برنامه‌نویس',
          department: 'فناوری اطلاعات',
          email: 'm.hasani@company.com',
          phone: '021-12345681',
          parentId: '2',
          level: 2,
          children: []
        }
      ]
    },
    {
      id: '3',
      name: 'فاطمه کریمی',
      position: 'مدیر خدمات مشتریان',
      department: 'خدمات مشتریان',
      email: 'f.karimi@company.com',
      phone: '021-12345682',
      parentId: '1',
      level: 1,
      employeeCount: 15,
      children: [
        {
          id: '31',
          name: 'رضا احمدی',
          position: 'سرپرست پشتیبانی',
          department: 'خدمات مشتریان',
          email: 'r.ahmadi@company.com',
          phone: '021-12345683',
          parentId: '3',
          level: 2,
          children: []
        }
      ]
    },
    {
      id: '4',
      name: 'حسین رضوی',
      position: 'مدیر فنی',
      department: 'فنی و مهندسی',
      email: 'h.razavi@company.com',
      phone: '021-12345684',
      parentId: '1',
      level: 1,
      employeeCount: 12,
      children: [
        {
          id: '41',
          name: 'مریم صالحی',
          position: 'مهندس برق',
          department: 'فنی و مهندسی',
          email: 'm.salehi@company.com',
          phone: '021-12345685',
          parentId: '4',
          level: 2,
          children: []
        },
        {
          id: '42',
          name: 'علیرضا موسوی',
          position: 'تکنسین',
          department: 'فنی و مهندسی',
          email: 'a.mousavi@company.com',
          phone: '021-12345686',
          parentId: '4',
          level: 2,
          children: []
        }
      ]
    }
  ]
};

export const departments = [
  'فناوری اطلاعات',
  'خدمات مشتریان', 
  'فنی و مهندسی',
  'اداری',
  'مالی'
];

export const positions = [
  'مدیر عامل',
  'مدیر بخش',
  'سرپرست',
  'کارشناس ارشد',
  'کارشناس',
  'تکنسین',
  'اپراتور'
];