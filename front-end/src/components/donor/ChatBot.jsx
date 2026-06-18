import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, useTheme, alpha, Button, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { faqs, greetingMessages, quickReplies } from '../../data/chatbotData';
import { donationCategories } from '../../data/mockData';
import { aiChat } from '../../api/ai.api';

const GREEN = '#00b16a';
const GREEN_DK = '#009659';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const FabButton = styled(IconButton)(({ dragging }) => ({
    position: 'fixed',
    zIndex: 1100,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DK})`,
    color: '#fff',
    boxShadow: dragging
        ? `0 8px 30px ${alpha(GREEN, 0.5)}`
        : `0 4px 20px ${alpha(GREEN, 0.4)}`,
    transition: dragging
        ? 'none'
        : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    animation: dragging ? 'none' : `${pulse} 2.5s ease-in-out infinite`,
    cursor: dragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    '&:hover': {
        transform: dragging ? 'none' : 'scale(1.1)',
        boxShadow: `0 8px 30px ${alpha(GREEN, 0.5)}`,
        background: `linear-gradient(135deg, ${GREEN_DK}, ${GREEN})`,
    },
    '& i': { fontSize: '1.4rem', pointerEvents: 'none' },
}));

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,177,106,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(0,177,106,0); }
`;

const ChatWindow = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#0f1a1c' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : alpha(GREEN, 0.12)}`,
        boxShadow: isDark
            ? '0 16px 60px rgba(0,0,0,0.5)'
            : '0 16px 60px rgba(0,177,106,0.15)',
        animation: `${slideUp} 0.35s ease both`,
    };
});

const MessageBubble = styled(Box, { shouldForwardProp: (prop) => prop !== 'isUser' })(({ isUser, theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        maxWidth: '88%',
        padding: '10px 14px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        backgroundColor: isUser ? GREEN : (isDark ? '#1e2d2b' : '#f0faf5'),
        color: isUser ? '#fff' : (isDark ? '#e2e8f0' : '#2d3436'),
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        animation: `${slideUp} 0.3s ease both`,
        fontSize: '0.82rem',
        lineHeight: 1.6,
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        boxShadow: isUser
            ? `0 2px 8px ${alpha(GREEN, 0.2)}`
            : '0 1px 4px rgba(0,0,0,0.04)',
    };
});

const MAXIMIZE_THRESHOLD = 520;

