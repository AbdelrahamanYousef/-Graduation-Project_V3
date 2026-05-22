/* ───────────────────────────────────────────────────────────
   GoldSilverCalculator.jsx — Gold & Silver Zakat Calculator
   Premium collapsible card with dynamic gold entries +
   karat selector and a silver sub-section.
   ─────────────────────────────────────────────────────────── */
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Button,
  Collapse,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { getLanguage, formatCurrency, formatNumber } from '../../i18n';
import { keyframes } from '@emotion/react';

/* ── constants ─────────────────────────────────────────── */
const DARK_BG     = '#0f172a';
const DARK_CARD   = '#1e293b';
const DARK_TEXT   = '#e2e8f0';
const DARK_HEAD   = '#f8fafc';
const GOLD_CLR    = '#f59e0b';
const SILVER_CLR  = '#94a3b8';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT  = "'Inter', 'Manrope', sans-serif";

/* ── helpers ───────────────────────────────────────────── */
const loc = (ar, en) => (getLanguage() === 'en' ? en : ar);
const num = (v) => parseFloat(v) || 0;
const isEn = () => getLanguage() === 'en';

/* ── spinner hider ─────────────────────────────────────── */
const noSpinnerSx = {
  '& input[type=number]': { MozAppearance: 'textfield' },
  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
};

