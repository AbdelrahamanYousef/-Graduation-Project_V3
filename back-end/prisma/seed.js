const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clean existing data
    await prisma.auditLog.deleteMany();
    await prisma.reconciliation.deleteMany();
    await prisma.disbursement.deleteMany();
    await prisma.donation.deleteMany();
    await prisma.report.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.volunteerApplication.deleteMany();
    await prisma.contactMessage.deleteMany();
    await prisma.project.deleteMany();
    await prisma.beneficiary.deleteMany();
    await prisma.program.deleteMany();
    await prisma.orgSettings.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('admin123', 10);

    // ── Users ──
    const admin1 = await prisma.user.create({
        data: { name: 'محمد أحمد', email: 'admin@nour.org', passwordHash, role: 'ADMIN' },
    });
    const admin2 = await prisma.user.create({
        data: { name: 'سارة حسن', email: 'sara@nour.org', passwordHash, role: 'ADMIN' },
    });
    const donor1 = await prisma.user.create({
        data: {
            name: 'أحمد محمد', email: 'ahmed@donor.com', phone: '+201012345678',
            passwordHash: '', role: 'USER',
        },
    });
    console.log('  Created 3 users');

    // ── Programs ──
    const programs = await Promise.all([
        prisma.program.create({ data: { name: 'كفالة الأيتام', icon: 'fa-solid fa-children', color: '#e74c3c', description: 'برنامج كفالة الأيتام المحتاجين' } }),
        prisma.program.create({ data: { name: 'الخدمات الصحية', icon: 'fa-solid fa-heart-pulse', color: '#2ecc71', description: 'دعم الخدمات الطبية للمحتاجين' } }),
        prisma.program.create({ data: { name: 'التعليم', icon: 'fa-solid fa-graduation-cap', color: '#3498db', description: 'دعم التعليم والتعلم' } }),
        prisma.program.create({ data: { name: 'إغاثة الطوارئ', icon: 'fa-solid fa-truck-medical', color: '#e67e22', description: 'إغاثة عاجلة للمتضررين' } }),
        prisma.program.create({ data: { name: 'التنمية المستدامة', icon: 'fa-solid fa-seedling', color: '#1abc9c', description: 'مشاريع التنمية المستدامة' } }),
        prisma.program.create({ data: { name: 'ال(clean) المياه', icon: 'fa-solid fa-droplet', color: '#9b59b6', description: 'توفير المياه النظيفة' } }),
    ]);
    console.log('  Created 6 programs');

    // ── Projects ──
    const projects = await Promise.all([
        prisma.project.create({ data: { programId: programs[0].id, title: 'كفالة 500 يتيم في الصعيد', description: 'مشروع كفالة أيتام في صعيد مصر', goal: 500000, raised: 320000, donorsCount: 150, featured: true, status: 'ACTIVE', imageUrl: '/images/orphans.jpg' } }),
        prisma.project.create({ data: { programId: programs[1].id, title: 'إغاثة طبية عاجلة', description: 'دعم المستشفيات بالمعدات الطبية', goal: 300000, raised: 180000, donorsCount: 89, featured: true, status: 'ACTIVE', imageUrl: '/images/medical.jpg' } }),
        prisma.project.create({ data: { programId: programs[2].id, title: 'بناء مدارس في الريف', description: 'إنشاء مدارس في المناطق النائية', goal: 800000, raised: 450000, donorsCount: 210, featured: true, status: 'ACTIVE', imageUrl: '/images/schools.jpg' } }),
        prisma.project.create({ data: { programId: programs[3].id, title: 'إغاثة المتضررين', description: 'توفير اللوازم الأساسية للمتضررين', goal: 200000, raised: 190000, donorsCount: 320, featured: false, status: 'ACTIVE', imageUrl: '/images/relief.jpg' } }),
        prisma.project.create({ data: { programId: programs[4].id, title: 'دعم المشاريع الصغيرة', description: 'تمكين الشباب بمشاريع صغيرة', goal: 400000, raised: 120000, donorsCount: 65, featured: false, status: 'ACTIVE', imageUrl: '/images/projects.jpg' } }),
        prisma.project.create({ data: { programId: programs[5].id, title: 'حفر 10 آبار ارتوازية', description: 'توفير مياه نظيفة لقرى صحراوية', goal: 250000, raised: 250000, donorsCount: 180, featured: true, status: 'COMPLETED', imageUrl: '/images/water.jpg' } }),
        prisma.project.create({ data: { programId: programs[1].id, title: 'دعم مراكز غسيل الكلى', description: 'توريد أجهزة غسيل كلى للمستشفيات', goal: 600000, raised: 95000, donorsCount: 42, featured: false, status: 'ACTIVE', imageUrl: '/images/dialysis.jpg' } }),
    ]);
    console.log('  Created 7 projects');

    // ── Donations ──
    const donationTypes = ['SADAQAH', 'ZAKAT', 'ORPHAN_SPONSORSHIP', 'SADAQAH_JARIYAH', 'GENERAL'];
    const paymentMethods = ['CARD', 'VODAFONE_CASH', 'INSTAPAY', 'FAWRY', 'BANK_TRANSFER'];
    const donorNames = ['أحمد محمد', 'فاطمة علي', 'محمود حسن', 'سارة أحمد', 'خالد إبراهيم'];
    const amounts = [5000, 10000, 2500, 1000, 7500];

    for (let i = 0; i < 5; i++) {
        await prisma.donation.create({
            data: {
                userId: donor1.id,
                projectId: projects[i % projects.length].id,
                amount: amounts[i],
                type: donationTypes[i],
                paymentMethod: paymentMethods[i],
                status: 'SUCCESS',
                fullName: donorNames[i],
                receiptNumber: `REC-${Date.now()}-${i}`,
                paidAt: new Date(),
            },
        });
    }
    console.log('  Created 5 donations');

    // ── Beneficiaries ──
    await prisma.beneficiary.createMany({
        data: [
            { name: 'عائلة محمد حسن', type: 'FAMILY', governorate: 'قنا', membersCount: 5, status: 'ACTIVE', monthlyAid: 1500, programId: programs[0].id },
            { name: 'عائلة أحمد سعيد', type: 'FAMILY', governorate: 'القاهرة', membersCount: 3, status: 'ACTIVE', monthlyAid: 2000, programId: programs[1].id },
            { name: 'عائلة فاطمة علي', type: 'FAMILY', governorate: 'المنيا', membersCount: 7, status: 'ACTIVE', monthlyAid: 2500, programId: programs[0].id },
        ],
    });
    console.log('  Created 3 beneficiaries');

    // ── Org Settings ──
    await prisma.orgSettings.create({
        data: {
            id: 'singleton',
            name: 'جمعية نور الخيرية',
            email: 'info@nour-charity.org',
            phone: '+20 2 1234 5678',
            address: 'القاهرة، مصر',
        },
    });
    console.log('  Created org settings');

    // ── Audit Logs ──
    await prisma.auditLog.createMany({
        data: [
            { actorId: admin1.id, actorRole: 'ADMIN', action: 'LOGIN', entity: 'User', entityId: admin1.id },
            { actorId: admin2.id, actorRole: 'ADMIN', action: 'LOGIN', entity: 'User', entityId: admin2.id },
        ],
    });
    console.log('  Created 2 audit logs');

    console.log('Seed complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
