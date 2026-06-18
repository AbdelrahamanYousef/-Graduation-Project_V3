import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    CircularProgress,
    Button,
    useTheme,
    alpha,
} from '@mui/material';
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

const MessageBubble = styled(Box)(({ isUser, theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        maxWidth: '75%',
        padding: '12px 18px',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        backgroundColor: isUser ? GREEN : (isDark ? '#1e2d2b' : '#f0faf5'),
        color: isUser ? '#fff' : (isDark ? '#e2e8f0' : '#2d3436'),
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        animation: `${slideUp} 0.3s ease both`,
        fontSize: '0.95rem',
        lineHeight: 1.7,
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        boxShadow: isUser ? `0 2px 8px ${alpha(GREEN, 0.2)}` : '0 1px 4px rgba(0,0,0,0.04)',
    };
});

const projectsData = donationCategories.flatMap(cat =>
    cat.items.map(item => ({
        title: item.title,
        category: cat.name,
        price: item.price,
        description: `تبرع بقيمة ${item.price} ج.م لـ ${item.title}`,
    }))
);

function FullPageChat() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
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

    const addMessage = (newMsgs) => {
        setMessages(prev => [...prev.filter(m => !m.isQuickReplies), ...newMsgs]);
    };

    const handleAnswer = async (question) => {
        addMessage([{ type: 'user', text: question }]);
        setLoading(true);
        try {
            const data = await aiChat(question, projectsData);
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
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: isDark ? '#04100e' : '#f8fcf9',
        }}>
            {/* Header */}
            <Box sx={{
                px: { xs: 2, md: 4 },
                py: { xs: 1.5, md: 2 },
                background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DK})`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexShrink: 0,
            }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
                    <i className="fa-solid fa-arrow-right" />
                </IconButton>
                <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <i className="fa-solid fa-robot" style={{ fontSize: '1.2rem' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.15rem' }, fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
                        مساعد نور الذكي
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.85, fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
                        مدعوم بالذكاء الاصطناعي
                    </Typography>
                </Box>
            </Box>

            {/* Messages */}
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                px: { xs: 2, md: 4 },
                py: { xs: 2, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                direction: 'rtl',
                maxWidth: 800,
                mx: 'auto',
                width: '100%',
            }}>
                {messages.map((msg, idx) => (
                    <Box key={idx}>
                        <MessageBubble isUser={msg.type === 'user'}>{msg.text}</MessageBubble>
                        {msg.isQuickReplies && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                {quickReplies.map(qr => (
                                    <Button key={qr.faqId} size="medium" onClick={() => handleQuickReply(qr.faqId)}
                                        sx={{
                                            borderRadius: '999px', fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                            fontSize: '0.82rem', textTransform: 'none', fontWeight: 600,
                                            py: 0.6, px: 1.8,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.06),
                                            color: isDark ? '#94a3b8' : '#5a6a6a',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : alpha(GREEN, 0.1)}`,
                                            '&:hover': { bgcolor: alpha(GREEN, 0.1), borderColor: alpha(GREEN, 0.3) },
                                            '& i': { ml: 0.5 },
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 1 }}>
                        <CircularProgress size={22} sx={{ color: GREEN }} />
                        <Typography sx={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#889a98', fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
                            جاري التفكير...
                        </Typography>
                    </Box>
                )}

                {messages.length > 0 && !loading && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 2, pt: 2, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.08)}` }}>
                        {categories.map(cat => (
                            <Button key={cat} size="small"
                                onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
                                sx={{
                                    borderRadius: '999px', fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                    fontSize: '0.72rem', textTransform: 'none',
                                    fontWeight: selectedCat === cat ? 700 : 500, py: 0.4, px: 1.2,
                                    bgcolor: selectedCat === cat ? GREEN : 'transparent',
                                    color: selectedCat === cat ? '#fff' : (isDark ? '#94a3b8' : '#5a6a6a'),
                                    border: `1px solid ${selectedCat === cat ? GREEN : (isDark ? 'rgba(255,255,255,0.08)' : alpha(GREEN, 0.1))}`,
                                }}
                            >
                                {cat}
                            </Button>
                        ))}
                    </Box>
                )}

                {selectedCat && getFilteredFaqs().map(faq => (
                    <Box key={faq.id} onClick={() => handleFaqClick(faq.id)}
                        sx={{
                            p: 1.5, borderRadius: '14px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : alpha(GREEN, 0.03),
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : alpha(GREEN, 0.06)}`,
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.06) },
                        }}
                    >
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: "'Cairo', 'Tajawal', sans-serif", color: isDark ? '#e2e8f0' : '#2d3436' }}>
                            <i className="fa-regular fa-circle-question" style={{ fontSize: '0.75rem', ml: 0.6, color: GREEN }} />
                            {' '}{faq.question}
                        </Typography>
                    </Box>
                ))}

                <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{
                p: { xs: 2, md: 3 },
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.08)}`,
                bgcolor: isDark ? '#0a1f1c' : '#ffffff',
            }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <TextField
                        inputRef={inputRef}
                        fullWidth
                        size="medium"
                        placeholder="اكتب سؤالك هنا..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        disabled={loading}
                        dir="rtl"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                fontSize: '0.95rem',
                                '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : alpha(GREEN, 0.15) },
                                '&:hover fieldset': { borderColor: alpha(GREEN, 0.3) },
                                '&.Mui-focused fieldset': { borderColor: GREEN },
                            },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleSend} disabled={loading || !input.trim()}
                                        sx={{
                                            bgcolor: input.trim() && !loading ? GREEN : 'transparent',
                                            color: input.trim() && !loading ? '#fff' : (isDark ? '#64748b' : '#a0b4b2'),
                                            borderRadius: '10px', width: 38, height: 38,
                                            '&:hover': { bgcolor: input.trim() && !loading ? GREEN_DK : alpha(GREEN, 0.1) },
                                        }}
                                    >
                                        <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.9rem' }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default FullPageChat;
