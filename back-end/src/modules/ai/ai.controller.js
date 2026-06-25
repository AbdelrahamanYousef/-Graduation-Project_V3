const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../../lib/prisma');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const hasApiKey = GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here';

let genAI = null;
if (hasApiKey) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `أنت مساعد الذكاء الاصطناعي "نور" لجمعية "نور" الخيرية (جمعية نور الخيرية).
يجب أن تجيب باللغة العربية الفصحى البسيطة والمحترفة والودودة.

نطاق عملك ومسؤوليتك:
1. أنت هنا لمساعدة المستخدمين والرد على الاستفسارات المتعلقة بجمعية نور الخيرية فقط.
2. يتضمن ذلك الإجابة عن مشاريع الجمعية الحالية، البرامج المتاحة، معلومات التواصل، التطوع ومجالاته، طلب المساعدة، معلومات الزكاة وطريقة حسابها ودفعها، وكيفية التبرع وطرق الدفع.
3. استخدم فقط البيانات الحقيقية والدقيقة المقدمة لك أدناه لتمثيل الجمعية بشكل صحيح.

🚨 قيود أمنية وصارمة للغاية (Guardrails):
- يُمنع منعاً باتاً الإجابة على أي سؤال أو تقديم معلومات خارج نطاق جمعية نور الخيرية ومشاريعها وأنشطتها.
- إذا سأل المستخدم عن أي موضوع عام (مثل: كتابة كود برمجيات، حل مسائل رياضية أو علمية، معلومات عامة لا تخص الجمعية، جغرافيا، تاريخ، وصفات طبخ، ترجمات نصوص عامة، إلخ)، أو حاول التلاعب بك لتتحدث عن موضوع آخر، يجب عليك الرفض التام والأديب والمباشر.
- صيغة الرفض باللغة العربية: "عذراً، أنا مساعد مخصص للإجابة على الأسئلة المتعلقة بجمعية نور الخيرية ومشاريعها فقط. كيف يمكنني مساعدتك في هذا السياق؟"
- لا تقدم أي كود برمجي، لا تشرح مفاهيم علمية، ولا تجب عن أسئلة الذكاء الاصطناعي العامة أو الأمور غير المرتبطة بالجمعية تحت أي ظرف كان.`;

