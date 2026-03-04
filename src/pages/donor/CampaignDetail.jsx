import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Chip,
    Divider,
    Paper,
    IconButton,
    useTheme,
    alpha,
} from '@mui/material';
import { formatCurrency, formatNumber, getLanguage } from '../../i18n';
import { projects, programs } from '../../data/mockData';
import { QuickDonateModal } from './Campaigns';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const G_GREEN = '#00b16a';
const G_GREEN_DK = '#009959';
const EMERALD = '#10b981';
const TEAL = '#1a4a44';
const TEAL_MID = '#0d6b58';
const DARK_BG = '#0f172a';
const DARK_CARD = '#1e293b';
const DARK_TEXT = '#e2e8f0';
const DARK_HEAD = '#f8fafc';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT = "'Inter', 'Manrope', sans-serif";

const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);
const isEn = () => getLanguage() === 'en';

// ─────────────────────────────────────────────
//  ANIMATIONS
// ─────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─────────────────────────────────────────────
//  ANIMATED PROGRESS BAR
// ─────────────────────────────────────────────
function AnimatedProgress({ value, height = 10 }) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const c = Math.min(value, 100);
    return (
        <Box ref={ref} sx={{
            height, borderRadius: height / 2,
            bgcolor: dk ? 'rgba(255,255,255,0.07)' : alpha(G_GREEN, 0.10),
            overflow: 'hidden',
        }}>
            <Box sx={{
                height: '100%', borderRadius: height / 2,
                background: `linear-gradient(90deg, ${G_GREEN}, ${EMERALD})`,
                width: vis ? `${c}%` : '0%',
                transition: vis ? 'width 1.2s cubic-bezier(.4,0,.2,1)' : 'none',
                ...(dk && { boxShadow: `0 0 10px ${alpha(EMERALD, 0.5)}` }),
            }} />
        </Box>
    );
}

