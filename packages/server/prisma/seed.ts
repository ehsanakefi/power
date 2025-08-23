import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// String constants for SQLite compatibility
const UserRole = {
  CLIENT: 'CLIENT',
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION'
} as const;

const TicketStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_INFO: 'PENDING_INFO',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
  ESCALATED: 'ESCALATED',
  ON_HOLD: 'ON_HOLD'
} as const;

const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL'
} as const;

const TicketType = {
  COMPLAINT: 'COMPLAINT',
  REQUEST: 'REQUEST',
  INQUIRY: 'INQUIRY',
  BILLING: 'BILLING',
  TECHNICAL: 'TECHNICAL',
  MAINTENANCE: 'MAINTENANCE',
  INSTALLATION: 'INSTALLATION',
  DISCONNECTION: 'DISCONNECTION',
  RECONNECTION: 'RECONNECTION',
  METER_READING: 'METER_READING',
  POWER_OUTAGE: 'POWER_OUTAGE',
  EMERGENCY: 'EMERGENCY'
} as const;

const TicketSource = {
  PHONE: 'PHONE',
  WEBSITE: 'WEBSITE',
  MOBILE_APP: 'MOBILE_APP',
  EMAIL: 'EMAIL',
  WALK_IN: 'WALK_IN',
  SMS: 'SMS',
  SOCIAL_MEDIA: 'SOCIAL_MEDIA',
  FIELD_VISIT: 'FIELD_VISIT'
} as const;

const ActivityType = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  ASSIGNED: 'ASSIGNED',
  REASSIGNED: 'REASSIGNED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  COMMENTED: 'COMMENTED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
  ESCALATED: 'ESCALATED',
  LABEL_ADDED: 'LABEL_ADDED',
  LABEL_REMOVED: 'LABEL_REMOVED',
  ATTACHMENT_ADDED: 'ATTACHMENT_ADDED',
  ATTACHMENT_REMOVED: 'ATTACHMENT_REMOVED',
  DUE_DATE_CHANGED: 'DUE_DATE_CHANGED'
} as const;

const NotificationType = {
  TICKET_ASSIGNED: 'TICKET_ASSIGNED',
  TICKET_UPDATED: 'TICKET_UPDATED',
  TICKET_COMMENTED: 'TICKET_COMMENTED',
  TICKET_RESOLVED: 'TICKET_RESOLVED',
  TICKET_CLOSED: 'TICKET_CLOSED',
  TICKET_ESCALATED: 'TICKET_ESCALATED',
  TICKET_OVERDUE: 'TICKET_OVERDUE',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  LOGIN_ALERT: 'LOGIN_ALERT',
  MENTION: 'MENTION',
  REMINDER: 'REMINDER'
} as const;

