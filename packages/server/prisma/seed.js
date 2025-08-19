"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    try {
        const adminUser = await prisma.user.upsert({
            where: { phone: '09123456789' },
            update: {},
            create: {
                phone: '09123456789',
                role: client_1.UserRole.ADMIN,
            },
        });
        console.log('✅ Created admin user:', adminUser);
        const managerUser = await prisma.user.upsert({
            where: { phone: '09123456788' },
            update: {},
            create: {
                phone: '09123456788',
                role: client_1.UserRole.MANAGER,
            },
        });
        console.log('✅ Created manager user:', managerUser);
        const employeeUser = await prisma.user.upsert({
            where: { phone: '09123456787' },
            update: {},
            create: {
                phone: '09123456787',
                role: client_1.UserRole.EMPLOYEE,
            },
        });
        console.log('✅ Created employee user:', employeeUser);
        const clientUser = await prisma.user.upsert({
            where: { phone: '09123456786' },
            update: {},
            create: {
                phone: '09123456786',
                role: client_1.UserRole.CLIENT,
            },
        });
        console.log('✅ Created client user:', clientUser);
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
        ];
        for (const ticketData of sampleTickets) {
            const ticket = await prisma.ticket.create({
                data: ticketData,
            });
            console.log('✅ Created ticket:', ticket.title);
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
                        },
                        user: `User:${employeeUser.id}`,
                    },
                });
            }
            if (ticket.status === 'resolved') {
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
                            resolution: 'مشکل برطرف شد',
                        },
                        user: `User:${managerUser.id}`,
                    },
                });
            }
        }
        console.log('🎉 Database seeded successfully!');
        console.log('\n📱 Test Users:');
        console.log('Admin: 09123456789');
        console.log('Manager: 09123456788');
        console.log('Employee: 09123456787');
        console.log('Client: 09123456786');
        console.log('\n🔐 Use any of these phone numbers to login');
        console.log('💡 Verification code: 1234 (development only)');
    }
    catch (error) {
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
//# sourceMappingURL=seed.js.map