function ChatBot() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [selectedCat, setSelectedCat] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fabPos, setFabPos] = useState({ x: 24, y: 24 });
    const [dragging, setDragging] = useState(false);
    const [winSize, setWinSize] = useState({ w: 440, h: 560 });
    const [resizing, setResizing] = useState(false);
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

    /* ---- drag FAB ---- */
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

    /* ---- resize window ---- */
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

    /* ---- open full page ---- */
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
            const data = await aiChat(question, projectsData);
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

    const handleQuickReply = (faqId) => handleFaqClick(faqId);

    const getFilteredFaqs = () => {
        if (!selectedCat) return [];
        return faqs.filter(f => f.category === selectedCat);
    };

    const content = (
        <>
            {/* Header */}
            <Box
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                sx={{
                    p: { xs: 2, md: 2 },
                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DK})`,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexShrink: 0,
                    cursor: 'grab',
                    userSelect: 'none',
                }}>
                <Box sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <i className="fa-solid fa-robot" style={{ fontSize: '1rem' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        fontFamily: "'Cairo', 'Tajawal', sans-serif",
                        lineHeight: 1.2,
                    }}>
                        مساعد نور الذكي
                    </Typography>
                    <Typography sx={{
                        fontSize: '0.7rem',
                        opacity: 0.85,
                        fontFamily: "'Cairo', 'Tajawal', sans-serif",
                    }}>
                        مدعوم بالذكاء الاصطناعي
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={handleOpenFullPage}
                    sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                >
                    <i className="fa-solid fa-expand" />
                </IconButton>
                <IconButton
                    size="small"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={() => setOpen(false)}
                    sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                >
                    <i className="fa-solid fa-xmark" />
                </IconButton>
            </Box>

            {/* Messages */}
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                p: { xs: 2, md: 2 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                direction: 'rtl',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: alpha(GREEN, 0.2), borderRadius: 4 },
            }}>
                {messages.map((msg, idx) => (
                    <Box key={idx}>
                        <MessageBubble isUser={msg.type === 'user'}>
                            {msg.text}
                        </MessageBubble>
                        {msg.isQuickReplies && (
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.6,
                                mt: 1.5,
                                animation: `${slideUp} 0.4s ease both`,
                            }}>
                                {quickReplies.map(qr => (
                                    <Button
                                        key={qr.faqId}
                                        size="small"
                                        onClick={() => handleQuickReply(qr.faqId)}
                                        sx={{
                                            borderRadius: '999px',
                                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                            fontSize: '0.72rem',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            py: 0.4,
                                            px: 1.2,
                                            minWidth: 0,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.06),
                                            color: isDark ? '#94a3b8' : '#5a6a6a',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : alpha(GREEN, 0.1)}`,
                                            '&:hover': { bgcolor: alpha(GREEN, 0.1), borderColor: alpha(GREEN, 0.3) },
                                            '& i': { fontSize: '0.7rem', ml: 0.4 },
                                        }}
                                        startIcon={<i className={qr.icon} />}
                                    >
                                        {qr.label}
                                    </Button>
                                ))}
                            </Box>
                        )}
                    </Box>
                ))}

                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, animation: `${slideUp} 0.3s ease both`, mr: 1 }}>
                        <CircularProgress size={18} sx={{ color: GREEN }} />
                        <Typography sx={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#889a98', fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
                            جار الرد...
                        </Typography>
                    </Box>
                )}

                {messages.length > 0 && !loading && (
                    <Box sx={{
                        display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, pt: 1.5,
                        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.08)}`,
                    }}>
                        {categories.map(cat => (
                            <Button
                                key={cat} size="small"
                                onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
                                sx={{
                                    borderRadius: '999px', fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                    fontSize: '0.65rem', textTransform: 'none',
                                    fontWeight: selectedCat === cat ? 700 : 500,
                                    py: 0.3, px: 1, minWidth: 0,
                                    bgcolor: selectedCat === cat ? GREEN : 'transparent',
                                    color: selectedCat === cat ? '#fff' : (isDark ? '#94a3b8' : '#5a6a6a'),
                                    border: `1px solid ${selectedCat === cat ? GREEN : (isDark ? 'rgba(255,255,255,0.08)' : alpha(GREEN, 0.1))}`,
                                    '&:hover': { bgcolor: selectedCat === cat ? GREEN_DK : alpha(GREEN, 0.06) },
                                }}
                            >
                                {cat}
                            </Button>
                        ))}
                    </Box>
                )}

                {selectedCat && getFilteredFaqs().map(faq => (
                    <Box key={faq.id} onClick={() => handleFaqClick(faq.id)} sx={{
                        p: 1.2, borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : alpha(GREEN, 0.03),
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : alpha(GREEN, 0.06)}`,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        animation: `${slideUp} 0.3s ease both`,
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.06), borderColor: alpha(GREEN, 0.2) },
                    }}>
                        <Typography sx={{
                            fontSize: '0.78rem', fontWeight: 600,
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            color: isDark ? '#e2e8f0' : '#2d3436',
                        }}>
                            <i className="fa-regular fa-circle-question" style={{ fontSize: '0.7rem', ml: 0.6, color: GREEN }} />
                            {' '}{faq.question}
                        </Typography>
                    </Box>
                ))}

                <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{
                p: { xs: 1.5, md: 1.5 },
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.08)}`,
            }}>
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    size="small"
                    placeholder={loading ? '...' : 'اكتب سؤالك هنا...'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    dir="rtl"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : alpha(GREEN, 0.03),
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            fontSize: '0.82rem',
                            '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.08)' : alpha(GREEN, 0.12) },
                            '&:hover fieldset': { borderColor: alpha(GREEN, 0.3) },
                            '&.Mui-focused fieldset': { borderColor: GREEN },
                        },
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    sx={{
                                        bgcolor: input.trim() && !loading ? GREEN : 'transparent',
                                        color: input.trim() && !loading ? '#fff' : (isDark ? '#64748b' : '#a0b4b2'),
                                        borderRadius: '8px', width: 32, height: 32, transition: 'all 0.2s ease',
                                        '&:hover': { bgcolor: input.trim() && !loading ? GREEN_DK : alpha(GREEN, 0.1) },
                                    }}
                                >
                                    <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.78rem' }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </>
    );

    return (
        <>
            {open && (
                <ChatWindow
                    ref={chatRef}
                    sx={{
                        position: 'fixed',
                        width: Math.max(300, Math.min(winSize.w, window.innerWidth - 48)),
                        height: Math.max(350, Math.min(winSize.h, window.innerHeight - 120)),
                        zIndex: 1100,
                    }}
                >
                    {content}
                    {/* Resize handles */}
                    <>
                        {/* Top-left: resize up/left */}
                        <Box
                            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e); }}
                            onTouchStart={(e) => { e.stopPropagation(); handleResizeStart(e); }}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: 28,
                                height: 28,
                                cursor: 'nwse-resize',
                                zIndex: 10,
                                borderTop: `3px solid ${alpha(GREEN, 0.35)}`,
                                borderLeft: `3px solid ${alpha(GREEN, 0.35)}`,
                                borderTopLeftRadius: '18px',
                                transition: 'border-color 0.2s',
                                '&:hover': { borderTopColor: GREEN, borderLeftColor: GREEN },
                            }}
                        />
                        {/* Right edge: resize width */}
                        <Box
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
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: 8,
                                height: '100%',
                                cursor: 'ew-resize',
                                zIndex: 10,
                                opacity: 0.4,
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 0.8, bgcolor: alpha(GREEN, 0.05) },
                            }}
                        />
                    </>
                </ChatWindow>
            )}

            {!open && (
                <FabButton
                    ref={fabRef}
                    dragging={dragging ? 1 : 0}
                    style={{ position: 'fixed', zIndex: 1100, left: fabPos.x + 'px', bottom: fabPos.y + 'px', transform: dragging ? 'scale(1.08)' : 'none', touchAction: 'none' }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    onClick={() => setOpen(true)}
                >
                    <i className="fa-solid fa-comment-dots" />
                </FabButton>
            )}
        </>
    );
}

export default ChatBot;
