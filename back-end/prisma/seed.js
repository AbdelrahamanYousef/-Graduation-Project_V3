const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clean existing data in correct constraint order
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

    // ── Programs and Projects Seeding ──
    const programsData = [
      {
        name: 'كراتين طعام',
        icon: 'fa-solid fa-box-open',
        color: '#4caf50',
        description: 'توزيع كراتين المواد الغذائية على الأسر الأولى بالرعاية لتلبية احتياجاتهم الأساسية.',
        projects: [
          { title: 'كرتونة طعام (13 كجم)', goal: 100000, donationAmount: 540, location: 'جميع المحافظات' },
          { title: 'كرتونة طعام (10 كجم)', goal: 100000, donationAmount: 445, location: 'جميع المحافظات' },
          { title: 'كرتونة طعام (7.5 كجم)', goal: 100000, donationAmount: 335, location: 'جميع المحافظات' },
          { title: 'كرتونة طعام (6 كجم)', goal: 100000, donationAmount: 260, location: 'جميع المحافظات' },
        ]
      },
      {
        name: 'إفطار صائم',
        icon: 'fa-solid fa-utensils',
        color: '#ff9800',
        description: 'توفير وجبات الإفطار الساخنة واللحوم للصائمين في المناطق الأكثر احتياجاً.',
        projects: [
          { title: 'لحمة', goal: 150000, donationAmount: 85, location: 'مطبخ الجمعية' },
          { title: 'كفتة', goal: 100000, donationAmount: 65, location: 'مطبخ الجمعية' },
          { title: 'فراخ', goal: 120000, donationAmount: 80, location: 'مطبخ الجمعية' },
        ]
      },
      {
        name: 'التعليم',
        icon: 'fa-solid fa-graduation-cap',
        color: '#2196f3',
        description: 'دعم الطلاب غير القادرين والمدارس وتوفير المستلزمات التعليمية الأساسية.',
        projects: [
          { title: 'راجع مدرستي', goal: 200000, donationAmount: 500, location: 'المدارس المستهدفة' },
          { title: 'التعليم حياة', goal: 300000, donationAmount: 500, location: 'المدارس المستهدفة' },
          { title: 'حملات التوعية', goal: 50000, donationAmount: 200, location: 'المراكز المجتمعية' },
          { title: 'تطوير المدارس', goal: 500000, donationAmount: 1000, location: 'المحافظات الحدودية' },
          { title: 'اكفل تعليم طفل', goal: 150000, donationAmount: 500, location: 'المدارس المستهدفة' },
          { title: 'شنطة أدوات مدرسية', goal: 80000, donationAmount: 450, location: 'جميع المحافظات' },
        ]
      },
      {
        name: 'الدعم الغذائي',
        icon: 'fa-solid fa-bowl-food',
        color: '#e91e63',
        description: 'توفير وجبات غذائية جاهزة ومكونات جافة للأسر الأكثر فقراً بشكل مستدام.',
        projects: [
          { title: 'لقمة كريمة', goal: 100000, donationAmount: 20, location: 'مطبخ الكرم' },
          { title: 'لحوم صدقات بلدي', goal: 200000, donationAmount: 380, location: 'جميع المحافظات' },
          { title: 'مشروع مطبخ الكرم', goal: 500000, donationAmount: 1000, location: 'القاهرة' },
        ]
      },
      {
        name: 'الدعم الإغاثي الدولي',
        icon: 'fa-solid fa-earth-asia',
        color: '#9c27b0',
        description: 'توجيه المساعدات الإغاثية والطبية الطارئة لضحايا الأزمات في غزة وخارجها.',
        projects: [
          { title: 'مساعدات غزة', goal: 1000000, donationAmount: 500, location: 'فلسطين - غزة' },
        ]
      },
      {
        name: 'حالات إنسانية',
        icon: 'fa-solid fa-hand-holding-heart',
        color: '#ffc107',
        description: 'تمويل تحسين المنازل وفك كرب الغارمين وتجهيز العرائس للأسر المتعففة.',
        projects: [
          { title: 'تشييد أسقف للمنازل', goal: 300000, donationAmount: 500, location: 'القرى الأكثر احتياجاً' },
          { title: 'وصلات مياه وكهرباء', goal: 200000, donationAmount: 250, location: 'القرى الأكثر احتياجاً' },
          { title: 'فك كرب غارمين', goal: 150000, donationAmount: 250, location: 'السجون' },
          { title: 'تجهيز يتيمات للزواج', goal: 250000, donationAmount: 500, location: 'جميع المحافظات' },
          { title: 'تروسيكل لذوي الهمم', goal: 180000, donationAmount: 500, location: 'جميع المحافظات' },
          { title: 'ماكينة خياطة', goal: 120000, donationAmount: 500, location: 'الأسر المنتجة' },
        ]
      },
      {
        name: 'حالات عاجلة',
        icon: 'fa-solid fa-bell',
        color: '#ff5722',
        description: 'إنقاذ الأرواح وتوفير الرعاية الطبية والأجهزة الطبية العاجلة للحالات الحرجة.',
        projects: [
          { title: 'جهاز تنفس صناعي', goal: 400000, donationAmount: 500, location: 'المستشفيات العامة', isHighlighted: true, featured: true },
          { title: 'مساعدة حالات طبية', goal: 350000, donationAmount: 500, location: 'جميع المحافظات', isHighlighted: true, featured: true },
        ]
      },
      {
        name: 'التمكين الاقتصادي',
        icon: 'fa-solid fa-briefcase',
        color: '#009688',
        description: 'توفير التدريب المهني وحقائب العدد اللازمة لتأسيس مشروعات صغيرة مولدة للدخل.',
        projects: [
          { title: 'للفتيات', goal: 200000, donationAmount: 1000, location: 'مشغل الخياطة' },
          { title: 'تدريب مهني', goal: 100000, donationAmount: 200, location: 'مراكز التدريب' },
          { title: 'شنطة عدة', goal: 80000, donationAmount: 150, location: 'جميع المحافظات' },
        ]
      },
      {
        name: 'التمكين الاجتماعي',
        icon: 'fa-solid fa-people-group',
        color: '#3f51b5',
        description: 'إقامة القوافل التنموية الشاملة والأنشطة التثقيفية لبناء وبث السعادة في المجتمع.',
        projects: [
          { title: 'قوافل السعادة', goal: 150000, donationAmount: 500, location: 'القرى النائية' },
          { title: 'المعسكرات الشبابية', goal: 120000, donationAmount: 500, location: 'المراكز الشبابية' },
          { title: 'انت الحياة', goal: 250000, donationAmount: 500, location: 'جميع المحافظات' },
        ]
      },
      {
        name: 'كرمك دفا',
        icon: 'fa-solid fa-snowflake',
        color: '#03a9f4',
        description: 'توفير وسائل التدفئة والأسقف والبطانيات للأسر المتضررة من برد الشتاء القارس.',
        projects: [
          { title: 'سقف', goal: 300000, donationAmount: 500, location: 'القرى الأكثر احتياجاً' },
          { title: 'بطانية صوف', goal: 100000, donationAmount: 350, location: 'جميع المحافظات' },
          { title: 'سرير ومرتبة', goal: 150000, donationAmount: 2000, location: 'جميع المحافظات' },
          { title: 'لبس الشتاء', goal: 180000, donationAmount: 550, location: 'جميع المحافظات' },
        ]
      }
    ];

    for (const progData of programsData) {
        const program = await prisma.program.create({
            data: {
                name: progData.name,
                icon: progData.icon,
                color: progData.color,
                description: progData.description,
                status: 'ACTIVE',
            }
        });

        console.log(`  Created program: ${program.name}`);

        for (const projData of progData.projects) {
            await prisma.project.create({
                data: {
                    programId: program.id,
                    title: projData.title,
                    description: `${progData.description} - ${projData.title}`,
                    goal: projData.goal,
                    donationAmount: projData.donationAmount,
                    location: projData.location,
                    isHighlighted: projData.isHighlighted || false,
                    featured: projData.featured || false,
                    status: 'ACTIVE',
                    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop'
                }
            });
            console.log(`    Created project: ${projData.title}`);
        }
    }

    console.log('Seed complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
