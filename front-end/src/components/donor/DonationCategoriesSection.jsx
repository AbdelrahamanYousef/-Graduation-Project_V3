import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    useTheme,
    alpha,
} from '@mui/material';
import { donationCategories, categoryColors } from '../../data/mockData';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const GREEN = '#00b16a';
const GREEN_DK = '#009659';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SectionWrap = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        position: 'relative',
        overflow: 'hidden',
        padding: theme.spacing(theme.custom?.sectionPadding || 10, 0),
        background: isDark
            ? 'linear-gradient(180deg, #04100e 0%, #0a1f1c 50%, #04100e 100%)'
            : 'linear-gradient(180deg, #f8fcf9 0%, #ffffff 30%, #f0faf5 70%, #e8f5ef 100%)',
    };
});

const Ornament = styled(Box)(() => ({
    textAlign: 'center',
    fontSize: '1.6rem',
    lineHeight: 1,
    color: alpha(GREEN, 0.25),
    marginBottom: 8,
    userSelect: 'none',
    letterSpacing: 6,
}));

const TabChip = styled(Button)(({ theme, selected }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        minHeight: 32,
        height: 32,
        padding: '0 9px',
        borderRadius: '999px',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        fontWeight: selected ? 700 : 600,
        fontSize: '0.68rem',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        color: selected ? '#fff' : (isDark ? '#94a3b8' : '#5a6a6a'),
        backgroundColor: selected ? GREEN : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,177,106,0.04)'),
        border: `1px solid ${selected ? GREEN : (isDark ? 'rgba(255,255,255,0.06)' : alpha(GREEN, 0.08))}`,
        boxShadow: selected ? `0 4px 16px ${alpha(GREEN, 0.35)}` : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: 0,
        flex: '0 0 auto',
        '&:hover': {
            backgroundColor: selected ? GREEN_DK : (isDark ? 'rgba(0,177,106,0.12)' : alpha(GREEN, 0.08)),
            borderColor: selected ? GREEN_DK : alpha(GREEN, 0.3),
            transform: 'translateY(-1px)',
            boxShadow: selected ? `0 6px 20px ${alpha(GREEN, 0.4)}` : 'none',
        },
        '@media (max-width:600px)': {
            minHeight: 28,
            height: 28,
            padding: '0 7px',
            fontSize: '0.64rem',
        },
    };
});

const GridBox = styled(Box)(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 16,
    '@media (min-width:600px)': {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
    },
    '@media (min-width:900px)': {
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 22,
    },
    '@media (min-width:1200px)': {
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 24,
    },
}));

const ItemCard = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.12)'}`,
        boxShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.25)'
            : '0 2px 16px rgba(0,177,106,0.06)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        '&:hover': {
            transform: 'translateY(-4px)',
            '& .card-img': {
                transform: 'scale(1.06)',
            },
        },
    };
});

