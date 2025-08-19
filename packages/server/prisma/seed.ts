import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { phone: '09123456789' },
      update: {},
      create: {
        phone: '09123456789',
        role: UserRole.ADMIN,
      },
    });

    console.log('✅ Created admin user:', adminUser);

    // Create manager user
    const managerUser = await prisma.user.upsert({
      where: { phone: '09123456788' },
      update: {},
      create: {
        phone: '09123456788',
        role: UserRole.MANAGER,
      },
    });

    console.log('✅ Created manager user:', managerUser);

    // Create employee user
    const employeeUser = await prisma.user.upsert({
      where: { phone: '09123456787' },
      update: {},
      create: {
        phone: '09123456787',
        role: UserRole.EMPLOYEE,
      },
    });

    console.log('✅ Created employee user:', employeeUser);

    // Create client user
    const clientUser = await prisma.user.upsert({
      where: { phone: '09123456786' },
      update: {},
      create: {
        phone: '09123456786',
        role: UserRole.CLIENT,
      },
    });

    console.log('✅ Created client user:', clientUser);

    // Create additional test clients
    const client2 = await prisma.user.upsert({
      where: { phone: '09123456785' },
      update: {},
      create: {
        phone: '09123456785',
        role: UserRole.CLIENT,
      },
    });

    console.log('✅ Created second client user:', client2);

    // Create sample tickets with more variety
    const sampleTickets = [
      {
        title: 'قطعی برق در منطقه شهرک صنعتی',
        content: 'سلام، از ساعت 8 صبح برق منطقه شهرک صنعتی قطع است. لطفاً پیگیری کنید.',
        status: 'unseen',
        authorId: clientUser.id,
      },
      {
        title: 'مشکل در کنتور برق',
        content: 'کنتور برق منزل ما خراب است و نمایش درستی ندارد.',
        status: 'in_progress',
        authorId: clientUser.id,
      },
      {
        title: 'درخواست نصب کنتور جدید',
        content: 'برای منزل جدید احداثی نیاز به نصب کنتور برق داریم.',
        status: 'resolved',
        authorId: clientUser.id,
      },
      {
        title: 'نوسان ولتاژ برق',
        content: 'در خانه ما نوسان ولتاژ زیادی وجود دارد که باعث خرابی لوازم برقی می‌شود.',
        status: 'unseen',
        authorId: client2.id,
      },
      {
        title: 'درخواست تعمیر کابل برق',
        content: 'کابل برق خیابان ما آسیب دیده و نیاز به تعمیر فوری دارد.',
        status: 'in_progress',
        authorId: client2.id,
      },
      {
        title: 'شکایت از قبض برق',
        content: 'قبض برق این ماه بیش از حد معمول است و درخواست بررسی دارم.',
        status: 'closed',
        authorId: clientUser.id,
      },
      {
        title: 'مشکل روشنایی معابر',
        content: 'چراغ‌های خیابان محله ما خاموش هستند و ایمنی را تهدید می‌کند.',
        status: 'rejected',
        authorId: client2.id,
      },
    ];

    for (const ticketData of sampleTickets) {
      const ticket = await prisma.ticket.create({
        data: ticketData,
      });

      console.log('✅ Created ticket:', ticket.title);

      // Create initial log entry for each ticket
      await prisma.log.create({
        data: {
          ticketId: ticket.id,
          before: {},
          after: {
            title: ticket.title,
            content: ticket.content,
            status: ticket.status,
            authorId: ticket.authorId,
          },
          changes: {
            action: 'created',
            title: ticket.title,
            status: ticket.status,
          },
          user: `User:${ticket.authorId}`,
        },
      });

      // Add realistic status progression with timestamps
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      if (ticket.status === 'in_progress') {
        await prisma.log.create({
          data: {
            ticketId: ticket.id,
            before: { status: 'unseen' },
            after: { status: 'in_progress' },
            changes: {
              action: 'status_changed',
              from: 'unseen',
              to: 'in_progress',
              note: 'تیکت در حال بررسی است',
            },
            user: `User:${employeeUser.id}`,
            createdAt: oneHourAgo,
          },
        });
      }

      if (ticket.status === 'resolved') {
        // First change to in_progress
        await prisma.log.create({
          data: {
            ticketId: ticket.id,
            before: { status: 'unseen' },
            after: { status: 'in_progress' },
            changes: {
              action: 'status_changed',
              from: 'unseen',
              to: 'in_progress',
              note: 'شروع بررسی درخواست',
            },
            user: `User:${employeeUser.id}`,
            createdAt: twoHoursAgo,
          },
        });

        // Then resolve
        await prisma.log.create({
          data: {
            ticketId: ticket.id,
            before: { status: 'in_progress' },
            after: { status: 'resolved' },
            changes: {
              action: 'status_changed',
              from: 'in_progress',
              to: 'resolved',
              resolution: 'مشکل با موفقیت برطرف شد',
            },
            user: `User:${managerUser.id}`,
            createdAt: oneHourAgo,
          },
        });
      }

      if (ticket.status === 'closed') {
        // Progress through all statuses
        await prisma.log.create({
          data: {
            ticketId: ticket.id,
            before: { status: 'unseen' },
            after: { status: 'in_progress' },
            changes: {
              action: 'status_changed',
              from: 'unseen',
              to: 'in_progress',
            },
            user: `User:${employeeUser.id}`,
            createdAt: oneDayAgo,
          },
        });

        await prisma.log.create({
          data: {
            ticketId: ticket.id,
            before: { status: 'in_progress' },
            after: { status: 'resolved' },
            changes: {
              action: 'status_changed',
              from: 'in_progress',
              to: 'resolved',
              resolution: 'مشکل حل شد',
            },
            user: `User:${employeeUser.id}`,
            createdAt: twoHoursAgo,
          },
        });

        await prisma.log.create({
          data: {
            ticketId: ticket.id,
            before: { status: 'resolved' },
            after: { status: 'closed' },
            changes: {
              action: 'status_changed',
              from: 'resolved',
              to: 'closed',
              note: 'تیکت بسته شد',
            },
            user: `User:${managerUser.id}`,
            createdAt: oneHourAgo,
          },
        });
      }

      if (ticket.status === 'rejected') {
        await prisma.log.create({
          data: {
            ticketId: ticket.id,
            before: { status: 'unseen' },
            after: { status: 'rejected' },
            changes: {
              action: 'status_changed',
              from: 'unseen',
              to: 'rejected',
              reason: 'درخواست خارج از حوزه وظایف شرکت',
            },
            user: `User:${managerUser.id}`,
            createdAt: oneHourAgo,
          },
        });
      }
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📱 Test Users:');
    console.log('Admin: 09123456789');
    console.log('Manager: 09123456788');
    console.log('Employee: 09123456787');
    console.log('Client 1: 09123456786');
    console.log('Client 2: 09123456785');
    console.log('\n🔐 Use any of these phone numbers to login');
    console.log('💡 Verification code: 1234 (development only)');
    console.log('\n🎫 Sample tickets created with various statuses:');
    console.log('- 2 unseen tickets');
    console.log('- 2 in_progress tickets');
    console.log('- 1 resolved ticket');
    console.log('- 1 closed ticket');
    console.log('- 1 rejected ticket');
    console.log('\n🔗 API endpoints to test:');
    console.log('GET /api/tickets - Get all tickets (role-based)');
    console.log('POST /api/tickets - Create new ticket');
    console.log('GET /api/tickets/:id - Get specific ticket');
    console.log('PUT /api/tickets/:id/status - Update ticket status');
    console.log('GET /api/tickets/:id/history - Get ticket history');
    console.log('GET /api/tickets/stats - Get ticket statistics');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
