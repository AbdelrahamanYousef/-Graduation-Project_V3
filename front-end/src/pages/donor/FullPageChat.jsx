import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { faqs, greetingMessages, quickReplies } from '../../data/chatbotData';
import { donationCategories } from '../../data/mockData';
import { aiChat } from '../../api/ai.api';
import { useInjectStyles } from '../../utils/injectStyles';
import { getDonorDonations } from '../../api/donorAccount.api';
import { getMyRequests } from '../../api/specialRequests.api';

const GREEN = '#00b16a';
const GREEN_DK = '#009659';

const projectsData = donationCategories.flatMap(cat =>
    cat.items.map(item => ({
        title: item.title,
        category: cat.name,
        price: item.price,
        description: `تبرع بقيمة ${item.price} ج.م لـ ${item.title}`,
    }))
);

const fullPageChatStyles = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }
`;

const parseMarkdownLinks = (text) => {
    if (!text) return '';
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }
        const linkText = match[1];
        const linkUrl = match[2];
        parts.push(
            <a 
                key={match.index} 
                href={linkUrl} 
                className="underline font-bold hover:opacity-85"
                style={{ color: 'inherit', textDecoration: 'underline' }}
            >
                {linkText}
            </a>
        );
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
};

function FullPageChat() {
    const { isDark } = useTheme();
    const { donorUser } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userDonations, setUserDonations] = useState([]);
    const [userRequests, setUserRequests] = useState([]);

    useEffect(() => {
        if (donorUser) {
            getDonorDonations()
                .then(data => setUserDonations(data || []))
                .catch(err => console.error("Error fetching chatbot donations:", err));
            getMyRequests()
                .then(data => setUserRequests(data || []))
                .catch(err => console.error("Error fetching chatbot requests:", err));
        } else {
            setUserDonations([]);
            setUserRequests([]);
        }
    }, [donorUser]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const categories = [...new Set(faqs.map(f => f.category))];
    const [selectedCat, setSelectedCat] = useState(null);

    useEffect(() => {
        if (messages.length === 0) {
            const greeting = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
            setMessages([{ type: 'bot', text: greeting, isQuickReplies: true }]);
        }
    }, [messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 300);
    }, []);
    useInjectStyles(fullPageChatStyles, 'fullpagechat-styles');

    const addMessage = (newMsgs) => {
        setMessages(prev => [...prev.filter(m => !m.isQuickReplies), ...newMsgs]);
    };

    const handleAnswer = async (question) => {
        addMessage([{ type: 'user', text: question }]);
        setLoading(true);
        try {
            let userContext = null;
            if (donorUser) {
                const userName = donorUser.name || 'أيها المستخدم';
                const donationsText = userDonations && userDonations.length > 0
                    ? userDonations.map(d => `${d.amount} EGP for ${d.project || 'General'} (${d.status})`).join(', ')
                    : '';
                const requestsText = userRequests && userRequests.length > 0
                    ? userRequests.map(r => `${r.requestType} (${r.status})`).join(', ')
                    : '';

                userContext = `The user you are talking to is ${userName}. Their past donations are: [${donationsText}]. Their current requests are: [${requestsText}]. Use this data to answer their questions naturally. Every response to queries about user donations or requests must be highly personalized and based only on this user context data. Do not invent any donations or requests that are not in the provided lists. If the arrays are empty, tell them they haven't made any yet.`;
            }
            const data = await aiChat(question, projectsData, [], userContext);
            setTimeout(() => { addMessage([{ type: 'bot', text: data.reply }]); setLoading(false); }, 300);
        } catch (err) {
            setTimeout(() => {
                addMessage([{ type: 'bot', text: err.message?.includes('API') ? err.message : 'عذراً، حدث خطأ في الاتصال.' }]);
                setLoading(false);
            }, 300);
        }
    };

    const handleSend = () => {
        const q = input.trim();
        if (!q || loading) return;
        setInput('');
        handleAnswer(q);
    };

    const handleFaqClick = (faqId) => {
        const faq = faqs.find(f => f.id === faqId);
        if (!faq) return;
        addMessage([{ type: 'user', text: faq.question }, { type: 'bot', text: faq.answer }]);
    };

    const handleQuickReply = (faqId) => handleFaqClick(faqId);

    const getFilteredFaqs = () => !selectedCat ? [] : faqs.filter(f => f.category === selectedCat);

    return (
        <div className="h-screen flex flex-col" style={{ backgroundColor: isDark ? '#04100e' : '#f8fcf9' }}>
            {/* Header */}
            <div className="px-2 md:px-4 py-1.5 md:py-2 flex items-center gap-2 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DK})`, color: '#fff' }}>
                <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-white/10 transition-colors text-white">
                    <i className="fa-solid fa-arrow-right" />
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <i className="fa-solid fa-robot" style={{ fontSize: '1.2rem' }} />
                </div>
                <div className="flex-1">
                    <p className="font-extrabold" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", fontSize: 'clamp(1rem, 2vw, 1.15rem)' }}>
                        مساعد نور الذكي
                    </p>
                    <p className="text-xs opacity-85" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", fontSize: '0.75rem' }}>
                        مدعوم بالذكاء الاصطناعي
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-auto px-2 md:px-4 py-2 md:py-3 flex flex-col gap-1.5 max-w-[800px] mx-auto w-full"
                dir="rtl"
            >
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <div
                            className="text-sm leading-relaxed break-words whitespace-pre-wrap max-w-[75%]"
                            style={{
                                padding: '12px 18px',
                                borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                backgroundColor: msg.type === 'user' ? GREEN : (isDark ? '#1e2d2b' : '#f0faf5'),
                                color: msg.type === 'user' ? '#fff' : (isDark ? '#e2e8f0' : '#2d3436'),
                                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                animation: 'slideUp 0.3s ease both',
                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                fontSize: '0.95rem',
                                lineHeight: 1.7,
                                boxShadow: msg.type === 'user' ? `0 2px 8px ${GREEN}33` : '0 1px 4px rgba(0,0,0,0.04)',
                            }}
                        >
                            {parseMarkdownLinks(msg.text)}
                        </div>
                        {msg.isQuickReplies && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {quickReplies.map(qr => (
                                    <button
                                        key={qr.faqId}
                                        onClick={() => handleQuickReply(qr.faqId)}
                                        className="flex items-center gap-1 rounded-full text-sm font-semibold transition-colors"
                                        style={{
                                            padding: '0.6rem 1.8rem',
                                            fontSize: '0.82rem',
                                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : `${GREEN}0f`,
                                            color: isDark ? '#94a3b8' : '#5a6a6a',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : `${GREEN}1a`}`,
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${GREEN}1a`; e.currentTarget.style.borderColor = `${GREEN}4d`; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : `${GREEN}0f`; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : `${GREEN}1a`; }}
                                    >
                                        <i className={qr.icon} style={{ marginLeft: '0.5rem' }}></i>
                                        {qr.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-1.5 mr-1">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" style={{ borderColor: `${GREEN} transparent transparent transparent` }}></div>
                        <p className="text-sm" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", color: isDark ? '#94a3b8' : '#889a98' }}>
                            جاري التفكير...
                        </p>
                    </div>
                )}

                {messages.length > 0 && !loading && (
                    <div className="flex flex-wrap mt-2 pt-2" style={{ gap: '0.8rem', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : `${GREEN}14`}` }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
                                className="rounded-full text-xs transition-colors"
                                style={{
                                    padding: '0.4rem 1.2rem',
                                    fontSize: '0.72rem',
                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                    fontWeight: selectedCat === cat ? 700 : 500,
                                    backgroundColor: selectedCat === cat ? GREEN : 'transparent',
                                    color: selectedCat === cat ? '#fff' : (isDark ? '#94a3b8' : '#5a6a6a'),
                                    border: `1px solid ${selectedCat === cat ? GREEN : (isDark ? 'rgba(255,255,255,0.08)' : `${GREEN}1a`)}`,
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {selectedCat && getFilteredFaqs().map(faq => (
                    <div
                        key={faq.id}
                        onClick={() => handleFaqClick(faq.id)}
                        className="p-1.5 rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : `${GREEN}08`,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : `${GREEN}0f`}`,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : `${GREEN}0f`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : `${GREEN}08`; }}
                    >
                        <p className="text-sm font-semibold" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", color: isDark ? '#e2e8f0' : '#2d3436' }}>
                            <i className="fa-regular fa-circle-question" style={{ fontSize: '0.75rem', marginLeft: '0.6rem', color: GREEN }}></i>
                            {' '}{faq.question}
                        </p>
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 md:p-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : `${GREEN}14`}`, backgroundColor: isDark ? '#0a1f1c' : '#ffffff' }}>
                <div className="max-w-[800px] mx-auto">
                    <div className="flex items-center gap-2 rounded-2xl border px-3 py-2" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.12)' : `${GREEN}26` }}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="اكتب سؤالك هنا..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            disabled={loading}
                            dir="rtl"
                            className="flex-1 bg-transparent border-none outline-none text-sm"
                            style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", fontSize: '0.95rem' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="flex items-center justify-center rounded-xl transition-colors"
                            style={{
                                width: 38,
                                height: 38,
                                backgroundColor: input.trim() && !loading ? GREEN : 'transparent',
                                color: input.trim() && !loading ? '#fff' : (isDark ? '#64748b' : '#a0b4b2'),
                            }}
                            onMouseEnter={(e) => { if (input.trim() && !loading) e.currentTarget.style.backgroundColor = GREEN_DK; }}
                            onMouseLeave={(e) => { if (input.trim() && !loading) e.currentTarget.style.backgroundColor = GREEN; }}
                        >
                            <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.9rem' }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FullPageChat;
