import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { faqs, greetingMessages, quickReplies } from '../../data/chatbotData';
import { donationCategories } from '../../data/mockData';
import { aiChat } from '../../api/ai.api';
import { getDonorDonations } from '../../api/donorAccount.api';
import { getMyRequests } from '../../api/specialRequests.api';

import { useInjectStyles } from '../../utils/injectStyles';
const GREEN = '#00b16a';
const GREEN_DK = '#009659';

const chatStyles = `
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(0,177,106,0.4); } 50% { box-shadow: 0 0 0 12px rgba(0,177,106,0); } }
`;

const fabStyles = `
    @keyframes pulseFab { 0%,100% { box-shadow: 0 0 0 0 rgba(0,177,106,0.4); } 50% { box-shadow: 0 0 0 12px rgba(0,177,106,0); } }
`;

const MAXIMIZE_THRESHOLD = 520;

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

function ChatBot() {
    const { isDark } = useTheme();
    const { donorUser } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userDonations, setUserDonations] = useState([]);
    const [userRequests, setUserRequests] = useState([]);

    useEffect(() => {
        if (open && donorUser) {
            getDonorDonations()
                .then(data => setUserDonations(data || []))
                .catch(err => console.error("Error fetching chatbot donations:", err));
            getMyRequests()
                .then(data => setUserRequests(data || []))
                .catch(err => console.error("Error fetching chatbot requests:", err));
        } else if (!donorUser) {
            setUserDonations([]);
            setUserRequests([]);
        }
    }, [open, donorUser]);
    const [selectedCat, setSelectedCat] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fabPos, setFabPos] = useState({ x: 24, y: 24 });
    const [dragging, setDragging] = useState(false);
    const [winSize, setWinSize] = useState({ w: 440, h: 560 });
    const [resizing, setResizing] = useState(false);
    useInjectStyles(chatStyles, 'chat-styles');
    useInjectStyles(fabStyles, 'fab-styles');
    const dragRef = useRef({ startX: 0, startY: 0, startFabX: 0, startFabY: 0 });
    const fabRef = useRef(null);
    const chatRef = useRef(null);
    const resizeRef = useRef({ startX: 0, startY: 0, startW: 0, startH: 0, mode: 'both' });
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const categories = [...new Set(faqs.map(f => f.category))];

    const projectsData = donationCategories.flatMap(cat =>
        cat.items.map(item => ({
            title: item.title,
            category: cat.name,
            price: item.price,
            description: `تبرع بقيمة ${item.price} ج.م لـ ${item.title} ضمن ${cat.name}`,
        }))
    );

    useEffect(() => {
        if (open && messages.length === 0) {
            const greeting = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
            setMessages([{ type: 'bot', text: greeting, isQuickReplies: true }]);
        }
    }, [open, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 400);
    }, [open]);

    const handleDragStart = useCallback((e) => {
        const pos = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        dragRef.current = { startX: pos.x, startY: pos.y, startFabX: fabPos.x, startFabY: fabPos.y };
        setDragging(true);
    }, [fabPos]);

    const applyPos = useCallback((x, y) => {
        const chatW = Math.max(300, Math.min(winSize.w, window.innerWidth - 48));
        const chatH = Math.max(350, Math.min(winSize.h, window.innerHeight - 120));
        const maxX = open ? window.innerWidth - 8 - chatW : window.innerWidth - 64;
        const maxY = open ? window.innerHeight - 8 - 64 - chatH : window.innerHeight - 64;
        const clampedX = Math.max(8, Math.min(maxX, x));
        const clampedY = Math.max(8, Math.min(maxY, y));
        [fabRef, chatRef].forEach(ref => {
            if (ref.current) {
                ref.current.style.left = clampedX + 'px';
                ref.current.style.bottom = (ref === chatRef ? clampedY + 64 : clampedY) + 'px';
            }
        });
    }, [open, winSize]);

    useLayoutEffect(() => {
        applyPos(fabPos.x, fabPos.y);
    }, [fabPos, applyPos, open]);

    const handleDragMove = useCallback((e) => {
        if (!dragging) return;
        e.preventDefault();
        const pos = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        const dx = pos.x - dragRef.current.startX;
        const dy = pos.y - dragRef.current.startY;
        const newX = dragRef.current.startFabX + dx;
        const newY = dragRef.current.startFabY - dy;
        applyPos(newX, newY);
        dragRef.current.lastX = newX;
        dragRef.current.lastY = newY;
    }, [dragging, applyPos]);

    const handleDragEnd = useCallback(() => {
        setDragging(false);
        setFabPos({ x: dragRef.current.lastX || dragRef.current.startFabX, y: dragRef.current.lastY || dragRef.current.startFabY });
    }, []);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [dragging, handleDragMove, handleDragEnd]);

    const handleResizeStart = useCallback((e) => {
        e.stopPropagation();
        const pos = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        resizeRef.current = { startX: pos.x, startY: pos.y, startW: winSize.w, startH: winSize.h, mode: 'both' };
        setResizing(true);
    }, [winSize]);

    const handleResizeMove = useCallback((e) => {
        if (!resizing) return;
        e.preventDefault();
        const pos = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        const dx = pos.x - resizeRef.current.startX;
        const dy = pos.y - resizeRef.current.startY;
        const mode = resizeRef.current.mode || 'both';

        const newW = Math.max(300, resizeRef.current.startW + dx);
        const newH = mode === 'width' ? winSize.h : Math.max(350, resizeRef.current.startH + dy);

        if (mode !== 'width' && (newW >= MAXIMIZE_THRESHOLD || newH >= MAXIMIZE_THRESHOLD + 80)) {
            setResizing(false);
            setOpen(false);
            navigate('/chat');
            return;
        }
        setWinSize({ w: newW, h: newH });
    }, [resizing, winSize.h]);

    const handleResizeEnd = useCallback(() => setResizing(false), []);

    useEffect(() => {
        if (resizing) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd);
            window.addEventListener('touchmove', handleResizeMove, { passive: false });
            window.addEventListener('touchend', handleResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('mouseup', handleResizeEnd);
            window.removeEventListener('touchmove', handleResizeMove);
            window.removeEventListener('touchend', handleResizeEnd);
        };
    }, [resizing, handleResizeMove, handleResizeEnd]);

    const handleOpenFullPage = () => {
        setOpen(false);
        navigate('/chat');
    };

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
            const botMsg = data.reply || 'عذراً، لم أتمكن من معالجة طلبك.';
            setTimeout(() => { addMessage([{ type: 'bot', text: botMsg }]); setLoading(false); }, 300);
        } catch (err) {
            setTimeout(() => {
                addMessage([{
                    type: 'bot',
                    text: err.message?.includes('API') ? err.message : 'عذراً، حدث خطأ في الاتصال. تأكد من تشغيل الخادم الخلفي.',
                    isQuickReplies: true,
                }]);
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleFaqClick = (faqId) => {
        const faq = faqs.find(f => f.id === faqId);
        if (!faq) return;
        addMessage([{ type: 'user', text: faq.question }, { type: 'bot', text: faq.answer }]);
    };

    const handleQuickReply = (faqId) => {
        if (faqId === 'cases-1') {
            navigate('/special-requests');
            setOpen(false);
        } else if (faqId === 'general-2') {
            navigate('/volunteer');
            setOpen(false);
        } else {
            handleFaqClick(faqId);
        }
    };

    const getFilteredFaqs = () => {
        if (!selectedCat) return [];
        return faqs.filter(f => f.category === selectedCat);
    };

    const content = (
        <>
            {/* Header */}
            <div
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                className="p-2 flex items-center gap-1.5 shrink-0 cursor-grab select-none text-white"
                style={{
                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DK})`,
                }}>
                <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <i className="fa-solid fa-robot" style={{ fontSize: '1rem' }} />
                </div>
                <div className="flex-1">
                    <p className="font-extrabold text-[0.92rem] leading-tight" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
                        مساعد نور الذكي
                    </p>
                    <p className="text-[0.7rem] opacity-85" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
                        مدعوم بالذكاء الاصطناعي
                    </p>
                </div>
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={handleOpenFullPage}
                    className="p-2 rounded-md transition-colors text-white hover:bg-white/15"
                >
                    <i className="fa-solid fa-expand" />
                </button>
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-md transition-colors text-white hover:bg-white/15"
                >
                    <i className="fa-solid fa-xmark" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-2 flex flex-col gap-1.5" style={{
                direction: 'rtl',
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <div className="max-w-[88%] p-[10px_14px] text-[0.82rem] leading-relaxed break-words whitespace-pre-wrap"
                            style={{
                                borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                backgroundColor: msg.type === 'user' ? GREEN : (isDark ? '#1e2d2b' : '#f0faf5'),
                                color: msg.type === 'user' ? '#fff' : (isDark ? '#e2e8f0' : '#2d3436'),
                                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                animation: 'slideUp 0.3s ease both',
                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                boxShadow: msg.type === 'user' ? '0 2px 8px rgba(0,177,106,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                            }}>
                            {parseMarkdownLinks(msg.text)}
                        </div>
                        {msg.isQuickReplies && (
                            <div className="flex flex-wrap gap-0.6 mt-1.5" style={{ animation: 'slideUp 0.4s ease both' }}>
                                {quickReplies.map(qr => (
                                    <button key={qr.faqId}
                                        onClick={() => handleQuickReply(qr.faqId)}
                                        className="inline-flex items-center gap-0.5 px-1.2 py-0.4 rounded-full text-[0.72rem] font-semibold border transition-all"
                                        style={{
                                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.06)',
                                            color: isDark ? '#94a3b8' : '#5a6a6a',
                                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,177,106,0.1)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,177,106,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,177,106,0.3)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.06)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,177,106,0.1)'; }}
                                    >
                                        <i className={qr.icon} style={{ fontSize: '0.7rem' }} />
                                        {qr.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-1 mr-1" style={{ animation: 'slideUp 0.3s ease both' }}>
                        <div className="animate-spin rounded-full h-[18px] w-[18px] border-2 border-[#00b16a] border-t-transparent"></div>
                        <span className="text-[0.75rem]" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", color: isDark ? '#94a3b8' : '#889a98' }}>
                            جار الرد...
                        </span>
                    </div>
                )}

                {messages.length > 0 && !loading && (
                    <div className="flex flex-wrap gap-0.5 mt-1 pt-1.5" style={{
                        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.08)'}`,
                    }}>
                        {categories.map(cat => (
                            <button key={cat}
                                onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
                                className="px-1 py-0.3 rounded-full text-[0.65rem] font-semibold border transition-all"
                                style={{
                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                    backgroundColor: selectedCat === cat ? GREEN : 'transparent',
                                    color: selectedCat === cat ? '#fff' : (isDark ? '#94a3b8' : '#5a6a6a'),
                                    borderColor: selectedCat === cat ? GREEN : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,177,106,0.1)'),
                                }}
                                onMouseEnter={e => { if (selectedCat !== cat) { e.currentTarget.style.backgroundColor = 'rgba(0,177,106,0.06)'; } }}
                                onMouseLeave={e => { if (selectedCat !== cat) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {selectedCat && getFilteredFaqs().map(faq => (
                    <div key={faq.id} onClick={() => handleFaqClick(faq.id)}
                        className="p-1.2 rounded-xl cursor-pointer transition-all"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,177,106,0.03)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,177,106,0.06)'}`,
                            animation: 'slideUp 0.3s ease both',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,177,106,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,177,106,0.03)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,177,106,0.06)'; }}
                    >
                        <p className="text-[0.78rem] font-semibold" style={{
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            color: isDark ? '#e2e8f0' : '#2d3436',
                        }}>
                            <i className="fa-regular fa-circle-question" style={{ fontSize: '0.7rem', marginInlineEnd: 0.6, color: GREEN }} />
                            {' '}{faq.question}
                        </p>
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-1.5" style={{
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.08)'}`,
            }}>
                <div className="flex items-center gap-1 rounded-xl px-3 py-1" style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,177,106,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,177,106,0.12)'}`,
                }}>
                    <input
                        ref={inputRef}
                        placeholder={loading ? '...' : 'اكتب سؤالك هنا...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        dir="rtl"
                        className="flex-1 bg-transparent border-none outline-none text-[0.82rem]"
                        style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", color: isDark ? '#e2e8f0' : '#333' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all shrink-0"
                        style={{
                            backgroundColor: input.trim() && !loading ? GREEN : 'transparent',
                            color: input.trim() && !loading ? '#fff' : (isDark ? '#64748b' : '#a0b4b2'),
                        }}
                        onMouseEnter={e => { if (input.trim() && !loading) { e.currentTarget.style.backgroundColor = GREEN_DK; } }}
                        onMouseLeave={e => { if (input.trim() && !loading) { e.currentTarget.style.backgroundColor = GREEN; } }}
                    >
                        <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.78rem' }} />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {open && (
                <div
                    ref={chatRef}
                    className="fixed z-[1100] flex flex-col"
                    style={{
                        width: Math.max(300, Math.min(winSize.w, window.innerWidth - 48)),
                        height: Math.max(350, Math.min(winSize.h, window.innerHeight - 120)),
                        borderRadius: '20px',
                        overflow: 'hidden',
                        backgroundColor: isDark ? '#0f1a1c' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,177,106,0.12)'}`,
                        boxShadow: isDark ? '0 16px 60px rgba(0,0,0,0.5)' : '0 16px 60px rgba(0,177,106,0.15)',
                        animation: 'slideUp 0.35s ease both',
                    }}
                >
                    {content}
                    {/* Resize handles */}
                    <div
                        onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e); }}
                        onTouchStart={(e) => { e.stopPropagation(); handleResizeStart(e); }}
                        className="absolute top-0 left-0 w-7 h-7 z-10 transition-colors"
                        style={{
                            cursor: 'nwse-resize',
                            borderTop: `3px solid rgba(0,177,106,0.35)`,
                            borderLeft: `3px solid rgba(0,177,106,0.35)`,
                            borderTopLeftRadius: '18px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderTopColor = GREEN; e.currentTarget.style.borderLeftColor = GREEN; }}
                        onMouseLeave={e => { e.currentTarget.style.borderTopColor = 'rgba(0,177,106,0.35)'; e.currentTarget.style.borderLeftColor = 'rgba(0,177,106,0.35)'; }}
                    />
                    <div
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            const pos = { x: e.clientX, y: e.clientY };
                            resizeRef.current = { startX: pos.x, startY: pos.y, startW: winSize.w, startH: winSize.h, mode: 'width' };
                            setResizing(true);
                        }}
                        onTouchStart={(e) => {
                            e.stopPropagation();
                            const pos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                            resizeRef.current = { startX: pos.x, startY: pos.y, startW: winSize.w, startH: winSize.h, mode: 'width' };
                            setResizing(true);
                        }}
                        className="absolute top-0 right-0 w-2 h-full z-10 opacity-40 transition-opacity"
                        style={{ cursor: 'ew-resize' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.backgroundColor = 'rgba(0,177,106,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    />
                </div>
            )}

            {!open && (
                <button
                    ref={fabRef}
                    className="fixed z-[1100] w-14 h-14 rounded-full text-white flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DK})`,
                        boxShadow: dragging ? `0 8px 30px rgba(0,177,106,0.5)` : `0 4px 20px rgba(0,177,106,0.4)`,
                        left: fabPos.x + 'px',
                        bottom: fabPos.y + 'px',
                        transition: dragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        cursor: dragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        transform: dragging ? 'scale(1.08)' : 'none',
                        touchAction: 'none',
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    onClick={() => setOpen(true)}
                    onMouseEnter={e => { if (!dragging) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,177,106,0.5)`; }}}
                    onMouseLeave={e => { if (!dragging) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,177,106,0.4)`; }}}
                >
                    <i className="fa-solid fa-comment-dots" style={{ fontSize: '1.4rem', pointerEvents: 'none' }} />
                </button>
            )}
        </>
    );
}

export default ChatBot;