function DonationCategoriesSection() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';
    const [tabIndex, setTabIndex] = useState(0);
    const [animKey, setAnimKey] = useState(0);
    const gridRef = useRef(null);

    useEffect(() => {
        setAnimKey(prev => prev + 1);
    }, [tabIndex]);

    const currentCategory = donationCategories[tabIndex];
    const items = currentCategory?.items || [];

    const handleDonate = (item) => {
        navigate(`/donate?amount=${item.price}`);
    };

    return (
        <SectionWrap>
            {/* Decorative glow spheres */}
            <Box sx={{
                position: 'absolute',
                top: -100,
                right: '15%',
                width: 350,
                height: 350,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(GREEN, 0.07)} 0%, transparent 70%)`,
                pointerEvents: 'none',
                filter: 'blur(70px)',
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -80,
                left: '10%',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(GREEN, 0.05)} 0%, transparent 70%)`,
                pointerEvents: 'none',
                filter: 'blur(60px)',
            }} />
            <Box sx={{
                position: 'absolute',
                top: '40%',
                left: '60%',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha('#ffd700', 0.04)} 0%, transparent 70%)`,
                pointerEvents: 'none',
                filter: 'blur(50px)',
            }} />

            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
                    <Ornament>✦ ◈ ✦</Ornament>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 900,
                            fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' },
                            color: isDark ? '#f1f5f9' : '#0d2b2a',
                            mb: 0.5,
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                            letterSpacing: '0.01em',
                        }}
                    >
                        تبرع الأن
                    </Typography>
                    <Typography
                        sx={{
                            color: isDark ? '#94a3b8' : '#5a7a78',
                            fontSize: { xs: '0.85rem', md: '1rem' },
                            maxWidth: 480,
                            mx: 'auto',
                            lineHeight: 1.7,
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                        }}
                    >
                        اختر مشروع الخير الذي تريد المساهمة فيه وكن جزءًا من صناعة الأمل
                    </Typography>
                </Box>

                {/* Tabs — flex wrap rows */}
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 0.6,
                    mb: { xs: 2.5, md: 4.5 },
                }}>
                    {donationCategories.map((cat, idx) => (
                        <TabChip
                            key={cat.id}
                            selected={tabIndex === idx}
                            onClick={() => setTabIndex(idx)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <i className={cat.icon} style={{ fontSize: '0.72rem' }} />
                                {cat.name}
                            </Box>
                        </TabChip>
                    ))}
                </Box>

                {/* Items Grid */}
                {currentCategory && (
                    <Box key={animKey} sx={{ animation: `${scaleIn} 0.4s ease both` }}>
                        <GridBox ref={gridRef}>
                            {items.slice(0, 6).map((item, idx) => (
                                <ItemCard key={item.id} onClick={() => handleDonate(item)}
                                    sx={{ animation: `${fadeUp} 0.5s ease both`, animationDelay: `${idx * 0.06}s` }}
                                >
                                    {/* Gradient background */}
                                    <Box
                                        className="card-img"
                                        sx={theme => {
                                            const colors = categoryColors[currentCategory.id] || ['#e8f5e9', '#4caf50'];
                                            return {
                                                height: { xs: 110, sm: 130 },
                                                background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                position: 'relative',
                                                '& i': {
                                                    fontSize: { xs: '2.4rem', md: '3rem' },
                                                    color: 'rgba(255,255,255,0.7)',
                                                    textShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                },
                                                '&:hover i': {
                                                    transform: 'scale(1.15)',
                                                },
                                            };
                                        }}
                                    >
                                        <i className={currentCategory.icon} />
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{
                                        p: { xs: 1.2, md: 1.5 },
                                        textAlign: 'center',
                                        direction: 'rtl',
                                    }}>
                                        <Typography
                                            sx={{
                                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                                fontWeight: 700,
                                                fontSize: { xs: '0.82rem', md: '0.88rem' },
                                                color: isDark ? '#e2e8f0' : '#2d3436',
                                                mb: 0.8,
                                                lineHeight: 1.4,
                                                minHeight: { xs: 36, md: 40 },
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {item.title}
                                        </Typography>

                                        {/* Price row */}
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 0.5,
                                            mb: 1.5,
                                            bgcolor: isDark ? alpha(GREEN, 0.08) : alpha(GREEN, 0.06),
                                            borderRadius: '10px',
                                            py: 0.7,
                                            px: 1,
                                        }}>
                                            <i className="fa-solid fa-coins" style={{ fontSize: '0.78rem', color: GREEN }} />
                                            <Typography
                                                sx={{
                                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                                    fontWeight: 800,
                                                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                                                    color: GREEN,
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {item.price.toLocaleString()}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600,
                                                    color: isDark ? '#94a3b8' : '#889a98',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                ج.م
                                            </Typography>
                                        </Box>

                                        {/* Donate button */}
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); handleDonate(item); }}
                                            sx={{
                                                borderRadius: '12px',
                                                py: 0.7,
                                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                                fontWeight: 700,
                                                fontSize: '0.78rem',
                                                textTransform: 'none',
                                                bgcolor: GREEN,
                                                color: '#fff',
                                                boxShadow: `0 3px 12px ${alpha(GREEN, 0.25)}`,
                                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: '-200%',
                                                    width: '200%',
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                                                    animation: `${shimmer} 2.5s ease-in-out infinite`,
                                                },
                                                '&:hover': {
                                                    bgcolor: GREEN_DK,
                                                    boxShadow: `0 6px 20px ${alpha(GREEN, 0.4)}`,
                                                    transform: 'translateY(-2px) scale(1.03)',
                                                },
                                                '&:active': {
                                                    transform: 'scale(0.96)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <i className="fa-solid fa-hand-holding-heart" style={{ fontSize: '0.72rem' }} />
                                                تبرع
                                            </Box>
                                        </Button>
                                    </Box>
                                </ItemCard>
                            ))}
                        </GridBox>

                        {/* View All */}
                        <Box sx={{ textAlign: 'center', mt: { xs: 3.5, md: 5 } }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/donate')}
                                sx={{
                                    borderRadius: '999px',
                                    px: { xs: 3, md: 5 },
                                    py: { xs: 0.9, md: 1.2 },
                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                    fontWeight: 700,
                                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                                    textTransform: 'none',
                                    borderColor: GREEN,
                                    color: GREEN,
                                    borderWidth: '2px',
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    bgcolor: isDark ? alpha(GREEN, 0.04) : 'transparent',
                                    '&:hover': {
                                        borderColor: GREEN_DK,
                                        bgcolor: GREEN,
                                        color: '#fff',
                                        transform: 'translateY(-3px)',
                                        boxShadow: `0 8px 24px ${alpha(GREEN, 0.3)}`,
                                        borderWidth: '2px',
                                        '& i': {
                                            transform: 'translateX(-4px)',
                                        },
                                    },
                                    '& i': {
                                        transition: 'transform 0.3s ease',
                                    },
                                }}
                                endIcon={<i className="fa-solid fa-arrow-left" style={{ fontSize: '0.85rem' }} />}
                            >
                                عرض جميع المشاريع
                            </Button>
                        </Box>
                    </Box>
                )}
            </Container>
        </SectionWrap>
    );
}

export default DonationCategoriesSection;
