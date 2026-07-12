const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    let foodIdx = 0;
    let eduIdx = 0;
    let homeIdx = 0;
    let medIdx = 0;
    let empowerIdx = 0;
    let intlIdx = 0;

    const foodImages = [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1584263343329-8a2096339890?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&h=400&fit=crop'
    ];

    const eduImages = [
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop'
    ];

    const homeImages = [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ff975?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop'
    ];

    const medImages = [
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop'
    ];

    const empowerImages = [
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1531535934027-667f6db87580?w=600&h=400&fit=crop'
    ];

    const intlImages = [
        'https://images.unsplash.com/photo-1469571486040-4b9b3d225147?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=600&h=400&fit=crop'
    ];

    // Clean existing data in correct constraint order
    await prisma.fieldReport.deleteMany();
    await prisma.requestDocument.deleteMany();
    await prisma.helpRequestProcessLog.deleteMany();
    await prisma.helpRequest.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.auditReport.deleteMany();
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
    // Do not delete users to allow upsert and avoid breaking existing relationships.

    const passwordHash = await bcrypt.hash('admin123', 10);

    // ── Users (Upserted) ──
    const admin1 = await prisma.user.upsert({
        where: { email: 'admin@nour.org' },
        update: { name: 'محمد أحمد', passwordHash, role: 'ADMIN', emailVerified: true },
        create: { name: 'محمد أحمد', email: 'admin@nour.org', passwordHash, role: 'ADMIN', emailVerified: true },
    });
    const admin2 = await prisma.user.upsert({
        where: { email: 'sara@nour.org' },
        update: { name: 'سارة حسن', passwordHash, role: 'ADMIN', emailVerified: true },
        create: { name: 'سارة حسن', email: 'sara@nour.org', passwordHash, role: 'ADMIN', emailVerified: true },
    });
    const editor = await prisma.user.upsert({
        where: { email: 'editor@nour.org' },
        update: { name: 'عمر محرر', passwordHash, role: 'EDITOR', emailVerified: true },
        create: { name: 'عمر محرر', email: 'editor@nour.org', passwordHash, role: 'EDITOR', emailVerified: true },
    });
    const researcher1 = await prisma.user.upsert({
        where: { email: 'researcher@nour.org' },
        update: { name: 'حسن باحث أ', passwordHash, role: 'RESEARCHER', emailVerified: true },
        create: { name: 'حسن باحث أ', email: 'researcher@nour.org', passwordHash, role: 'RESEARCHER', emailVerified: true },
    });
    const researcher2 = await prisma.user.upsert({
        where: { email: 'researcher2@nour.org' },
        update: { name: 'علي باحث ب', passwordHash, role: 'RESEARCHER', emailVerified: true },
        create: { name: 'علي باحث ب', email: 'researcher2@nour.org', passwordHash, role: 'RESEARCHER', emailVerified: true },
    });
    const donor1 = await prisma.user.upsert({
        where: { email: 'ahmed@donor.com' },
        update: { name: 'أحمد محمد', phone: '01012345678', passwordHash, role: 'USER', emailVerified: true },
        create: { name: 'أحمد محمد', email: 'ahmed@donor.com', phone: '01012345678', passwordHash, role: 'USER', emailVerified: true },
    });
    const donor2 = await prisma.user.upsert({
        where: { email: 'ali@donor.com' },
        update: { name: 'علي أحمد', phone: '01112345678', passwordHash, role: 'USER', emailVerified: true },
        create: { name: 'علي أحمد', email: 'ali@donor.com', phone: '01112345678', passwordHash, role: 'USER', emailVerified: true },
    });
    console.log('  Upserted admin, editor, researchers, and donor users');

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
            let projectImage = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=350&fit=crop';
            const title = projData.title;
            if (title.includes('طعام') || title.includes('وجبات') || title.includes('لحم') || title.includes('كفتة') || title.includes('فراخ') || title.includes('لقمة')) {
                projectImage = foodImages[foodIdx % foodImages.length];
                foodIdx++;
            } else if (title.includes('مدرسة') || title.includes('تعليم') || title.includes('طفل') || title.includes('أدوات') || title.includes('حقيبة') || title.includes('شنطة')) {
                projectImage = eduImages[eduIdx % eduImages.length];
                eduIdx++;
            } else if (title.includes('مياه') || title.includes('كهرباء') || title.includes('سقف') || title.includes('أسقف') || title.includes('منزل') || title.includes('منازل')) {
                projectImage = homeImages[homeIdx % homeImages.length];
                homeIdx++;
            } else if (title.includes('غزة') || title.includes('مساعدات')) {
                projectImage = intlImages[intlIdx % intlImages.length];
                intlIdx++;
            } else if (title.includes('جهاز') || title.includes('حالات طبية') || title.includes('تنفس')) {
                projectImage = medImages[medIdx % medImages.length];
                medIdx++;
            } else if (title.includes('خياطة') || title.includes('تروسيكل') || title.includes('تدريب') || title.includes('عدة')) {
                projectImage = empowerImages[empowerIdx % empowerImages.length];
                empowerIdx++;
            }

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
                    imageUrl: projectImage
                }
            });
            console.log(`    Created project: ${projData.title}`);
        }
    }

    // ── Audit Reports ──
    const auditReportsData = [
        { year: '2024', firm: 'شركة الحسابات المصرية', status: 'قيد المراجعة', fileUrl: null },
        { year: '2023', firm: 'شركة الحسابات المصرية', status: 'معتمد', fileUrl: '#' },
        { year: '2022', firm: 'PWC مصر', status: 'معتمد', fileUrl: '#' },
        { year: '2021', firm: 'PWC مصر', status: 'معتمد', fileUrl: '#' },
    ];
    for (const report of auditReportsData) {
        await prisma.auditReport.create({ data: report });
    }
    console.log('  Created 4 audit reports');

    // ── Seed Help Requests ──
    const r1 = await prisma.user.findFirst({ where: { email: 'researcher@nour.org' } });
    const r2 = await prisma.user.findFirst({ where: { email: 'researcher2@nour.org' } });
    const d1 = await prisma.user.findFirst({ where: { email: 'ahmed@donor.com' } });
    const d2 = await prisma.user.findFirst({ where: { email: 'ali@donor.com' } });

    const req1 = await prisma.helpRequest.create({
        data: {
            name: d1.name,
            email: d1.email,
            phone: d1.phone,
            requestType: 'financial',
            description: 'طلب مساعدة مالية عاجلة لتسديد إيجار المنزل المتأخر.',
            source: 'ONLINE',
            status: 'NEW',
            userId: d1.id,
        }
    });
    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: req1.id,
            action: 'SUBMITTED',
            details: 'تم تقديم طلب المساعدة أونلاين بنجاح',
        }
    });

    const req2 = await prisma.helpRequest.create({
        data: {
            name: d2.name,
            email: d2.email,
            phone: d2.phone,
            requestType: 'medical',
            description: 'طلب مساعدة طبية لتغطية تكاليف عملية جراحية بالركبة.',
            source: 'ONLINE',
            status: 'FIELD_RESEARCH',
            userId: d2.id,
            assignedResearcherId: r1.id,
        }
    });
    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: req2.id,
            action: 'SUBMITTED',
            details: 'تم تقديم طلب المساعدة أونلاين بنجاح',
        }
    });
    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: req2.id,
            action: 'ASSIGNED',
            details: `تم تعيين الباحث الميداني ${r1.name} لدراسة الحالة`,
        }
    });

    const req3 = await prisma.helpRequest.create({
        data: {
            requestType: 'housing',
            description: 'طلب مساعدة لترميم سقف منزل متهالك في قرية بالصعيد.',
            source: 'OFFLINE',
            status: 'PENDING_DOCS',
            offlineName: 'إبراهيم حسن',
            offlinePhone: '01234567890',
            offlineNationalId: '12345678901234',
            assignedResearcherId: r2.id,
        }
    });
    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: req3.id,
            action: 'SUBMITTED',
            details: 'تم تسجيل الطلب يدوياً بواسطة الإدارة (مكتبياً)',
        }
    });
    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: req3.id,
            action: 'ASSIGNED',
            details: `تم تعيين الباحث الميداني ${r2.name} لدراسة الحالة`,
        }
    });
    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: req3.id,
            action: 'PENDING_DOCS',
            details: 'في انتظار رفع صورة بطاقة الرقم القومي للمستفيد',
        }
    });

    console.log('  Created 3 help requests with process logs');

    // ── Seed Campaigns ──
    const campaignsData = [
        {
            title: 'حملة الشتاء دفا وأمان',
            description: 'توفير الأغطية والملابس والتدفئة للأسر المحتاجة لمواجهة برد الشتاء القارس.',
            imageUrl: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=600&h=400&fit=crop',
            goal: 500000,
            raised: 120000,
            status: 'ACTIVE',
            category: 'موسمية',
            amountConfig: 'FLEXIBLE',
            totalRaised: 120000,
            featured: true,
            startDate: new Date(),
        },
        {
            title: 'إغاثة فلسطين العاجلة',
            description: 'تقديم المساعدات الطبية والغذائية والطارئة لأهالينا في قطاع غزة.',
            imageUrl: 'https://images.unsplash.com/photo-1469571486040-4b9b3d225147?w=600&h=400&fit=crop',
            goal: 1000000,
            raised: 450000,
            status: 'ACTIVE',
            category: 'إغاثية',
            amountConfig: 'FLEXIBLE',
            totalRaised: 450000,
            featured: true,
            startDate: new Date(),
        },
        {
            title: 'حملة زكاة المال',
            description: 'توجيه أموال الزكاة لمستحقيها الشرعيين من الفقراء والمساكين والمحتاجين.',
            imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop',
            goal: 2000000,
            raised: 750000,
            status: 'ACTIVE',
            category: 'زكاة',
            amountConfig: 'FLEXIBLE',
            totalRaised: 750000,
            featured: false,
            startDate: new Date(),
        }
    ];

    for (const camp of campaignsData) {
        await prisma.campaign.create({ data: camp });
    }
    console.log('  Created 3 campaigns');

    console.log('Seed complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
