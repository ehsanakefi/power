# سند مشخصات فنی پروژه CRM شرکت توزیع برق

این سند به عنوان مرجع اصلی برای معماری، پشته تکنولوژی و تصمیمات فنی پروژه عمل می‌کند.

---

## 1. نمای کلی پروژه (Project Overview)

-   **نام پروژه:** سیستم جامع مدیریت ارتباط با مشتری (CRM)
-   **هدف:** هوشمندسازی و مدیریت متمرکز شکایات و درخواست‌های مردمی از طریق پیامک (SMS) جهت افزایش رضایت‌مندی و بهبود فرآیندهای داخلی.

---

## 2. پشته تکنولوژی (Technology Stack)

### 2.1. بخش فرانت‌اند (Frontend)

-   **فریم‌ورک (Framework):** **Next.js** - برای ساخت اپلیکیشن React با قابلیت رندرینگ سمت سرور (SSR) و تولید صفحات استاتیک (SSG).
-   **زبان (Language):** **TypeScript** - برای تضمین Type-Safety و توسعه‌پذیری کد.
-   **کتابخانه UI (UI Library):** **MUI (Material-UI)** - برای توسعه سریع پنل‌های ادمین و مدیران با استفاده از کامپوننت‌های آماده و قابل سفارشی‌سازی.
-   **استایلینگ (Styling):** **Styled-components** - برای نوشتن CSS در سطح کامپوننت (CSS-in-JS) و پیاده‌سازی متدولوژی **Atomic Design**.
-   **مدیریت وضعیت (State Management):** **Zustand** - برای مدیریت وضعیت‌های سراسری اپلیکیشن به روشی ساده و کارآمد.
-   **ارتباط با سرور (Data Fetching):** **React Query (TanStack Query)** - برای مدیریت، کش کردن و همگام‌سازی داده‌ها از سرور.

### 2.2. بخش بک‌اند (Backend)

-   **محیط اجرایی (Runtime):** **Node.js**
-   **فریم‌ورک (Framework):** **Express.js** - یک فریم‌ورک وب مینیمال و قدرتمند برای ساخت API.
-   **زبان (Language):** **TypeScript** - برای توسعه کدی امن و مقیاس‌پذیر در سمت سرور.
-   **پایگاه داده (Database):** **PostgreSQL** - یک سیستم مدیریت پایگاه داده رابطه‌ای قدرتمند و متن‌باز.
-   **ORM:** **Prisma** - برای ارتباط امن و مدرن با پایگاه داده PostgreSQL و تضمین Type-Safety در لایه دیتا.
-   **احراز هویت (Authentication):** **Passport.js** با استراتژی **JWT (JSON Web Tokens)** - برای مدیریت ورود و دسترسی کاربران به API.

### 2.3. ابزارهای توسعه (DevOps & Tooling)

-   **مدیریت پکیج (Package Manager):** **NPM** یا **Yarn**
-   **کنترل نسخه (Version Control):** **Git** و **GitHub**

---

## 3. معماری اولیه (Initial Architecture)

### 3.1. ساختار پوشه‌ها (Folder Structure)

پروژه به صورت یک **Monorepo** مدیریت خواهد شد تا کد فرانت‌اند و بک‌اند در یک ریپازیتوری واحد قرار گیرند.

```
/
├── packages/
│   ├── client/         # اپلیکیشن Next.js (پنل مشتری و مدیران)
│   │   ├── src/
│   │   └── package.json
│   └── server/         # اپلیکیشن Express.js (API)
│       ├── src/
│       └── package.json
├── package.json        # فایل اصلی مدیریت Monorepo
└── tsconfig.base.json  # تنظیمات پایه TypeScript
```

### 3.2. طرح اولیه پایگاه داده (Initial Database Schema)

در این بخش، مدل‌های اصلی داده با استفاده از سینتکس Prisma تعریف می‌شوند:

```prisma
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }

// generator client {
//   provider = "prisma-client-js"
// }

model User {
  id        Int       @id @default(autoincrement())
  phone     String    @unique
  role      UserRole  @default(CLIENT)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  tickets   Ticket[]
}

model Ticket {
  id          Int       @id @default(autoincrement())
  title       String
  content     String
  status      String    @default("unseen")
  authorId    Int
  author      User      @relation(fields: [authorId], references: [id])
  history     Log[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Log {
  id        Int       @id @default(autoincrement())
  ticketId  Int
  ticket    Ticket    @relation(fields: [ticketId], references: [id])
  before    Json      // وضعیت قبلی
  after     Json      // وضعیت جدید
  changes   Json      // تغییرات اعمال شده
  user      String    // کاربری که تغییر را ایجاد کرده
  createdAt DateTime  @default(now())
}

enum UserRole {
  CLIENT
  EMPLOYEE
  MANAGER
  ADMIN
}
```

### 3.3. نقاط پایانی API (API Endpoints)

لیست اولیه‌ای از مسیرهای اصلی API:

-   `POST /api/auth/login` (ورود با شماره موبایل)
-   `POST /api/auth/verify` (تأیید کد پیامکی)
-   `GET /api/tickets` (دریافت لیست تیکت‌ها)
-   `POST /api/tickets` (ایجاد تیکت جدید - از طریق SMS Gateway)
-   `GET /api/tickets/:id` (دریافت جزئیات یک تیکت)
-   `PUT /api/tickets/:id` (آپدیت وضعیت یک تیکت)
-   `GET /api/tickets/:id/history` (دریافت تاریخچه یک تیکت)

---

## 4. قدم‌های بعدی (Next Steps)

1.  راه‌اندازی ساختار Monorepo.
2.  پیکربندی اولیه پروژه بک‌اند با Express.js و TypeScript.
3.  اتصال به دیتابیس PostgreSQL با Prisma و اجرای اولین Migration.
4.  پیاده‌سازی ماژول احراز هویت (Authentication).

```