const LabelType = {
  GENERAL: 'GENERAL',
  STATUS: 'STATUS',
  PRIORITY: 'PRIORITY',
  CATEGORY: 'CATEGORY',
  DEPARTMENT: 'DEPARTMENT',
  SKILL: 'SKILL',
  LOCATION: 'LOCATION'
} as const;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  try {
    // Step 1: Clean the Database (in correct order to avoid FK constraint errors)
    console.log('🧹 Cleaning existing data...');

    await prisma.ticketFeedback.deleteMany({});
    await prisma.userMetrics.deleteMany({});
    await prisma.ticketMetrics.deleteMany({});
    await prisma.knowledgeArticle.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.userSession.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.ticketLabel.deleteMany({});
    await prisma.userLabel.deleteMany({});
    await prisma.label.deleteMany({});
    await prisma.ticketRelation.deleteMany({});
    await prisma.ticketEscalation.deleteMany({});
    await prisma.ticketAttachment.deleteMany({});
    await prisma.ticketActivity.deleteMany({});
    await prisma.ticketComment.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.departmentMember.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.userPermission.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.systemSetting.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Database cleaned successfully');

    // Step 2: Create Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await prisma.user.create({
      data: {
        phone: '09123456789',
        name: 'مدیر سیستم',
        email: 'admin@power-crm.ir',
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        passwordHash: hashedPassword,
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        employeeId: 'EMP001',
        department: 'مدیریت سیستم',
        position: 'مدیر سیستم CRM',
        preferences: JSON.stringify({
          language: 'fa',
          theme: 'light',
          notifications: {
            email: true,
            sms: true,
            inApp: true
          }
        })
      },
    });

    console.log('✅ Created admin user:', adminUser.name);

    // Step 3: Create Departments
    console.log('🏢 Creating departments...');

    const departments = [
      {
        name: 'معاونت منابع انسانی',
        description: 'مدیریت منابع انسانی و امور پرسنل',
        code: 'HR',
        phone: '021-88001100',
        email: 'hr@power-crm.ir',
        location: 'طبقه دوم، ساختمان مرکزی',
        autoAssign: true,
        slaHours: 48,
        createdById: adminUser.id
      },
      {
        name: 'معاونت برنامه‌ریزی و بودجه',
        description: 'برنامه‌ریزی استراتژیک و مدیریت بودجه',
        code: 'PB',
        phone: '021-88001200',
        email: 'planning@power-crm.ir',
        location: 'طبقه سوم، ساختمان مرکزی',
        autoAssign: false,
        slaHours: 72,
        createdById: adminUser.id
      },
      {
        name: 'معاونت فروش و خدمات مشترکین',
        description: 'خدمات مشتریان و فروش خدمات',
        code: 'CS',
        phone: '021-88001300',
        email: 'customer@power-crm.ir',
        location: 'طبقه اول، ساختمان خدمات',
        autoAssign: true,
        slaHours: 24,
        createdById: adminUser.id
      },
      {
        name: 'معاونت بهره‌برداری و دیسپاچینگ',
        description: 'عملیات شبکه برق و کنترل بار',
        code: 'OD',
        phone: '021-88001400',
        email: 'operations@power-crm.ir',
        location: 'مرکز کنترل، ساختمان عملیات',
        autoAssign: true,
        slaHours: 4,
        createdById: adminUser.id
      },
      {
        name: 'معاونت مالی و پشتیبانی',
        description: 'امور مالی و پشتیبانی سازمان',
        code: 'FS',
        phone: '021-88001500',
        email: 'finance@power-crm.ir',
        location: 'طبقه چهارم، ساختمان مرکزی',
        autoAssign: false,
        slaHours: 48,
        createdById: adminUser.id
      },
      {
        name: 'معاونت مهندسی',
        description: 'طراحی و مهندسی شبکه برق',
        code: 'ENG',
        phone: '021-88001600',
        email: 'engineering@power-crm.ir',
        location: 'ساختمان مهندسی',
        autoAssign: false,
        slaHours: 96,
        createdById: adminUser.id
      }
    ];

    const createdDepartments = [];
    for (const dept of departments) {
      const department = await prisma.department.create({ data: dept });
      createdDepartments.push(department);
      console.log('✅ Created department:', department.name);
    }

    // Step 4: Create Managers and Employees
    console.log('👥 Creating managers and employees...');

    const managers = [];
    const employees = [];

    // Create managers for each department
    for (let i = 0; i < createdDepartments.length; i++) {
      const dept = createdDepartments[i];
      const managerPhone = `0912345678${i + 1}`;

      const manager = await prisma.user.create({
        data: {
          phone: managerPhone,
          name: `مدیر ${dept.name}`,
          email: `manager${i + 1}@power-crm.ir`,
          role: UserRole.MANAGER,
          status: UserStatus.ACTIVE,
          passwordHash: hashedPassword,
          emailVerifiedAt: new Date(),
          phoneVerifiedAt: new Date(),
          employeeId: `MGR00${i + 1}`,
          department: dept.name,
          position: `مدیر ${dept.name}`,
          managerId: adminUser.id,
          preferences: JSON.stringify({
            language: 'fa',
            theme: 'light',
            notifications: { email: true, sms: true, inApp: true }
          })
        }
      });

      // Update department head
      await prisma.department.update({
        where: { id: dept.id },
        data: { headId: manager.id }
      });

      // Create department membership
      await prisma.departmentMember.create({
        data: {
          departmentId: dept.id,
          userId: manager.id,
          role: 'مدیر'
        }
      });

      managers.push(manager);
      console.log('✅ Created manager:', manager.name);
    }

    // Create employees for key departments (Customer Service, Operations, Engineering)
    const keyDepartments = [2, 3, 5]; // CS, OD, ENG indexes

    for (const deptIndex of keyDepartments) {
      const dept = createdDepartments[deptIndex];
      const manager = managers[deptIndex];

      for (let j = 1; j <= 2; j++) {
        const empPhone = `0912345680${deptIndex}${j}`;

        const employee = await prisma.user.create({
          data: {
            phone: empPhone,
            name: `کارشناس ${j} ${dept.name}`,
            email: `emp${deptIndex}${j}@power-crm.ir`,
            role: UserRole.EMPLOYEE,
            status: UserStatus.ACTIVE,
            passwordHash: hashedPassword,
            emailVerifiedAt: new Date(),
            phoneVerifiedAt: new Date(),
            employeeId: `EMP${deptIndex}0${j}`,
            department: dept.name,
            position: `کارشناس ${dept.name}`,
            managerId: manager.id,
            preferences: JSON.stringify({
              language: 'fa',
              theme: 'light',
              notifications: { email: true, sms: false, inApp: true }
            })
          }
        });

        // Create department membership
        await prisma.departmentMember.create({
          data: {
            departmentId: dept.id,
            userId: employee.id,
            role: 'کارشناس'
          }
        });

        employees.push(employee);
        console.log('✅ Created employee:', employee.name);
      }
    }

    // Step 5: Create Client User
    console.log('👤 Creating client users...');

    const clients = [];
    const clientData = [
      {
        phone: '09123456700',
        name: 'علی احمدی',
        email: 'ali.ahmadi@example.com',
        customerArea: 'منطقه 1',
        meterNumber: '12345678901',
        accountNumber: 'ACC001'
      },
      {
        phone: '09123456701',
        name: 'فاطمه محمدی',
        email: 'fateme.mohammadi@example.com',
        customerArea: 'منطقه 2',
        meterNumber: '12345678902',
        accountNumber: 'ACC002'
      },
      {
        phone: '09123456702',
        name: 'محمد رضایی',
        email: 'mohammad.rezaei@example.com',
        customerArea: 'منطقه 3',
        meterNumber: '12345678903',
        accountNumber: 'ACC003'
      }
    ];

    for (const clientInfo of clientData) {
      const client = await prisma.user.create({
        data: {
          phone: clientInfo.phone,
          name: clientInfo.name,
          email: clientInfo.email,
          role: UserRole.CLIENT,
          status: UserStatus.ACTIVE,
          passwordHash: hashedPassword,
          phoneVerifiedAt: new Date(),
          metadata: JSON.stringify({
            customerArea: clientInfo.customerArea,
            meterNumber: clientInfo.meterNumber,
            accountNumber: clientInfo.accountNumber,
            address: `آدرس نمونه ${clientInfo.name}`,
            registrationDate: new Date().toISOString()
          }),
          preferences: JSON.stringify({
            language: 'fa',
            theme: 'light',
            notifications: { email: false, sms: true, inApp: true }
          })
        }
      });

      clients.push(client);
      console.log('✅ Created client:', client.name);
    }

    // Step 6: Create Categories
    console.log('📂 Creating categories...');

    const categories = [
      {
        name: 'شکایت از قطعی برق',
        description: 'شکایات مربوط به قطعی برق و عدم تامین انرژی',
        color: '#ef4444',
        icon: 'power-off',
        departmentId: createdDepartments[3].id, // Operations
        autoAssignTo: employees[2]?.id,
        slaHours: 4,
        isActive: true,
        createdById: adminUser.id
      },
      {
        name: 'درخواست نصب جدید',
        description: 'درخواست نصب انشعاب جدید برق',
        color: '#10b981',
        icon: 'plug',
        departmentId: createdDepartments[2].id, // Customer Service
        autoAssignTo: employees[0]?.id,
        slaHours: 72,
        isActive: true,
        createdById: adminUser.id
      },
      {
        name: 'مشکلات صورتحساب',
        description: 'شکایات و سوالات مربوط به صورتحساب برق',
        color: '#f59e0b',
        icon: 'receipt',
        departmentId: createdDepartments[4].id, // Finance
        slaHours: 48,
        isActive: true,
        createdById: adminUser.id
      },
      {
        name: 'مشکلات فنی',
        description: 'مشکلات فنی تجهیزات و شبکه',
        color: '#8b5cf6',
        icon: 'wrench',
        departmentId: createdDepartments[5].id, // Engineering
        autoAssignTo: employees[4]?.id,
        slaHours: 24,
        isActive: true,
        createdById: adminUser.id
      },
      {
        name: 'درخواست تعمیرات',
        description: 'درخواست تعمیر و نگهداری تجهیزات',
        color: '#06b6d4',
        icon: 'hammer',
        departmentId: createdDepartments[3].id, // Operations
        autoAssignTo: employees[3]?.id,
        slaHours: 8,
        isActive: true,
        createdById: adminUser.id
      }
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const category = await prisma.category.create({ data: cat });
      createdCategories.push(category);
      console.log('✅ Created category:', category.name);
    }

    // Step 7: Create Sample Tickets
    console.log('🎫 Creating sample tickets...');

    const sampleTickets = [
      {
        title: 'قطعی برق در خیابان انقلاب',
        description: 'از ساعت 8 صبح امروز برق خیابان انقلاب قطع است. چندین مغازه و منزل تحت تاثیر قرار گرفته‌اند.',
        status: TicketStatus.OPEN,
        priority: Priority.CRITICAL,
        type: TicketType.POWER_OUTAGE,
        source: TicketSource.PHONE,
        authorId: clients[0].id,
        categoryId: createdCategories[0].id,
        departmentId: createdDepartments[3].id,
        assigneeId: employees[2]?.id,
        customerName: clients[0].name,
        customerPhone: clients[0].phone,
        customerEmail: clients[0].email,
        customerAddress: 'خیابان انقلاب، پلاک 123',
        customerArea: 'منطقه 1',
        meterNumber: '12345678901',
        accountNumber: 'ACC001',
        tags: 'فوری,اضطراری,شبکه',
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        estimatedHours: 2,
        metadata: JSON.stringify({
          reportedBy: 'تماس تلفنی',
          affectedCustomers: 15,
          equipmentInvolved: ['ترانسفورماتور T-123', 'کابل فشار متوسط']
        })
      },
      {
        title: 'درخواست نصب انشعاب جدید',
        description: 'برای ساختمان جدید احداثی در منطقه 2 نیاز به نصب انشعاب برق 3 فاز داریم.',
        status: TicketStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        type: TicketType.INSTALLATION,
        source: TicketSource.WEBSITE,
        authorId: clients[1].id,
        categoryId: createdCategories[1].id,
        departmentId: createdDepartments[2].id,
        assigneeId: employees[0]?.id,
        customerName: clients[1].name,
        customerPhone: clients[1].phone,
        customerEmail: clients[1].email,
        customerAddress: 'خیابان شهید بهشتی، پلاک 45',
        customerArea: 'منطقه 2',
        accountNumber: 'ACC002',
        tags: 'نصب,مسکونی,سه‌فاز',
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
        estimatedHours: 8,
        firstResponseAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: JSON.stringify({
          buildingType: 'مسکونی',
          floors: 4,
          units: 8,
          requiredCapacity: '50KW'
        })
      },
      {
        title: 'اعتراض به مبلغ قبض برق',
        description: 'قبض برق ماه جاری 3 برابر ماه‌های قبل محاسبه شده است. درخواست بررسی و اصلاح دارم.',
        status: TicketStatus.RESOLVED,
        priority: Priority.HIGH,
        type: TicketType.BILLING,
        source: TicketSource.MOBILE_APP,
        authorId: clients[2].id,
        categoryId: createdCategories[2].id,
        departmentId: createdDepartments[4].id,
        customerName: clients[2].name,
        customerPhone: clients[2].phone,
        customerEmail: clients[2].email,
        customerAddress: 'خیابان آزادی، پلاک 67',
        customerArea: 'منطقه 3',
        meterNumber: '12345678903',
        accountNumber: 'ACC003',
        tags: 'صورتحساب,اعتراض,تصحیح',
        resolution: 'بررسی انجام شد. خطا در قرائت کنتور تشخیص داده شد و قبض اصلاح گردید.',
        resolutionNotes: 'مبلغ اضافی در قبض بعدی کسر خواهد شد.',
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        resolvedById: managers[4].id,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        estimatedHours: 4,
        actualHours: 3,
        firstResponseAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        metadata: JSON.stringify({
          previousBill: 150000,
          currentBill: 450000,
          correctedBill: 160000,
          meterReading: {
            previous: 12500,
            current: 12650,
            difference: 150
          }
        })
      },
      {
        title: 'نوسان ولتاژ در محله صنعتی',
        description: 'در محله صنعتی نوسان شدید ولتاژ وجود دارد که باعث خرابی تجهیزات کارخانه‌ها شده است.',
        status: TicketStatus.ESCALATED,
        priority: Priority.URGENT,
        type: TicketType.TECHNICAL,
        source: TicketSource.FIELD_VISIT,
        authorId: clients[0].id,
        categoryId: createdCategories[3].id,
        departmentId: createdDepartments[5].id,
        assigneeId: employees[4]?.id,
        customerName: clients[0].name,
        customerPhone: clients[0].phone,
        customerAddress: 'شهرک صنعتی، خیابان اول',
        customerArea: 'منطقه صنعتی',
        meterNumber: '12345678901',
        accountNumber: 'ACC001',
        tags: 'نوسان‌ولتاژ,صنعتی,خرابی',
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        estimatedHours: 16,
        firstResponseAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        metadata: JSON.stringify({
          voltageRange: '380V ± 50V',
          affectedFactories: 8,
          damageCost: 50000000,
          equipmentNeeded: ['تنظیم‌کننده ولتاژ', 'کنتاکتور اضطراری']
        })
      }
    ];

    const createdTickets = [];
    for (const ticketData of sampleTickets) {
      // Generate unique ticket number
      const ticketNumber = `TK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

      const ticket = await prisma.ticket.create({
        data: {
          ...ticketData,
          ticketNumber,
          attachmentCount: Math.floor(Math.random() * 3) // 0-2 attachments
        }
      });

      createdTickets.push(ticket);
      console.log('✅ Created ticket:', ticket.title);

      // Create ticket activities
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          userId: ticket.authorId,
          action: ActivityType.CREATED,
          description: 'تیکت ایجاد شد',
          metadata: JSON.stringify({
            source: ticket.source,
            priority: ticket.priority
          })
        }
      });

      if (ticket.assigneeId) {
        await prisma.ticketActivity.create({
          data: {
            ticketId: ticket.id,
            userId: ticket.assigneeId,
            action: ActivityType.ASSIGNED,
            description: 'تیکت واگذار شد',
            oldValue: null,
            newValue: ticket.assigneeId.toString(),
            createdAt: new Date(ticket.createdAt.getTime() + 30 * 60 * 1000) // 30 minutes later
          }
        });
      }

      if (ticket.status === TicketStatus.IN_PROGRESS) {
        await prisma.ticketActivity.create({
          data: {
            ticketId: ticket.id,
            userId: ticket.assigneeId!,
            action: ActivityType.STATUS_CHANGED,
            description: 'وضعیت تیکت تغییر کرد',
            oldValue: 'OPEN',
            newValue: 'IN_PROGRESS',
            createdAt: new Date(ticket.createdAt.getTime() + 60 * 60 * 1000) // 1 hour later
          }
        });
      }

      if (ticket.status === TicketStatus.RESOLVED) {
        await prisma.ticketActivity.create({
          data: {
            ticketId: ticket.id,
            userId: ticket.resolvedById!,
            action: ActivityType.RESOLVED,
            description: 'تیکت حل شد',
            oldValue: 'IN_PROGRESS',
            newValue: 'RESOLVED',
            createdAt: ticket.resolvedAt!
          }
        });
      }

      // Create some comments
      if (Math.random() > 0.5) {
        await prisma.ticketComment.create({
          data: {
            ticketId: ticket.id,
            authorId: ticket.authorId,
            content: 'لطفاً در اسرع وقت پیگیری کنید. مشکل همچنان ادامه دارد.',
            isInternal: false,
            createdAt: new Date(ticket.createdAt.getTime() + 2 * 60 * 60 * 1000)
          }
        });

        if (ticket.assigneeId) {
          await prisma.ticketComment.create({
            data: {
              ticketId: ticket.id,
              authorId: ticket.assigneeId,
              content: 'درخواست شما در حال بررسی است. به زودی اقدامات لازم انجام خواهد شد.',
              isInternal: false,
              createdAt: new Date(ticket.createdAt.getTime() + 3 * 60 * 60 * 1000)
            }
          });
        }
      }
    }

    // Step 8: Create Labels
    console.log('🏷️ Creating labels...');

    const labels = [
      { name: 'فوری', description: 'نیاز به اقدام فوری', color: '#ef4444', type: LabelType.PRIORITY, isSystem: true, createdById: adminUser.id },
      { name: 'VIP', description: 'مشتری ویژه', color: '#f59e0b', type: LabelType.CATEGORY, isSystem: true, createdById: adminUser.id },
      { name: 'تکراری', description: 'مشکل تکراری', color: '#8b5cf6', type: LabelType.STATUS, isSystem: true, createdById: adminUser.id },
      { name: 'نیاز به بازدید', description: 'نیاز به بازدید میدانی', color: '#06b6d4', type: LabelType.GENERAL, isSystem: false, createdById: adminUser.id }
    ];

    const createdLabels = [];
    for (const labelData of labels) {
      const label = await prisma.label.create({ data: labelData });
      createdLabels.push(label);
      console.log('✅ Created label:', label.name);
    }

    // Assign some labels to tickets
    await prisma.ticketLabel.create({
      data: {
        ticketId: createdTickets[0].id,
        labelId: createdLabels[0].id, // فوری
        addedById: adminUser.id
      }
    });

    await prisma.ticketLabel.create({
      data: {
        ticketId: createdTickets[3].id,
        labelId: createdLabels[3].id, // نیاز به بازدید
        addedById: employees[4]?.id || adminUser.id
      }
    });

    // Step 9: Create Notifications
    console.log('🔔 Creating notifications...');

    for (const client of clients) {
      await prisma.notification.create({
        data: {
          userId: client.id,
          type: NotificationType.TICKET_ASSIGNED,
          title: 'تیکت جدید ثبت شد',
          message: 'درخواست شما با موفقیت ثبت شد و در حال بررسی است.',
          channels: 'sms,in_app',
          ticketId: createdTickets[0].id
        }
      });
    }

    // Step 10: Create System Settings
    console.log('⚙️ Creating system settings...');

    const systemSettings = [
      { key: 'site_name', value: 'سیستم CRM شرکت توزیع برق', description: 'نام سایت', category: 'general', isPublic: true },
      { key: 'default_sla_hours', value: '24', description: 'پیش‌فرض SLA به ساعت', category: 'tickets', isPublic: false },
      { key: 'max_file_size', value: '10485760', description: 'حداکثر حجم فایل (بایت)', category: 'upload', isPublic: false },
      { key: 'allowed_file_types', value: 'jpg,jpeg,png,pdf,doc,docx', description: 'فرمت‌های مجاز فایل', category: 'upload', isPublic: false },
      { key: 'notification_enabled', value: 'true', description: 'فعالسازی اعلانات', category: 'notifications', isPublic: false }
    ];

    for (const setting of systemSettings) {
      await prisma.systemSetting.create({
        data: {
          ...setting,
          updatedById: adminUser.id
        }
      });
      console.log('✅ Created system setting:', setting.key);
    }

    // Step 11: Create Sample Metrics
    console.log('📊 Creating sample metrics...');

    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 48 * 60 * 60 * 1000);

    await prisma.ticketMetrics.createMany({
      data: [
        {
          date: twoDaysAgo,
          totalCreated: 12,
          totalResolved: 8,
          totalClosed: 6,
          avgResolutionTime: 18.5,
          avgFirstResponseTime: 2.3,
          customerSatisfaction: 4.2,
          criticalCount: 2,
          highCount: 3,
          mediumCount: 5,
          lowCount: 2,
          complaintCount: 7,
          requestCount: 3,
          inquiryCount: 2,
          technicalCount: 0,
          slaMetPercent: 85.5,
          overdueCount: 2
        },
        {
          date: yesterday,
          totalCreated: 15,
          totalResolved: 12,
          totalClosed: 10,
          avgResolutionTime: 16.2,
          avgFirstResponseTime: 1.8,
          customerSatisfaction: 4.5,
          criticalCount: 1,
          highCount: 4,
          mediumCount: 7,
          lowCount: 3,
          complaintCount: 8,
          requestCount: 4,
          inquiryCount: 2,
          technicalCount: 1,
          slaMetPercent: 90.2,
          overdueCount: 1
        },
        {
          date: today,
          totalCreated: 4,
          totalResolved: 1,
          totalClosed: 0,
          avgResolutionTime: 24.0,
          avgFirstResponseTime: 3.2,
          customerSatisfaction: 4.1,
          criticalCount: 1,
          highCount: 1,
          mediumCount: 1,
          lowCount: 1,
          complaintCount: 2,
          requestCount: 1,
          inquiryCount: 1,
          technicalCount: 0,
          slaMetPercent: 75.0,
          overdueCount: 1
        }
      ]
    });

    console.log('✅ Created ticket metrics');

    // Create user metrics for employees
    for (const employee of employees.slice(0, 3)) {
      await prisma.userMetrics.create({
        data: {
          userId: employee.id,
          date: yesterday,
          ticketsAssigned: Math.floor(Math.random() * 10) + 1,
          ticketsResolved: Math.floor(Math.random() * 5) + 1,
          avgResolutionTime: Math.random() * 20 + 5,
          customerRating: Math.random() * 2 + 3, // 3-5 rating
          activeHours: Math.random() * 8 + 6 // 6-14 hours
        }
      });
    }

    console.log('✅ Created user metrics');

    // Final success message
    console.log('🎉 Database seeded successfully!');
    console.log('\n📱 Test Users Created:');
    console.log('========================================');
    console.log('Super Admin:');
    console.log(`  Phone: ${adminUser.phone}`);
    console.log(`  Name: ${adminUser.name}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log('');

    console.log('Managers:');
    managers.forEach((manager, index) => {
      console.log(`  ${index + 1}. ${manager.name}`);
      console.log(`     Phone: ${manager.phone}`);
      console.log(`     Email: ${manager.email}`);
    });
    console.log('');

    console.log('Employees:');
    employees.forEach((employee, index) => {
      console.log(`  ${index + 1}. ${employee.name}`);
      console.log(`     Phone: ${employee.phone}`);
      console.log(`     Email: ${employee.email}`);
    });
    console.log('');

    console.log('Clients:');
    clients.forEach((client, index) => {
      console.log(`  ${index + 1}. ${client.name}`);
      console.log(`     Phone: ${client.phone}`);
      console.log(`     Email: ${client.email}`);
    });
    console.log('');

    console.log('🔐 Login Information:');
    console.log('========================================');
    console.log('Password: password123 (for all users)');
    console.log('Use phone numbers above to login');
    console.log('');

    console.log('🏢 Departments Created:');
    console.log('========================================');
    createdDepartments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (${dept.code})`);
    });
    console.log('');

    console.log('📂 Categories Created:');
    console.log('========================================');
    createdCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
    });
    console.log('');

    console.log('🎫 Sample Tickets:');
    console.log('========================================');
    createdTickets.forEach((ticket, index) => {
      console.log(`${index + 1}. ${ticket.title}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Priority: ${ticket.priority}`);
      console.log(`   Number: ${ticket.ticketNumber}`);
    });
    console.log('');

    console.log('🏷️ Labels Created:');
    console.log('========================================');
    createdLabels.forEach((label, index) => {
      console.log(`${index + 1}. ${label.name} (${label.type})`);
    });
    console.log('');

    console.log('🔗 Next Steps:');
    console.log('========================================');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test API endpoints:');
    console.log('   GET /api/auth/profile');
    console.log('   GET /api/tickets');
    console.log('   GET /api/tickets/stats');
    console.log('   GET /api/departments');
    console.log('   GET /api/categories');
    console.log('3. Access Prisma Studio: npx prisma studio');
    console.log('4. View database: http://localhost:5555');
    console.log('');

    console.log('📊 Database Statistics:');
    console.log('========================================');
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.category.count(),
      prisma.ticket.count(),
      prisma.ticketComment.count(),
      prisma.ticketActivity.count(),
      prisma.label.count(),
      prisma.notification.count()
    ]);

    console.log(`Users: ${counts[0]}`);
    console.log(`Departments: ${counts[1]}`);
    console.log(`Categories: ${counts[2]}`);
    console.log(`Tickets: ${counts[3]}`);
    console.log(`Comments: ${counts[4]}`);
    console.log(`Activities: ${counts[5]}`);
    console.log(`Labels: ${counts[6]}`);
    console.log(`Notifications: ${counts[7]}`);
    console.log('');

    console.log('✅ Seed completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('\n🔍 Debugging Information:');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('🚨 Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  });