// ─────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon, value, label }) {
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';
    return (
        <Box sx={{
            textAlign: 'center', py: 1.2, px: 1,
            borderRadius: '14px',
            bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#f8fafb',
            border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#f0f4f8'}`,
            transition: 'all 0.25s ease',
            '&:hover': {
                bgcolor: dk ? 'rgba(0,177,106,0.06)' : alpha(G_GREEN, 0.04),
                borderColor: alpha(G_GREEN, 0.2),
            },
        }}>
            <Box sx={{
                width: 30, height: 30, borderRadius: '8px', mx: 'auto', mb: 0.5,
                bgcolor: alpha(G_GREEN, 0.12),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <i className={`fa-solid ${icon}`} style={{ color: G_GREEN, fontSize: '0.75rem' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: dk ? DARK_HEAD : '#1a1a1a', lineHeight: 1.2 }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: dk ? alpha(DARK_TEXT, 0.55) : '#999', mt: 0.2 }}>
                {label}
            </Typography>
        </Box>
    );
}

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
export default function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';
    const lang = isEn();

    const [donateProject, setDonateProject] = useState(null);
    const [donationAmount, setDonationAmount] = useState(200);
    const AMOUNT_STEP = 50;

    const campaign = projects.find(p => p.id === parseInt(id));
    const program = programs.find(p => p.id === campaign?.programId);

    if (!campaign) {
        return (
            <Box sx={{ textAlign: 'center', py: 12, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{
                    width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
                    bgcolor: alpha(G_GREEN, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <i className="fa-solid fa-search" style={{ fontSize: '2rem', color: G_GREEN }} />
                </Box>
                <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.3rem', mb: 1, color: dk ? DARK_HEAD : '#2d3436' }}>
                    {loc('الحملة غير موجودة', 'Campaign not found')}
                </Typography>
                <Button component={Link} to="/campaigns" variant="contained"
                    sx={{ bgcolor: G_GREEN, borderRadius: '14px', px: 4, py: 1, fontFamily: ARABIC_FONT, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: G_GREEN_DK } }}>
                    {loc('العودة للحملات', 'Back to Campaigns')}
                </Button>
            </Box>
        );
    }

    const title = loc(campaign.title, campaign.titleEn);
    const desc = loc(campaign.description, campaign.descriptionEn);
    const location = loc(campaign.location, campaign.locationEn);
    const programName = loc(program?.name || campaign.program, program?.nameEn || campaign.programEn);
    const pct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
    const font = lang ? LATIN_FONT : ARABIC_FONT;
    const dir = lang ? 'ltr' : 'rtl';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: dk ? DARK_BG : '#f5f7f9' }}>

            {/* ── Main Split Layout ── */}
            <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3.5,
                    alignItems: 'flex-start',
                }}>

                    {/* ═════ Campaign Details (2/3) ═════ */}
                    <Box sx={{
                        flex: { xs: '1 1 auto', md: '0 0 calc(66.666% - 14px)' },
                        width: { xs: '100%', md: 'calc(66.666% - 14px)' },
                        animation: `${slideUp} 0.5s ease both`,
                        direction: dir,
                        order: { xs: 1, md: lang ? 1 : 2 },
                    }}>

                        {/* Back button */}
                        <Button
                            onClick={() => navigate('/campaigns')}
                            sx={{
                                mb: 1.5, textTransform: 'none', fontFamily: font,
                                fontWeight: 600, fontSize: '0.82rem',
                                color: dk ? alpha(DARK_TEXT, 0.7) : '#777',
                                borderRadius: '10px', px: 1.5, py: 0.4,
                                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                transition: 'all 0.2s ease',
                                '&:hover': { bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#eef2f7', color: dk ? DARK_TEXT : '#333' },
                            }}
                        >
                            {lang && <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.65rem' }} />}
                            {loc('العودة للحملات', 'Back to Campaigns')}
                            {!lang && <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.65rem' }} />}
                        </Button>

                        {/* Campaign Image */}
                        <Box sx={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            mb: 2.5,
                            position: 'relative',
                            height: { xs: 240, md: 340 },
                            boxShadow: dk ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
                        }}>
                            <Box
                                component="img"
                                src={campaign.image}
                                alt={title}
                                sx={{
                                    width: '100%', height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=500&fit=crop';
                                }}
                            />
                            {/* Overlay info badges */}
                            <Box sx={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Box sx={{
                                    bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                                    borderRadius: '10px', px: 1.5, py: 0.5,
                                    display: 'flex', alignItems: 'center', gap: 0.6,
                                }}>
                                    <i className="fa-solid fa-location-dot" style={{ color: '#fff', fontSize: '0.65rem' }} />
                                    <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontFamily: font, fontWeight: 600 }}>{location}</Typography>
                                </Box>
                                <Box sx={{
                                    bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                                    borderRadius: '10px', px: 1.5, py: 0.5,
                                    display: 'flex', alignItems: 'center', gap: 0.6,
                                }}>
                                    <i className="fa-solid fa-users" style={{ color: '#fff', fontSize: '0.65rem' }} />
                                    <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontFamily: font, fontWeight: 600 }}>
                                        {formatNumber(campaign.donors)} {loc('متبرع', 'donors')}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    bgcolor: 'rgba(0,177,106,0.75)', backdropFilter: 'blur(8px)',
                                    borderRadius: '10px', px: 1.5, py: 0.5,
                                    display: 'flex', alignItems: 'center', gap: 0.6,
                                }}>
                                    <i className="fa-solid fa-hourglass-half" style={{ color: '#fff', fontSize: '0.65rem' }} />
                                    <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontFamily: font, fontWeight: 600 }}>
                                        {campaign.daysLeft} {loc('يوم', 'days')}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Campaign Title & Category */}
                        <Paper elevation={0} sx={{
                            borderRadius: '18px', p: { xs: 2.5, md: 3 },
                            bgcolor: dk ? DARK_CARD : '#fff',
                            border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#eef2f7'}`,
                            boxShadow: dk ? '0 4px 16px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.04)',
                        }}>
                            {/* Category chip */}
                            <Chip
                                icon={<i className={program?.icon || 'fa-solid fa-tag'} style={{ fontSize: '0.6rem' }} />}
                                label={programName}
                                size="small"
                                sx={{
                                    mb: 1.5, fontFamily: font, fontWeight: 700, fontSize: '0.72rem',
                                    bgcolor: dk ? alpha(G_GREEN, 0.12) : alpha(G_GREEN, 0.08),
                                    color: G_GREEN,
                                    borderRadius: '8px', height: 26,
                                    '& .MuiChip-icon': { color: G_GREEN },
                                }}
                            />

                            {/* Title */}
                            <Typography sx={{
                                fontWeight: 900, fontFamily: font,
                                fontSize: { xs: '1.3rem', md: '1.55rem' },
                                lineHeight: 1.4, color: dk ? DARK_HEAD : '#1a1a1a',
                                mb: 2,
                            }}>
                                {title}
                            </Typography>

                            {/* Description */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Box sx={{ width: 4, height: 20, borderRadius: 2, background: `linear-gradient(180deg, ${G_GREEN}, ${EMERALD})` }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: font, color: dk ? DARK_HEAD : '#1a1a1a' }}>
                                    {loc('عن الحملة', 'About This Campaign')}
                                </Typography>
                            </Box>
                            <Typography sx={{
                                fontSize: '0.9rem', lineHeight: 2,
                                color: dk ? alpha(DARK_TEXT, 0.78) : '#555',
                                fontFamily: font, mb: 2.5,
                            }}>
                                {desc}
                            </Typography>

                            {/* Campaign Goals */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Box sx={{ width: 4, height: 20, borderRadius: 2, background: `linear-gradient(180deg, ${G_GREEN}, ${EMERALD})` }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: font, color: dk ? DARK_HEAD : '#1a1a1a' }}>
                                    {loc('أهداف الحملة', 'Campaign Goals')}
                                </Typography>
                            </Box>
                            <Stack spacing={1}>
                                {[
                                    { icon: 'fa-bullseye', text: loc('الوصول إلى الفئات المستهدفة في المناطق الأكثر احتياجًا', 'Reach targeted groups in underserved areas') },
                                    { icon: 'fa-hand-holding-heart', text: loc('توفير الدعم المادي والعيني بشكل مباشر', 'Provide direct financial and in-kind support') },
                                    { icon: 'fa-eye', text: loc('ضمان الشفافية الكاملة في توزيع التبرعات', 'Ensure full transparency in donation distribution') },
                                    { icon: 'fa-chart-line', text: loc('متابعة وتقييم الأثر بشكل دوري', 'Regular monitoring and impact assessment') },
                                ].map((goal, i) => (
                                    <Box key={i} sx={{
                                        display: 'flex', alignItems: 'center', gap: 1.2,
                                        p: 1.2, borderRadius: '12px',
                                        bgcolor: dk ? 'rgba(255,255,255,0.02)' : '#fafbfc',
                                        border: `1px solid ${dk ? 'rgba(255,255,255,0.04)' : '#f0f4f8'}`,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: dk ? alpha(G_GREEN, 0.04) : alpha(G_GREEN, 0.03),
                                            borderColor: alpha(G_GREEN, 0.15),
                                        },
                                    }}>
                                        <Box sx={{
                                            width: 28, height: 28, borderRadius: '8px',
                                            bgcolor: alpha(G_GREEN, 0.12),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <i className={`fa-solid ${goal.icon}`} style={{ fontSize: '0.6rem', color: G_GREEN }} />
                                        </Box>
                                        <Typography sx={{
                                            fontSize: '0.85rem', lineHeight: 1.6,
                                            fontFamily: font, color: dk ? DARK_TEXT : '#444',
                                        }}>
                                            {goal.text}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>

                            {/* Donation amount info */}
                            {campaign.donationAmount && (
                                <>
                                    <Divider sx={{ my: 2.5, borderColor: dk ? 'rgba(255,255,255,0.06)' : '#f0f4f8' }} />
                                    <Box sx={{
                                        p: 2, borderRadius: '14px',
                                        bgcolor: dk ? alpha(G_GREEN, 0.06) : alpha(G_GREEN, 0.04),
                                        border: `1.5px dashed ${alpha(G_GREEN, 0.3)}`,
                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                    }}>
                                        <Box sx={{
                                            width: 38, height: 38, borderRadius: '10px',
                                            bgcolor: alpha(G_GREEN, 0.15),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <i className="fa-solid fa-coins" style={{ fontSize: '0.9rem', color: G_GREEN }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontFamily: font, fontWeight: 600, fontSize: '0.78rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888' }}>
                                                {loc('مبلغ التبرع الواحد', 'Single Donation Amount')}
                                            </Typography>
                                            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 800, fontSize: '1.05rem', color: G_GREEN }}>
                                                {formatCurrency(campaign.donationAmount)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Box>

                    {/* ═════ Donation Side (1/3) ═════ */}
                    <Box sx={{
                        flex: { xs: '1 1 auto', md: '0 0 calc(33.333% - 14px)' },
                        width: { xs: '100%', md: 'calc(33.333% - 14px)' },
                        animation: `${slideUp} 0.5s ease both 0.1s`,
                        direction: dir,
                        order: { xs: 2, md: lang ? 2 : 1 },
                    }}>
                        <Box sx={{ position: 'sticky', top: 80 }}>

                            {/* Progress Card */}
                            <Paper elevation={0} sx={{
                                borderRadius: '18px', overflow: 'hidden', mb: 2,
                                bgcolor: dk ? DARK_CARD : '#fff',
                                border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#eef2f7'}`,
                                boxShadow: dk ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 14px rgba(0,0,0,0.05)',
                            }}>
                                {/* Header stripe */}
                                <Box sx={{
                                    background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_MID} 100%)`,
                                    p: 2.5, pb: 2,
                                }}>
                                    <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: '0.95rem', color: '#fff', mb: 0.3 }}>
                                        {loc('ساهم في هذه الحملة', 'Contribute to This Campaign')}
                                    </Typography>
                                    <Typography sx={{ fontFamily: font, fontSize: '0.73rem', color: 'rgba(255,255,255,0.55)' }}>
                                        {loc('كل تبرع يُحدث فرقًا', 'Every donation makes a difference')}
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 2.5 }}>
                                    {/* Raised / Goal */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.8 }}>
                                            <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: G_GREEN, fontFamily: LATIN_FONT }}>
                                                {formatCurrency(campaign.raised)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#9ca3af', fontFamily: font }}>
                                                {loc('من', 'of')} {formatCurrency(campaign.goal)}
                                            </Typography>
                                        </Box>
                                        <AnimatedProgress value={pct} height={8} />
                                        <Typography sx={{
                                            fontSize: '0.7rem', color: dk ? alpha(DARK_TEXT, 0.4) : '#b0b0b0',
                                            fontFamily: font, mt: 0.5, textAlign: 'center',
                                        }}>
                                            {pct}% {loc('مكتمل', 'funded')}
                                        </Typography>
                                    </Box>

                                    {/* Stats row */}
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2.5 }}>
                                        <StatCard icon="fa-chart-simple" value={`${pct}%`} label={loc('مكتمل', 'Funded')} />
                                        <StatCard icon="fa-users" value={formatNumber(campaign.donors)} label={loc('متبرع', 'Donors')} />
                                        <StatCard icon="fa-clock" value={campaign.daysLeft} label={loc('يوم', 'Days')} />
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Donation Controls Card */}
                            <Paper elevation={0} sx={{
                                borderRadius: '18px', p: 2.5,
                                bgcolor: dk ? DARK_CARD : '#fff',
                                border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#eef2f7'}`,
                                boxShadow: dk ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 14px rgba(0,0,0,0.05)',
                            }}>
                                {/* Amount picker title */}
                                <Typography sx={{
                                    fontWeight: 700, fontSize: '0.88rem',
                                    fontFamily: font, color: dk ? DARK_HEAD : '#1a1a1a', mb: 1.2,
                                }}>
                                    {loc('اختر مبلغ التبرع', 'Choose Donation Amount')}
                                </Typography>

                                {/* Preset chips */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                                    {[50, 100, 200, 500, 1000].map(a => {
                                        const active = donationAmount === a;
                                        return (
                                            <Button key={a} onClick={() => setDonationAmount(a)}
                                                variant={active ? 'contained' : 'outlined'} size="small"
                                                sx={{
                                                    borderRadius: '10px', fontWeight: 700,
                                                    fontSize: '0.78rem', px: 1.5, py: 0.5, minWidth: 0,
                                                    textTransform: 'none', fontFamily: LATIN_FONT,
                                                    borderColor: active ? G_GREEN : (dk ? 'rgba(255,255,255,0.12)' : '#e2e8f0'),
                                                    color: active ? '#fff' : (dk ? DARK_TEXT : '#555'),
                                                    bgcolor: active ? G_GREEN : 'transparent',
                                                    boxShadow: active ? `0 3px 12px ${alpha(G_GREEN, 0.3)}` : 'none',
                                                    transition: 'all 0.25s ease',
                                                    '&:hover': { bgcolor: active ? G_GREEN_DK : alpha(G_GREEN, 0.06), borderColor: G_GREEN },
                                                }}
                                            >
                                                {a} {loc('ج.م', 'EGP')}
                                            </Button>
                                        );
                                    })}
                                </Box>

                                {/* Dynamic +/- amount control */}
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: 1.5, mb: 2.5, py: 1.2, px: 1.5,
                                    borderRadius: '16px',
                                    bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#f8fafb',
                                    border: `1.5px solid ${dk ? 'rgba(255,255,255,0.08)' : '#eef2f7'}`,
                                }}>
                                    <IconButton
                                        onClick={() => setDonationAmount(Math.max(AMOUNT_STEP, donationAmount - AMOUNT_STEP))}
                                        sx={{
                                            width: 38, height: 38, borderRadius: '10px',
                                            border: `1.5px solid ${dk ? 'rgba(255,255,255,0.12)' : '#e0e0e0'}`,
                                            bgcolor: dk ? 'rgba(255,255,255,0.04)' : '#fff',
                                            color: dk ? DARK_TEXT : '#555',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#f0f0f0' },
                                        }}
                                    >
                                        <i className="fa-solid fa-minus" style={{ fontSize: '0.7rem' }} />
                                    </IconButton>

                                    <Box sx={{ textAlign: 'center', minWidth: 90 }}>
                                        <input
                                            type="number"
                                            value={donationAmount}
                                            onChange={(e) => {
                                                const v = parseInt(e.target.value) || 0;
                                                setDonationAmount(Math.max(0, v));
                                            }}
                                            style={{
                                                border: 'none', outline: 'none', background: 'transparent',
                                                fontFamily: LATIN_FONT, fontWeight: 800, fontSize: '1.4rem',
                                                color: G_GREEN, textAlign: 'center', width: '100%',
                                                direction: 'ltr',
                                            }}
                                        />
                                        <Typography sx={{
                                            fontFamily: font, fontWeight: 500, fontSize: '0.65rem',
                                            color: dk ? alpha(DARK_TEXT, 0.4) : '#aaa', mt: -0.3,
                                        }}>
                                            {loc('جنية مصري', 'EGP')}
                                        </Typography>
                                    </Box>

                                    <IconButton
                                        onClick={() => setDonationAmount(donationAmount + AMOUNT_STEP)}
                                        sx={{
                                            width: 38, height: 38, borderRadius: '10px',
                                            border: `1.5px solid ${dk ? 'rgba(0,177,106,0.3)' : '#d1f2e4'}`,
                                            bgcolor: dk ? 'rgba(0,177,106,0.08)' : '#f0faf5',
                                            color: G_GREEN,
                                            transition: 'all 0.2s ease',
                                            '&:hover': { bgcolor: dk ? 'rgba(0,177,106,0.15)' : '#e0f5ec' },
                                        }}
                                    >
                                        <i className="fa-solid fa-plus" style={{ fontSize: '0.7rem' }} />
                                    </IconButton>
                                </Box>

                                {/* Donate Now button */}
                                <Button
                                    variant="contained" fullWidth
                                    onClick={() => setDonateProject(campaign)}
                                    sx={{
                                        borderRadius: '14px !important', py: 1.3,
                                        fontWeight: 800, fontSize: '0.95rem',
                                        textTransform: 'none', fontFamily: font,
                                        bgcolor: G_GREEN, color: '#fff',
                                        boxShadow: `0 6px 24px ${alpha(G_GREEN, 0.35)}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': { bgcolor: G_GREEN_DK, boxShadow: `0 8px 28px ${alpha(G_GREEN, 0.45)}`, transform: 'translateY(-1px)' },
                                        '&:active': { transform: 'scale(0.98)' },
                                        mb: 1.5,
                                    }}
                                >
                                    <i className="fa-solid fa-heart" style={{ marginInlineEnd: 8, fontSize: '0.85rem' }} />
                                    {loc('تبرع الآن', 'Donate Now')}
                                    <Box component="span" sx={{
                                        bgcolor: 'rgba(255,255,255,0.20)', borderRadius: '10px',
                                        px: 1.2, py: 0.2, fontWeight: 800, fontSize: '0.8rem',
                                        display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 1,
                                    }}>
                                        {formatNumber(donationAmount)}
                                        <Typography component="span" sx={{ fontFamily: font, fontWeight: 500, fontSize: '0.55rem', opacity: 0.85 }}>
                                            {loc('ج.م', 'EGP')}
                                        </Typography>
                                    </Box>
                                </Button>

                                {/* Share button */}
                                <Button
                                    fullWidth
                                    onClick={() => navigator.share?.({ title, url: window.location.href })}
                                    sx={{
                                        borderRadius: '12px !important', py: 0.9,
                                        fontWeight: 600, fontSize: '0.85rem',
                                        textTransform: 'none', fontFamily: font,
                                        color: dk ? alpha(DARK_TEXT, 0.7) : '#6b7280',
                                        border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : '#eef2f7'}`,
                                        bgcolor: dk ? 'rgba(255,255,255,0.02)' : '#fafbfc',
                                        transition: 'all 0.25s ease',
                                        '&:hover': { bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f0f4f8', borderColor: alpha(G_GREEN, 0.2) },
                                    }}
                                >
                                    <i className="fa-solid fa-share-nodes" style={{ marginInlineEnd: 8, fontSize: '0.8rem' }} />
                                    {loc('مشاركة الحملة', 'Share Campaign')}
                                </Button>
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            </Container>

            {/* ── Quick Donate Modal ── */}
            <QuickDonateModal
                open={!!donateProject}
                onClose={() => setDonateProject(null)}
                project={donateProject}
            />
        </Box>
    );
}