/* ── animations ────────────────────────────────────────── */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.06); }
`;

/* ── price lookup by karat key ─────────────────────────── */
const karatPriceKey = { '24': 'gold24k', '21': 'gold21k', '18': 'gold18k' };

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
const GoldSilverCalculator = ({
  goldEntries,
  onGoldChange,
  onAddGold,
  onRemoveGold,
  silverGrams,
  onSilverChange,
  prices,
  goldZakat,
  silverZakat,
  expanded,
  onToggle,
}) => {
  const theme = useTheme();
  const dk = theme.palette.mode === 'dark';
  const totalZakat = (goldZakat || 0) + (silverZakat || 0);
  const G_GREEN = theme.palette.primary.main;
  const G_GREEN_DK = theme.palette.primary.dark;
  const TEAL = theme.palette.primary.main;
  const TEAL_MID = theme.palette.primary.dark;

  /* ── shared card style ─────────────────────────────────── */
  const cardSx = {
    direction: 'rtl',
    fontFamily: ARABIC_FONT,
    borderRadius: '20px',
    background: dk
      ? `linear-gradient(145deg, ${DARK_CARD}, ${alpha(DARK_BG, 0.85)})`
      : '#fff',
    boxShadow: dk
      ? `0 8px 32px ${alpha('#000', 0.35)}`
      : `0 4px 24px ${alpha('#94a3b8', 0.13)}`,
    border: `1px solid ${dk ? alpha('#fff', 0.06) : alpha('#e2e8f0', 0.7)}`,
    overflow: 'hidden',
    animation: `${fadeInUp} .45s ease-out`,
    transition: 'box-shadow .3s, border-color .3s',
    '&:hover': {
      boxShadow: dk
        ? `0 12px 40px ${alpha('#000', 0.45)}`
        : `0 8px 32px ${alpha('#94a3b8', 0.2)}`,
    },
  };

  /* ── header ─────────────────────────────────────────────── */
  const renderHeader = () => (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 2, sm: 2.5 },
        py: 2,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background .2s',
        '&:hover': { background: dk ? alpha('#fff', 0.03) : alpha(GOLD_CLR, 0.04) },
      }}
    >
      {/* amber icon circle */}
      <Box
        sx={{
          width: 44,
          height: 44,
          minWidth: 44,
          borderRadius: '50%',
          background: dk
            ? alpha(GOLD_CLR, 0.15)
            : alpha(GOLD_CLR, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform .25s',
          '&:hover': { transform: 'scale(1.08)' },
        }}
      >
        <i className="fas fa-coins" style={{ fontSize: 20, color: GOLD_CLR }} />
      </Box>

      {/* title */}
      <Typography
        sx={{
          flex: 1,
          fontFamily: ARABIC_FONT,
          fontWeight: 700,
          fontSize: { xs: '1.05rem', sm: '1.15rem' },
          color: dk ? DARK_HEAD : '#1e293b',
        }}
      >
        {loc('الذهب والفضة', 'Gold & Silver')}
      </Typography>

      {/* zakat badge */}
      {totalZakat > 0 && (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: '10px',
            fontFamily: LATIN_FONT,
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#fff',
            background: `linear-gradient(135deg, ${G_GREEN}, ${G_GREEN_DK})`,
            animation: `${pulse} 2s ease-in-out infinite`,
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(totalZakat)}
        </Box>
      )}

      {/* chevron */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform .3s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          color: dk ? DARK_TEXT : '#64748b',
          fontSize: 18,
        }}
      >
        <i className="fas fa-chevron-down" />
      </Box>
    </Box>
  );

  /* ── sub-section header helper ──────────────────────────── */
  const SubHeader = ({ icon, iconColor, label }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            minWidth: 34,
            borderRadius: '50%',
            background: alpha(iconColor, dk ? 0.15 : 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className={icon} style={{ fontSize: 15, color: iconColor }} />
        </Box>
        <Typography
          sx={{
            fontFamily: ARABIC_FONT,
            fontWeight: 700,
            fontSize: '1rem',
            color: dk ? DARK_HEAD : '#334155',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: dk ? alpha('#fff', 0.06) : alpha('#e2e8f0', 0.8) }} />
    </Box>
  );

  /* ── inline calc box ────────────────────────────────────── */
  const InlineCalc = ({ grams, pricePerGram }) => {
    const g = num(grams);
    if (g <= 0) return null;
    const total = g * pricePerGram;
    return (
      <Box
        sx={{
          mt: 1.2,
          px: 1.5,
          py: 0.9,
          borderRadius: '10px',
          background: dk ? alpha('#fff', 0.04) : alpha(GOLD_CLR, 0.05),
          border: `1px solid ${dk ? alpha('#fff', 0.06) : alpha(GOLD_CLR, 0.12)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          flexWrap: 'wrap',
          direction: 'ltr',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: LATIN_FONT,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: dk ? alpha(DARK_TEXT, 0.7) : '#64748b',
          }}
        >
          {formatNumber(g)}g × {formatCurrency(pricePerGram)}
        </Typography>
        <Typography
          sx={{
            fontFamily: LATIN_FONT,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: dk ? alpha(DARK_TEXT, 0.7) : '#64748b',
            mx: 0.4,
          }}
        >
          =
        </Typography>
        <Typography
          sx={{
            fontFamily: LATIN_FONT,
            fontSize: '0.85rem',
            fontWeight: 700,
            color: dk ? GOLD_CLR : '#b45309',
          }}
        >
          {formatCurrency(total)}{' '}
          <span style={{ fontFamily: ARABIC_FONT, fontWeight: 600, fontSize: '0.78rem' }}>
            {loc('ج.م', 'EGP')}
          </span>
        </Typography>
      </Box>
    );
  };

  /* ── single gold entry card ─────────────────────────────── */
  const GoldEntryCard = ({ entry, idx }) => {
    const pricePerGram = prices?.[karatPriceKey[entry.karat]] || 0;
    return (
      <Box
        key={entry.id}
        sx={{
          mb: 2,
          p: { xs: 1.5, sm: 2 },
          borderRadius: '14px',
          background: dk ? alpha('#fff', 0.04) : alpha('#f8fafc', 0.85),
          border: `1px solid ${dk ? alpha('#fff', 0.06) : alpha('#e2e8f0', 0.75)}`,
          transition: 'border-color .25s, box-shadow .25s',
          '&:hover': {
            borderColor: dk ? alpha(GOLD_CLR, 0.25) : alpha(GOLD_CLR, 0.35),
            boxShadow: `0 2px 12px ${alpha(GOLD_CLR, dk ? 0.08 : 0.06)}`,
          },
        }}
      >
        {/* entry header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            sx={{
              fontFamily: ARABIC_FONT,
              fontWeight: 700,
              fontSize: '0.9rem',
              color: dk ? DARK_HEAD : '#334155',
            }}
          >
            {loc(`ذهب ${idx + 1}`, `Gold ${idx + 1}`)}
          </Typography>

          {goldEntries.length > 1 && (
            <IconButton
              size="small"
              onClick={() => onRemoveGold(entry.id)}
              sx={{
                color: '#ef4444',
                transition: 'transform .2s, background .2s',
                '&:hover': { background: alpha('#ef4444', 0.1), transform: 'scale(1.12)' },
              }}
            >
              <i className="fas fa-trash-alt" style={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>

        {/* input row */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
          }}
        >
          {/* weight input */}
          <TextField
            type="number"
            placeholder={loc('الوزن بالجرام', 'Weight in grams')}
            value={entry.grams}
            onChange={(e) => onGoldChange(entry.id, 'grams', e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography
                    sx={{
                      fontFamily: LATIN_FONT,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: dk ? alpha(DARK_TEXT, 0.5) : '#94a3b8',
                    }}
                  >
                    {loc('جرام', 'g')}
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              ...noSpinnerSx,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontFamily: LATIN_FONT,
                fontSize: '0.95rem',
                background: dk ? alpha('#000', 0.2) : '#fff',
                '& fieldset': {
                  borderColor: dk ? alpha('#fff', 0.1) : '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: dk ? alpha(GOLD_CLR, 0.4) : alpha(GOLD_CLR, 0.5),
                },
                '&.Mui-focused fieldset': {
                  borderColor: GOLD_CLR,
                  borderWidth: 2,
                },
              },
              '& input': {
                color: dk ? DARK_TEXT : '#1e293b',
                fontFamily: LATIN_FONT,
              },
            }}
          />

          {/* karat toggle */}
          <ToggleButtonGroup
            value={entry.karat}
            exclusive
            onChange={(_, val) => {
              if (val !== null) onGoldChange(entry.id, 'karat', val);
            }}
            size="small"
            sx={{
              minWidth: 'fit-content',
              '& .MuiToggleButtonGroup-grouped': {
                border: `1px solid ${dk ? alpha('#fff', 0.1) : '#e2e8f0'} !important`,
                borderRadius: '10px !important',
                mx: 0.3,
                fontFamily: LATIN_FONT,
                fontWeight: 700,
                fontSize: '0.8rem',
                px: { xs: 1.4, sm: 1.8 },
                py: 0.7,
                color: dk ? alpha(DARK_TEXT, 0.6) : '#64748b',
                textTransform: 'none',
                transition: 'all .2s',
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, ${GOLD_CLR}, #d97706)`,
                  color: '#fff',
                  borderColor: `${GOLD_CLR} !important`,
                  boxShadow: `0 2px 8px ${alpha(GOLD_CLR, 0.3)}`,
                },
                '&:hover': {
                  background: dk ? alpha(GOLD_CLR, 0.1) : alpha(GOLD_CLR, 0.08),
                },
              },
            }}
          >
            <ToggleButton value="24">24K</ToggleButton>
            <ToggleButton value="21">21K</ToggleButton>
            <ToggleButton value="18">18K</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* inline calculation */}
        <InlineCalc grams={entry.grams} pricePerGram={pricePerGram} />
      </Box>
    );
  };

  /* ── add gold button ────────────────────────────────────── */
  const renderAddGoldBtn = () => (
    <Button
      onClick={onAddGold}
      fullWidth
      sx={{
        mt: 0.5,
        py: 1.2,
        borderRadius: '12px',
        border: `2px dashed ${dk ? alpha(GOLD_CLR, 0.35) : alpha(GOLD_CLR, 0.45)}`,
        background: 'transparent',
        color: dk ? GOLD_CLR : '#b45309',
        fontFamily: ARABIC_FONT,
        fontWeight: 700,
        fontSize: '0.9rem',
        textTransform: 'none',
        transition: 'all .25s',
        '&:hover': {
          background: dk ? alpha(GOLD_CLR, 0.08) : alpha(GOLD_CLR, 0.06),
          borderColor: GOLD_CLR,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <i className="fas fa-plus" style={{ marginLeft: isEn() ? 0 : 8, marginRight: isEn() ? 8 : 0, fontSize: 13 }} />
      {loc('إضافة ذهب آخر', 'Add Gold Entry')}
    </Button>
  );

  /* ── silver section ─────────────────────────────────────── */
  const renderSilver = () => {
    const silverPrice = prices?.silver || 0;
    return (
      <Box sx={{ mt: 3 }}>
        <SubHeader icon="fas fa-medal" iconColor={SILVER_CLR} label={loc('الفضة', 'Silver')} />
        <TextField
          type="number"
          placeholder={loc('الوزن بالجرام', 'Weight in grams')}
          value={silverGrams}
          onChange={(e) => onSilverChange(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography
                  sx={{
                    fontFamily: LATIN_FONT,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: dk ? alpha(DARK_TEXT, 0.5) : '#94a3b8',
                  }}
                >
                  {loc('جرام', 'g')}
                </Typography>
              </InputAdornment>
            ),
          }}
          sx={{
            ...noSpinnerSx,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontFamily: LATIN_FONT,
              fontSize: '0.95rem',
              background: dk ? alpha('#000', 0.2) : '#fff',
              '& fieldset': {
                borderColor: dk ? alpha('#fff', 0.1) : '#e2e8f0',
              },
              '&:hover fieldset': {
                borderColor: dk ? alpha(SILVER_CLR, 0.5) : alpha(SILVER_CLR, 0.6),
              },
              '&.Mui-focused fieldset': {
                borderColor: SILVER_CLR,
                borderWidth: 2,
              },
            },
            '& input': {
              color: dk ? DARK_TEXT : '#1e293b',
              fontFamily: LATIN_FONT,
            },
          }}
        />

        {/* silver inline calc */}
        {num(silverGrams) > 0 && (
          <Box
            sx={{
              mt: 1.2,
              px: 1.5,
              py: 0.9,
              borderRadius: '10px',
              background: dk ? alpha('#fff', 0.04) : alpha(SILVER_CLR, 0.06),
              border: `1px solid ${dk ? alpha('#fff', 0.06) : alpha(SILVER_CLR, 0.15)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              flexWrap: 'wrap',
              direction: 'ltr',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: LATIN_FONT,
                fontSize: '0.82rem',
                fontWeight: 600,
                color: dk ? alpha(DARK_TEXT, 0.7) : '#64748b',
              }}
            >
              {formatNumber(num(silverGrams))}g × {formatCurrency(silverPrice)}
            </Typography>
            <Typography
              sx={{
                fontFamily: LATIN_FONT,
                fontSize: '0.82rem',
                fontWeight: 600,
                color: dk ? alpha(DARK_TEXT, 0.7) : '#64748b',
                mx: 0.4,
              }}
            >
              =
            </Typography>
            <Typography
              sx={{
                fontFamily: LATIN_FONT,
                fontSize: '0.85rem',
                fontWeight: 700,
                color: dk ? SILVER_CLR : '#475569',
              }}
            >
              {formatCurrency(num(silverGrams) * silverPrice)}{' '}
              <span style={{ fontFamily: ARABIC_FONT, fontWeight: 600, fontSize: '0.78rem' }}>
                {loc('ج.م', 'EGP')}
              </span>
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  /* ── live-prices footer ─────────────────────────────────── */
  const renderPricesFooter = () => {
    const items = [
      { label: loc('ذهب 24', 'Gold 24K'), value: prices?.gold24k, color: GOLD_CLR },
      { label: loc('ذهب 21', 'Gold 21K'), value: prices?.gold21k, color: GOLD_CLR },
      { label: loc('ذهب 18', 'Gold 18K'), value: prices?.gold18k, color: GOLD_CLR },
      { label: loc('فضة', 'Silver'), value: prices?.silver, color: SILVER_CLR },
    ];

    return (
      <Box
        sx={{
          mt: 3,
          p: { xs: 1.4, sm: 1.8 },
          borderRadius: '12px',
          background: dk ? alpha('#000', 0.25) : alpha('#f1f5f9', 0.7),
          border: `1px solid ${dk ? alpha('#fff', 0.06) : alpha('#e2e8f0', 0.8)}`,
        }}
      >
        {/* footer title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
          <i
            className="fas fa-chart-line"
            style={{ fontSize: 12, color: dk ? alpha(DARK_TEXT, 0.45) : '#94a3b8' }}
          />
          <Typography
            sx={{
              fontFamily: ARABIC_FONT,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: dk ? alpha(DARK_TEXT, 0.5) : '#94a3b8',
            }}
          >
            {loc('الأسعار الحالية', 'Current Prices')}
          </Typography>
        </Box>

        {/* 2-column grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
            gap: 1,
          }}
        >
          {items.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.2,
                py: 0.7,
                borderRadius: '8px',
                background: dk ? alpha('#fff', 0.03) : alpha('#fff', 0.7),
                border: `1px solid ${dk ? alpha('#fff', 0.04) : alpha('#e2e8f0', 0.5)}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: ARABIC_FONT,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: dk ? alpha(DARK_TEXT, 0.6) : '#64748b',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: LATIN_FONT,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: item.color,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCurrency(item.value || 0)}
                <span
                  style={{
                    fontFamily: ARABIC_FONT,
                    fontWeight: 500,
                    fontSize: '0.65rem',
                    opacity: 0.7,
                    marginRight: isEn() ? 0 : 3,
                    marginLeft: isEn() ? 3 : 0,
                  }}
                >
                  {loc('/ جرام', '/ g')}
                </span>
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  /* ── render ─────────────────────────────────────────────── */
  return (
    <Box sx={cardSx}>
      {renderHeader()}

      <Collapse in={expanded} timeout={350} unmountOnExit>
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
          {/* ─── GOLD ─── */}
          <SubHeader icon="fas fa-coins" iconColor={GOLD_CLR} label={loc('الذهب', 'Gold')} />

          {(goldEntries || []).map((entry, idx) => (
            <GoldEntryCard key={entry.id} entry={entry} idx={idx} />
          ))}

          {renderAddGoldBtn()}

          {/* ─── SILVER ─── */}
          {renderSilver()}

          {/* ─── LIVE PRICES ─── */}
          {renderPricesFooter()}
        </Box>
      </Collapse>
    </Box>
  );
};

export default GoldSilverCalculator;