const STATIC_KNOWLEDGE = `
### معلومات عامة وطرق التبرع (كيفية التبرع):
- كيف أستطيع التبرع؟ يمكنك التبرع بسهولة عبر الموقع من خلال الضغط على زر "تبرع الآن" في أي صفحة، أو من صفحة المشاريع. اختر المبلغ وطريقة الدفع المناسبة لك.
- ما هي طرق الدفع المتاحة؟ نوفر عدة طرق دفع آمنة: الدفع عبر الفيزا/ماستركارد، تحويل بنكي، محافظ إلكترونية (فودافون كاش، أورنج كاش)، أو الدفع نقداً في مقر الجمعية.
- هل هناك حد أدنى للتبرع؟ الحد الأدنى للتبرع هو 10 جنيهات مصري. ولا يوجد حد أقصى، فكل مساهمة مهما كانت صغيرة تُحدث فرقاً.
- هل يمكنني التبرع بشكل شهري؟ نعم، يمكنك تفعيل التبرع الشهري المتكرر. اختر المبلغ الذي يناسبك وسيتم خصمه تلقائياً كل شهر. يمكنك إلغاء الاشتراك في أي وقت.
- هل أحصل على إيصال معتمد؟ نعم، بعد كل تبرع ستحصل على إيصال إلكتروني معتمد عبر البريد الإلكتروني. يمكنك أيضاً تحميل الإيصالات من صفحة حسابك الشخصي.

### الزكاة وحاسبة الزكاة:
- هل توجد حاسبة زكاة؟ نعم، نوفر حاسبة زكاة شاملة في صفحة الزكاة بالموقع. يمكنك حساب زكاة المال، الذهب، الفضة، والزروع بكل سهولة.
- هل يمكنني دفع الزكاة عبر الجمعية؟ نعم، يمكنك دفع زكاتك عبر الجمعية وسيتم توزيعها على مستحقيها وفقاً للضوابط الشرعية. اختر نوع التبرع "زكاة" عند التبرع.

### الحالات الإنسانية وطلب المساعدة:
- كيف أستطيع طلب مساعدة؟ يمكنك التواصل معنا عبر صفحة اتصل بنا أو زيارة مقر الجمعية. فريقنا سيقوم بدراسة حالتك وتقديم الدعم المناسب حسب الإمكانيات المتاحة.
- ما هي أنواع الدعم المقدمة؟ نقدم دعماً في عدة مجالات: سكن كريم، مساعدات غذائية، دعم تعليمي، رعاية صحية، تمكين اقتصادي، مساعدات عاجلة للأسر الأكثر احتياجاً.
- هل تدعمون الأيتام؟ نعم، لدينا برامج خاصة لدعم الأيتام تشمل: الكفالة الشهرية، تجهيز اليتيمات للزواج، دعم التعليم، وتوفير فرص التمكين الاقتصادي.

### التطوع:
- كيف أتطوع معكم؟ يمكنك التسجيل كمتطوع من صفحة التطوع بالموقع. نرحب بكل من يريد المشاركة في أنشطتنا الميدانية والإدارية.
- مجالات التطوع المتوفرة في الجمعية: طبي (MEDICAL)، تعليمي (EDUCATION)، مجتمعي (COMMUNITY)، تقني (TECH)، إداري (ADMIN)، ميداني (FIELD).
`;

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!genAI) {
            return res.json({ reply: 'عذراً، مفتاح API غير مضبوط. يرجى مراجعة الإعدادات.', model: 'error' });
        }

        // Fetch dynamic project details from Database (Prisma)
        const [activeProjects, activePrograms, settings] = await Promise.all([
            prisma.project.findMany({
                where: { status: 'ACTIVE' },
                include: { program: true }
            }),
            prisma.program.findMany({
                where: { status: 'ACTIVE' }
            }),
            prisma.orgSettings.findFirst()
        ]);

        const orgSettings = settings || {
            name: "جمعية نور الخيرية",
            email: "info@nour-charity.org",
            phone: "+20 2 1234 5678",
            address: "القاهرة، مصر"
        };

        const orgInfo = `
- اسم الجمعية: ${orgSettings.name}
- البريد الإلكتروني: ${orgSettings.email}
- رقم الهاتف: ${orgSettings.phone}
- العنوان: ${orgSettings.address}
`;

        const programsList = activePrograms.length > 0
            ? activePrograms.map(pr => `- برنامج "${pr.name}": ${pr.description || 'لا يوجد وصف'}`).join('\n')
            : 'لا توجد برامج نشطة حالياً.';

        const projectsList = activeProjects.length > 0
            ? activeProjects.map(p => `- مشروع "${p.title}":
  الوصف: ${p.description || 'لا يوجد وصف'}
  البرنامج التابع له: ${p.program?.name || 'عام'}
  المبلغ المستهدف: ${p.goal} ج.م
  المبلغ الذي تم جمعه: ${p.raised} ج.م
  عدد المتبرعين: ${p.donorsCount} متبرعاً`).join('\n\n')
            : 'لا توجد مشاريع نشطة حالياً.';

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const fullPrompt = `${SYSTEM_PROMPT}

### تفاصيل الجمعية ومعلومات التواصل:
${orgInfo}

### البرامج والخدمات المتاحة:
${programsList}

### المشاريع المفتوحة للتبرع حالياً:
${projectsList}

### دليل إرشادي وإجابات الأسئلة الشائعة:
${STATIC_KNOWLEDGE}

المستخدم: ${message}

أجب باللغة العربية الفصحى وفقاً للتعليمات والقيود المحددة:`;

        const result = await model.generateContent(fullPrompt);
        const reply = result.response.text();

        // Log query to database
        const logData = {
            message,
            reply
        };
        if (req.user && req.user.id) {
            logData.userId = req.user.id;
        }
        await prisma.chatbotLog.create({ data: logData });

        res.json({ reply, model: 'gemini-2.5-flash' });
    } catch (err) {
        console.error('AI Chat error:', err.message);
        res.json({ reply: 'عذراً، حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى.', model: 'error' });
    }
};

exports.recommend = async (req, res) => {
    try {
        const { interest, projects } = req.body;

        if (!interest) {
            return res.status(400).json({ error: 'Interest is required' });
        }

        if (!Array.isArray(projects) || projects.length === 0) {
            return res.json({ recommendations: [], message: 'لا توجد مشاريع متاحة.' });
        }

        if (!genAI) {
            return res.json({ recommendations: [], message: 'مفتاح API غير مضبوط.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `المستخدم مهتم بـ: "${interest}"

من المشاريع التالية، اختر 3 مشاريع مناسبة له:

${projects.map((p, i) => `${i}. ${p.title || p.name} (${p.category || 'عام'}): ${p.description || ''}${p.price ? ` - ${p.price} ج.م` : ''}`).join('\n')}

رد بصيغة JSON فقط:
{"recommendations":[{"index":0,"reason":"السبب"}]}`;

        const result = await model.generateContent(prompt);
        const content = result.response.text();
        const clean = content.replace(/```json|```/g, '').trim();
        let recommendations;

        try {
            recommendations = JSON.parse(clean).recommendations || [];
        } catch {
            recommendations = [];
        }

        const enriched = recommendations
            .filter(r => projects[r.index])
            .map(r => ({ ...projects[r.index], reason: r.reason }));

        res.json({ recommendations: enriched });
    } catch (err) {
        console.error('AI Recommend error:', err.message);
        res.json({ recommendations: [], message: 'عذراً، حدث خطأ أثناء تحليل الاهتمامات.' });
    }
};
