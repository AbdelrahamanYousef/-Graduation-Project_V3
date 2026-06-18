import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    useTheme,
    alpha,
    Chip,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { donationCategories } from '../../data/mockData';
import { aiRecommend } from '../../api/ai.api';

const GREEN = '#00b16a';
const GREEN_DK = '#009659';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const ScoreDot = styled(Box)(() => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: GREEN,
    flexShrink: 0,
}));

const projectsData = donationCategories.flatMap(cat =>
    cat.items.map(item => ({
        title: item.title,
        category: cat.name,
        price: item.price,
        description: `تبرع بقيمة ${item.price} ج.م لـ ${item.title}`,
    }))
);

function RecommendationSection() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';
    const [interest, setInterest] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleRecommend = async () => {
        const q = interest.trim();
        if (!q || loading) return;
        setLoading(true);
        setError('');
        setRecommendations([]);
        setDone(false);

        try {
            const data = await aiRecommend(q, projectsData);
            setRecommendations(data.recommendations || []);
            setDone(true);
        } catch (err) {
            setError(err.message?.includes('API')
                ? err.message
                : 'عذراً، حدث خطأ. تأكد من تشغيل الخادم الخلفي.');
            setDone(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            py: { xs: 6, md: 10 },
            background: isDark
                ? 'linear-gradient(180deg, #04100e 0%, #0a1f1c 50%, #04100e 100%)'
                : 'linear-gradient(135deg, #f0faf5 0%, #e8f5ef 50%, #f0faf5 100%)',
        }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Chip
                        label="AI"
                        size="small"
                        sx={{
                            bgcolor: GREEN,
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            borderRadius: '6px',
                            mb: 1.5,
                            px: 0.5,
                        }}
                    />
                    <Typography variant="h4" sx={{
                        fontWeight: 900,
                        fontSize: { xs: '1.4rem', md: '1.8rem' },
                        color: isDark ? '#f1f5f9' : '#0d2b2a',
                        fontFamily: "'Cairo', 'Tajawal', sans-serif",
                        mb: 1,
                    }}>
                        التوصيات الذكية
                    </Typography>
                    <Typography sx={{
                        color: isDark ? '#94a3b8' : '#5a7a78',
                        fontSize: { xs: '0.85rem', md: '0.95rem' },
                        fontFamily: "'Cairo', 'Tajawal', sans-serif",
                    }}>
                        أخبرنا عن اهتمامك وسنرشح لك المشاريع الأنسب
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    gap: 1.5,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    maxWidth: 600,
                    mx: 'auto',
                    mb: 4,
                }}>
                    <TextField
                        fullWidth
                        size="medium"
                        placeholder="مثال: عايز أساعد أطفال يتامى"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRecommend(); }}
                        disabled={loading}
                        dir="rtl"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '14px',
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                fontSize: '0.9rem',
                                '& fieldset': {
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : alpha(GREEN, 0.15),
                                },
                                '&:hover fieldset': {
                                    borderColor: alpha(GREEN, 0.3),
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: GREEN,
                                },
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleRecommend}
                        disabled={loading || !interest.trim()}
                        sx={{
                            borderRadius: '14px',
                            py: { xs: 1.2, sm: 1.5 },
                            px: { xs: 3, sm: 4 },
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            bgcolor: GREEN,
                            color: '#fff',
                            minWidth: { xs: '100%', sm: 'auto' },
                            boxShadow: `0 4px 16px ${alpha(GREEN, 0.25)}`,
                            '&:hover': {
                                bgcolor: GREEN_DK,
                                boxShadow: `0 6px 24px ${alpha(GREEN, 0.35)}`,
                            },
                            '&.Mui-disabled': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : alpha(GREEN, 0.1),
                            },
                        }}
                        startIcon={loading ? (
                            <Box sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: '#fff',
                                animation: 'spin 0.7s linear infinite',
                                '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                            }} />
                        ) : <i className="fa-solid fa-wand-magic-sparkles" />}
                    >
                        {loading ? 'جاري التحليل...' : 'ابحث'}
                    </Button>
                </Box>

                {/* Results */}
                {recommendations.length > 0 && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        animation: `${fadeUp} 0.5s ease both`,
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                        }}>
                            <ScoreDot />
                            <Typography sx={{
                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                color: isDark ? '#e2e8f0' : '#2d3436',
                            }}>
                                التوصيات المقترحة لك
                            </Typography>
                        </Box>

                        {recommendations.map((item, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    p: 2,
                                    borderRadius: '16px',
                                    bgcolor: isDark ? '#1e293b' : '#ffffff',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.1)}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    animation: `${fadeUp} 0.4s ease both`,
                                    animationDelay: `${idx * 0.1}s`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 20px ${alpha(GREEN, 0.1)}`,
                                    },
                                }}
                            >
                                <Box sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DK})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <i className="fa-solid fa-star" style={{ color: '#fff', fontSize: '1rem' }} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{
                                        fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '0.88rem',
                                        color: isDark ? '#e2e8f0' : '#2d3436',
                                        mb: 0.3,
                                    }}>
                                        {item.title}
                                    </Typography>
                                    <Typography sx={{
                                        fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                        fontSize: '0.75rem',
                                        color: isDark ? '#94a3b8' : '#5a7a78',
                                        mb: 0.5,
                                    }}>
                                        {item.reason || item.category}
                                    </Typography>
                                    {item.price && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <i className="fa-solid fa-coins" style={{ fontSize: '0.7rem', color: GREEN }} />
                                            <Typography sx={{
                                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                color: GREEN,
                                            }}>
                                                {item.price.toLocaleString()} ج.م
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => navigate(`/donate?amount=${item.price || 0}`)}
                                    sx={{
                                        borderRadius: '10px',
                                        fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        bgcolor: GREEN,
                                        minWidth: 80,
                                        '&:hover': { bgcolor: GREEN_DK },
                                    }}
                                >
                                    تبرع
                                </Button>
                            </Box>
                        ))}

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button
                                size="small"
                                onClick={() => { setInterest(''); setRecommendations([]); setDone(false); }}
                                sx={{
                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                    color: isDark ? '#94a3b8' : '#5a7a78',
                                    textTransform: 'none',
                                    fontSize: '0.8rem',
                                }}
                            >
                                <i className="fa-solid fa-arrow-rotate-left" style={{ ml: 0.5 }} />
                                تجربة بحث آخر
                            </Button>
                        </Box>
                    </Box>
                )}

                {done && recommendations.length === 0 && !error && (
                    <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        animation: `${fadeUp} 0.4s ease both`,
                    }}>
                        <i className="fa-solid fa-search" style={{ fontSize: '2rem', color: alpha(GREEN, 0.4), mb: 1 }} />
                        <Typography sx={{
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            color: isDark ? '#94a3b8' : '#5a7a78',
                            fontSize: '0.9rem',
                        }}>
                            لم نجد مشاريع تطابق اهتمامك. جرب صياغة مختلفة.
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => { setInterest(''); setRecommendations([]); setDone(false); }}
                            sx={{ mt: 1.5, fontFamily: "'Cairo', 'Tajawal', sans-serif", color: GREEN, textTransform: 'none' }}
                        >
                            جرب مرة أخرى
                        </Button>
                    </Box>
                )}

                {error && (
                    <Box sx={{ textAlign: 'center', py: 3, animation: `${fadeUp} 0.4s ease both` }}>
                        <Typography sx={{
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            color: 'error.main',
                            fontSize: '0.85rem',
                        }}>
                            {error}
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default RecommendationSection;
