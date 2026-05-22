import { Box, Typography, TextField, InputAdornment, Collapse, useTheme, alpha } from '@mui/material';
import { getLanguage, formatCurrency } from '../../i18n';
import { keyframes } from '@emotion/react';

// ─── Design Tokens ───────────────────────────────────────────────
const DARK_CARD = '#1e293b';
const DARK_TEXT = '#e2e8f0';
const DARK_HEAD = '#f8fafc';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT = "'Inter', 'Manrope', sans-serif";

// ─── Animations ──────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Hide number spinners ────────────────────────────────────────
const noSpinnerSx = {
    '& input[type=number]': { MozAppearance: 'textfield' },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
        WebkitAppearance: 'none', margin: 0,
    },
};

// ─── Helpers ─────────────────────────────────────────────────────
const loc = (ar, en) => (getLanguage() === 'en' ? en : ar);

// ─── Irrigation Options Data ─────────────────────────────────────
const IRRIGATION_OPTIONS = [
    {
        key: 'natural',
        icon: 'fa-cloud-rain',
        color: '#3b82f6',
        rate: '10%',
        labelAr: 'ري طبيعي (بالأمطار)',
        labelEn: 'Natural (Rain-fed)',
        descAr: 'بدون تكلفة ري',
        descEn: 'No irrigation cost',
    },
    {
        key: 'mixed',
        icon: 'fa-droplet',
        color: '#8b5cf6',
        rate: '7.5%',
        labelAr: 'ري مشترك',
        labelEn: 'Mixed (Rain + Machine)',
        descAr: 'جزئياً بالأمطار وجزئياً بالآلات',
        descEn: 'Part rain, part machine',
    },
    {
        key: 'irrigated',
        icon: 'fa-faucet-drip',
        color: '#f59e0b',
        rate: '5%',
        labelAr: 'ري صناعي (بالآلات)',
        labelEn: 'Artificial (Machines)',
        descAr: 'بتكلفة ري كاملة',
        descEn: 'Full irrigation cost',
    },
];

// ═════════════════════════════════════════════════════════════════
//  CropsCalculator
// ═════════════════════════════════════════════════════════════════

