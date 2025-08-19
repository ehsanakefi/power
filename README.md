# سیستم جامع مدیریت ارتباط با مشتری (CRM) - شرکت توزیع برق

## 📋 نمای کلی

این پروژه یک سیستم جامع CRM برای هوشمندسازی و مدیریت متمرکز شکایات و درخواست‌های مردمی از طریق پیامک (SMS) می‌باشد که با هدف افزایش رضایت‌مندی مشتریان و بهبود فرآیندهای داخلی شرکت توزیع برق طراحی شده است.

## 🚀 ویژگی‌های کلیدی

- 📱 مدیریت شکایات از طریق پیامک (SMS)
- 👥 سیستم چندسطحی دسترسی (مشتری، کارمند، مدیر، ادمین)
- 📊 پنل مدیریت جامع برای مدیران
- 🔍 ردیابی کامل تاریخچه تیکت‌ها
- 🔐 احراز هویت امن با JWT
- 📈 گزارش‌گیری و آمارگیری

## 🛠️ پشته تکنولوژی

### Frontend
- **Next.js** - React framework با SSR/SSG
- **TypeScript** - Type-safe development  
- **MUI (Material-UI)** - UI component library
- **Styled-components** - CSS-in-JS styling
- **Zustand** - State management
- **React Query** - Data fetching & caching

### Backend  
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Server-side type safety
- **PostgreSQL** - Database
- **Prisma** - ORM & database toolkit
- **Passport.js + JWT** - Authentication

## 📁 ساختار پروژه (Monorepo)

```
/
├── packages/
│   ├── client/         # Next.js application
│   │   ├── src/
│   │   └── package.json
│   └── server/         # Express.js API
│       ├── src/
│       └── package.json
├── package.json        # Root package.json
└── tsconfig.base.json  # Base TypeScript config
```

## 🗄️ مدل داده

پروژه شامل موجودیت‌های اصلی زیر است:

- **User**: مدیریت کاربران (مشتری، کارمند، مدیر، ادمین)
- **Ticket**: شکایات و درخواست‌ها
- **Log**: تاریخچه تغییرات تیکت‌ها

## 🔗 API Endpoints

- `POST /api/auth/login` - ورود با شماره موبایل
- `POST /api/auth/verify` - تأیید کد پیامکی
- `GET /api/tickets` - دریافت لیست تیکت‌ها
- `POST /api/tickets` - ایجاد تیکت جدید
- `GET /api/tickets/:id` - جزئیات تیکت
- `PUT /api/tickets/:id` - به‌روزرسانی تیکت
- `GET /api/tickets/:id/history` - تاریخچه تیکت

## 🏁 شروع کار

### پیش‌نیازها

- Node.js (نسخه 18 یا بالاتر)
- PostgreSQL
- NPM یا Yarn

### نصب و راه‌اندازی

#### Backend Server

```bash
# کلون کردن repository
git clone <repository-url>
cd power

# نصب dependencies (root workspace)
npm install

# تنظیم متغیرهای محیطی
cd packages/server
cp .env.example .env
# ویرایش .env با تنظیمات دیتابیس خود

# راه‌اندازی دیتابیس
npm run db:push
npm run db:seed

# اجرای سرور در حالت development
npm run dev

# یا از root directory
cd ../..
npm run dev:server
```

#### Frontend Client

```bash
# از root directory
npm run dev:client

# یا مستقیماً از client directory
cd packages/client
npm run dev
```

#### اجرای همزمان (Full Stack)

```bash
# اجرای هم‌زمان backend و frontend
npm run dev:all
```

### تست API

پس از راه‌اندازی سرور:

```bash
# تست health check
curl http://localhost:3001/health

# تست ورود با کاربر تست
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "09123456789"}'
```

### کاربران تست (پس از seed)

- **Admin**: `09123456789`
- **Manager**: `09123456788`  
- **Employee**: `09123456787`
- **Client**: `09123456786`

کد تأیید development: `1234`

### وضعیت فعلی پروژه

✅ **Backend (مکمل)**
- Express.js API server با TypeScript
- Authentication با JWT و Passport.js
- پایگاه داده PostgreSQL با Prisma
- مسیرهای احراز هویت کاملاً پیاده‌سازی شده
- Ticket management API با CRUD operations
- Middleware امنیتی و Rate limiting
- Database schema و seeding

✅ **Frontend (مکمل - مرحله اول)**
- Next.js 14 با App Router و TypeScript
- Material-UI (MUI) برای UI components
- Zustand برای state management
- React Query برای data fetching
- RTL support برای متن فارسی
- Authentication store و API integration
- Responsive design و theme system

### مسیرهای API آماده

#### Authentication
- `POST /api/auth/login` - ورود با شماره موبایل
- `POST /api/auth/verify` - تأیید کد پیامکی
- `GET /api/auth/profile` - پروفایل کاربر (محافظت شده)
- `GET /api/auth/me` - اطلاعات کاربر فعلی
- `POST /api/auth/refresh` - تجدید توکن
- `POST /api/auth/logout` - خروج

#### Ticket Management
- `GET /api/tickets` - لیست تیکت‌ها (با pagination و filtering)
- `POST /api/tickets` - ایجاد تیکت جدید
- `GET /api/tickets/:id` - جزئیات تیکت
- `PUT /api/tickets/:id` - ویرایش محتوای تیکت
- `PUT /api/tickets/:id/status` - تغییر وضعیت تیکت
- `DELETE /api/tickets/:id` - حذف تیکت (admin/manager)
- `GET /api/tickets/:id/history` - تاریخچه تیکت
- `GET /api/tickets/stats` - آمار تیکت‌ها

#### System
- `GET /health` - بررسی وضعیت سرور
- `GET /api` - اطلاعات API

### Frontend Application

**آدرس:** `http://localhost:3000`

**امکانات فعلی:**
- صفحه اصلی با معرفی سیستم
- Authentication store آماده
- Theme system با RTL support
- Component architecture با Atomic Design
- API client configuration
- Error handling و loading states

### URLs مهم

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/health
- **API Documentation:** http://localhost:3001/api

## 📚 مستندات

برای اطلاعات تکمیلی در مورد معماری و طراحی سیستم، فایل [`TECHNICAL_SPEC.md`](./TECHNICAL_SPEC.md) را مطالعه کنید.

## 🤝 مشارکت

این پروژه در حال توسعه است. برای مشارکت:

1. Fork کردن repository
2. ایجاد branch جدید (`git checkout -b feature/amazing-feature`)
3. Commit تغییرات (`git commit -m 'Add some amazing feature'`)
4. Push به branch (`git push origin feature/amazing-feature`)
5. ایجاد Pull Request

## 📝 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

---

**توسعه‌دهنده:** تیم فنی شرکت توزیع برق
**تاریخ ایجاد:** 2024