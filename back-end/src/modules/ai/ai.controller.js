const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const hasApiKey = GEMINI_API_KEY && GEMINI_API_KEY !== 'your-openai-api-key-here';

let genAI = null;
if (hasApiKey) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `أنت مساعد اسمه "نور" لجمعية "نور" الخيرية.你必须用阿拉伯语回复。

你的角色:
- مساعدة المستخدمين في اختيار المشاريع المناسبة للتبرع
- الإجابة عن أسئلة التبرع والمشاريع
- اقتراح مشاريع بناءً على اهتمامات المستخدم
- الرد باللغة العربية الفصحى البسيطة
- كن ودوداً ومحترفاً ومحترماً

المشاريع المتاحة سيتم إرسالها مع كل رسالة. استخدمها في ردودك.`;

exports.chat = async (req, res) => {
    try {
        const { message, projects, campaigns } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const projectsList = Array.isArray(projects) && projects.length > 0
            ? projects.map(p => `- ${p.title || p.name} (${p.category || 'عام'}): ${p.description || ''}${p.price ? ` - السعر: ${p.price} ج.م` : ''}`).join('\n')
            : 'لا توجد مشاريع حالياً.';

        if (!genAI) {
            return res.json({ reply: 'عذراً، مفتاح API غير مضبوط. يرجى مراجعة الإعدادات.', model: 'error' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const fullPrompt = `${SYSTEM_PROMPT}

### المشاريع المتاحة حالياً:
${projectsList}

${Array.isArray(campaigns) && campaigns.length > 0 ? `### الحملات:\n${campaigns.map(c => `- ${c.title}: ${c.description}`).join('\n')}` : ''}

المستخدم: ${message}

رد عليك بالعربية:`;

        const result = await model.generateContent(fullPrompt);
        const reply = result.response.text();

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