export default function CropsCalculator({
    cropWeight,
    onCropChange,
    irrigationMode,
    onIrrigationChange,
    cropsZakat,
    expanded,
    onToggle,
}) {
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';
    const font = ARABIC_FONT;
    const G_GREEN = theme.palette.primary.main;

    // ── Shared input styling ──
    const inputSx = {
        ...noSpinnerSx,
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px',
            fontFamily: LATIN_FONT,
            bgcolor: dk ? 'rgba(255,255,255,0.04)' : '#fafafa',
            '& fieldset': { borderColor: dk ? 'rgba(255,255,255,0.10)' : '#e0e0e0' },
            '&:hover fieldset': { borderColor: alpha(G_GREEN, 0.4) },
            '&.Mui-focused fieldset': { borderColor: G_GREEN },
        },
        '& .MuiInputLabel-root': { fontFamily: font },
    };

    return (
        <Box
            sx={{
                borderRadius: '20px',
                bgcolor: dk ? DARK_CARD : '#fff',
                border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#eef2f7'}`,
                boxShadow: dk ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                animation: `${fadeInUp} 0.35s ease both`,
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                '&:hover': {
                    boxShadow: dk ? '0 6px 28px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
                },
            }}
        >
            {/* ═══ HEADER (Clickable) ═══ */}
            <Box
                onClick={onToggle}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: { xs: 2, md: 3 },
                    py: { xs: 1.8, md: 2.2 },
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    userSelect: 'none',
                    '&:hover': {
                        bgcolor: dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)',
                    },
                }}
            >
                {/* Green circle icon */}
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        bgcolor: alpha(G_GREEN, dk ? 0.15 : 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'transform 0.25s ease',
                        '&:hover': { transform: 'scale(1.05)' },
                    }}
                >
                    <i
                        className="fa-solid fa-wheat-awn"
                        style={{ fontSize: '1rem', color: G_GREEN }}
                    />
                </Box>

                {/* Title */}
                <Typography
                    sx={{
                        fontFamily: font,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: dk ? DARK_HEAD : '#1a1a1a',
                        flex: 1,
                    }}
                >
                    {loc('الزروع والثمار', 'Agriculture & Crops')}
                </Typography>

                {/* Crops zakat badge */}
                {cropsZakat > 0 && (
                    <Box
                        sx={{
                            px: 1.5,
                            py: 0.35,
                            borderRadius: '20px',
                            bgcolor: alpha(G_GREEN, dk ? 0.15 : 0.1),
                            border: `1px solid ${alpha(G_GREEN, 0.25)}`,
                            flexShrink: 0,
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: LATIN_FONT,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                color: G_GREEN,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {cropsZakat.toFixed(1)} {loc('كجم', 'kg')}
                        </Typography>
                    </Box>
                )}

                {/* Chevron */}
                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: dk ? alpha(DARK_TEXT, 0.4) : '#bbb',
                        fontSize: '0.85rem',
                    }}
                >
                    <i className="fa-solid fa-chevron-down" />
                </Box>
            </Box>

            {/* ═══ COLLAPSIBLE BODY ═══ */}
            <Collapse in={expanded} timeout={350} easing="cubic-bezier(0.4,0,0.2,1)">
                <Box
                    sx={{
                        px: { xs: 2, md: 3 },
                        pb: { xs: 2.5, md: 3 },
                        pt: 0.5,
                    }}
                >
                    {/* Description */}
                    <Typography
                        sx={{
                            fontFamily: font,
                            fontSize: '0.8rem',
                            color: dk ? alpha(DARK_TEXT, 0.6) : '#888',
                            mb: 3,
                            lineHeight: 1.7,
                        }}
                    >
                        {loc(
                            'أدخل وزن المحصول واختر طريقة الري المناسبة لحساب زكاة الزروع.',
                            'Enter the harvest weight and select the irrigation method to calculate your crops Zakat.'
                        )}
                    </Typography>

                    {/* Weight Input */}
                    <TextField
                        placeholder={loc('وزن المحصول', 'Harvest weight')}
                        type="number"
                        fullWidth
                        value={cropWeight}
                        onChange={(e) => onCropChange(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Typography
                                        sx={{
                                            fontFamily: font,
                                            fontSize: '0.85rem',
                                            color: dk ? alpha(DARK_TEXT, 0.5) : '#999',
                                        }}
                                    >
                                        {loc('كجم', 'kg')}
                                    </Typography>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ ...inputSx, maxWidth: 500, mb: 3 }}
                    />

                    {/* ── Irrigation Method Section ── */}
                    <Typography
                        sx={{
                            fontFamily: font,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: dk ? alpha(DARK_TEXT, 0.7) : '#555',
                            mb: 1.5,
                        }}
                    >
                        {loc('طريقة الري', 'Irrigation Method')}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                        {IRRIGATION_OPTIONS.map((opt) => {
                            const selected = irrigationMode === opt.key;
                            return (
                                <Box
                                    key={opt.key}
                                    onClick={() => onIrrigationChange(opt.key)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        border: `1.5px solid ${
                                            selected
                                                ? opt.color
                                                : dk
                                                ? 'rgba(255,255,255,0.08)'
                                                : '#eef2f7'
                                        }`,
                                        bgcolor: selected
                                            ? alpha(opt.color, dk ? 0.1 : 0.05)
                                            : dk
                                            ? 'rgba(255,255,255,0.02)'
                                            : '#fafbfc',
                                        boxShadow: selected
                                            ? `0 2px 12px ${alpha(opt.color, 0.15)}`
                                            : 'none',
                                        transition: 'all 0.25s ease',
                                        userSelect: 'none',
                                        '&:hover': {
                                            borderColor: alpha(opt.color, 0.5),
                                            bgcolor: alpha(opt.color, dk ? 0.08 : 0.04),
                                            transform: 'translateY(-1px)',
                                            boxShadow: `0 3px 14px ${alpha(opt.color, 0.12)}`,
                                        },
                                    }}
                                >
                                    {/* Option Icon */}
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: '10px',
                                            bgcolor: alpha(opt.color, dk ? 0.15 : 0.1),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'transform 0.2s ease',
                                        }}
                                    >
                                        <i
                                            className={`fa-solid ${opt.icon}`}
                                            style={{ fontSize: '0.95rem', color: opt.color }}
                                        />
                                    </Box>

                                    {/* Option Text */}
                                    <Box sx={{ flex: 1, textAlign: 'right' }}>
                                        <Typography
                                            sx={{
                                                fontFamily: font,
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                color: selected
                                                    ? (dk ? DARK_HEAD : '#1a1a1a')
                                                    : (dk ? DARK_TEXT : '#555'),
                                                transition: 'color 0.2s ease',
                                            }}
                                        >
                                            {loc(opt.labelAr, opt.labelEn)}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontFamily: font,
                                                fontSize: '0.68rem',
                                                color: dk ? alpha(DARK_TEXT, 0.5) : '#999',
                                                mt: 0.2,
                                            }}
                                        >
                                            {loc(opt.descAr, opt.descEn)}
                                        </Typography>
                                    </Box>

                                    {/* Rate Badge */}
                                    <Box
                                        sx={{
                                            px: 1.2,
                                            py: 0.3,
                                            borderRadius: '8px',
                                            bgcolor: selected
                                                ? alpha(opt.color, dk ? 0.2 : 0.12)
                                                : dk
                                                ? 'rgba(255,255,255,0.04)'
                                                : '#f0f4f8',
                                            flexShrink: 0,
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontFamily: LATIN_FONT,
                                                fontWeight: 800,
                                                fontSize: '0.78rem',
                                                color: selected ? opt.color : (dk ? alpha(DARK_TEXT, 0.5) : '#aaa'),
                                                transition: 'color 0.2s ease',
                                            }}
                                        >
                                            {opt.rate}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* ── Result Preview ── */}
                    {parseFloat(cropWeight) > 0 && (
                        <Box
                            sx={{
                                mt: 2.5,
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: alpha(G_GREEN, dk ? 0.08 : 0.06),
                                border: `1px solid ${alpha(G_GREEN, dk ? 0.2 : 0.15)}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                animation: `${fadeInUp} 0.25s ease both`,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <i
                                    className="fa-solid fa-wheat-awn"
                                    style={{ fontSize: '0.75rem', color: G_GREEN }}
                                />
                                <Typography
                                    sx={{
                                        fontFamily: font,
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        color: dk ? DARK_HEAD : '#333',
                                    }}
                                >
                                    {loc('زكاة الزروع:', 'Crops Zakat:')}
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    fontFamily: LATIN_FONT,
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    color: G_GREEN,
                                }}
                            >
                                {cropsZakat.toFixed(1)} {loc('كجم', 'kg')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
}
