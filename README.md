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

### نصب

```bash
# کلون کردن repository
git clone <repository-url>
cd crm-project

# نصب dependencies
npm install

# راه‌اندازی دیتابیس
npx prisma migrate dev

# اجرای پروژه در حالت development
npm run dev
```

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