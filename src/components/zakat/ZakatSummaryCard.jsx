import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Divider,
  IconButton,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getLanguage, formatCurrency, formatNumber } from '../../i18n';
import { keyframes } from '@emotion/react';

/* ────────────────────────────── constants ────────────────────────────── */
const DARK_BG     = '#0f172a';
const DARK_CARD   = '#1e293b';
const DARK_TEXT   = '#e2e8f0';
const DARK_HEAD   = '#f8fafc';
const AMBER       = '#f59e0b';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT  = "'Inter', 'Manrope', sans-serif";

/* ────────────────────────────── animations ───────────────────────────── */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
`;

/* ────────────────────────────── helper ───────────────────────────────── */
const loc = (ar, en) => (getLanguage() === 'en' ? en : ar);

/* ────────────────────────────── sub-components ───────────────────────── */

/** Single info / breakdown row */
const InfoRow = ({ label, value, icon, iconColor, dk }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    sx={{ py: 0.8, px: 0.5 }}
  >
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon && (
        <Box
          component="i"
          className={`fa-solid ${icon}`}
          sx={{
            fontSize: '0.85rem',
            color: iconColor || (dk ? DARK_TEXT : '#64748b'),
            width: 22,
            textAlign: 'center',
          }}
        />
      )}
      <Typography
        sx={{
          fontFamily: ARABIC_FONT,
          fontSize: '0.84rem',
          color: dk ? alpha(DARK_TEXT, 0.8) : '#475569',
        }}
      >
        {label}
      </Typography>
    </Stack>

    <Typography
      sx={{
        fontFamily: LATIN_FONT,
        fontSize: '0.84rem',
        fontWeight: 700,
        color: dk ? DARK_HEAD : '#1e293b',
      }}
    >
      {value}
    </Typography>
  </Stack>
);

/** Price cell inside the mini-ticker grid */
const PriceCell = ({ label, value, dk }) => (
  <Box
    sx={{
      py: 0.7,
      px: 1,
      borderRadius: '10px',
      bgcolor: dk ? alpha('#fff', 0.04) : alpha('#f8fafc', 0.8),
      border: `1px solid ${dk ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`,
    }}
  >
    <Typography
      sx={{
        fontFamily: ARABIC_FONT,
        fontSize: '0.68rem',
        color: dk ? alpha(DARK_TEXT, 0.55) : '#94a3b8',
        mb: 0.15,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontFamily: LATIN_FONT,
        fontSize: '0.76rem',
        fontWeight: 700,
        color: dk ? DARK_HEAD : '#1e293b',
        lineHeight: 1.3,
      }}
    >
      {value}
      <Box
        component="span"
        sx={{ fontSize: '0.62rem', fontWeight: 500, color: dk ? alpha(DARK_TEXT, 0.45) : '#94a3b8', mr: 0.3 }}
      >
        {' /'}
        {loc('جرام', 'g')}
      </Box>
    </Typography>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════════ */
/*  ZakatSummaryCard                                                     */
/* ═══════════════════════════════════════════════════════════════════════ */
const ZakatSummaryCard = ({
  zakatDue = {},
  nisab = 0,
  prices = null,
  isLive = false,
  lastUpdated = null,
  source = 'fallback',
  onRefresh = () => {},
  showInfoModal = () => {},
}) => {
  const theme = useTheme();
  const dk = theme.palette.mode === 'dark';
  const G_GREEN = theme.palette.primary.main;
  const G_GREEN_DK = theme.palette.primary.dark;
  const TEAL = theme.palette.primary.main;
  const TEAL_MID = theme.palette.primary.dark;

  /* ── destructure with safe defaults ── */
  const {
    cash = 0,
    gold = 0,
    silver = 0,
    totalCurrency = 0,
    zakatableWealth = 0,
    cropsWeightDue = 0,
  } = zakatDue;

  /* ── nisab progress ── */
  const nisabPercent = nisab > 0 ? Math.min((zakatableWealth / nisab) * 100, 100) : 0;
  const nisabReached = nisabPercent >= 100;

  /* ── source label ── */
  const sourceLabel =
    source === 'api'
      ? loc('أسعار حية', 'Live prices')
      : source === 'admin'
      ? loc('أسعار معتمدة', 'Admin prices')
      : loc('أسعار تقديرية', 'Estimated prices');

  const dotColor = source === 'fallback' ? AMBER : G_GREEN;

  /* ── time ago helper ── */
  const timeAgo = (() => {
    if (!lastUpdated) return null;
    const diff = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
    if (diff < 60) return loc('الآن', 'Just now');
    if (diff < 3600) {
      const m = Math.floor(diff / 60);
      return loc(`منذ ${m} دقيقة`, `${m}m ago`);
    }
    const h = Math.floor(diff / 3600);
    return loc(`منذ ${h} ساعة`, `${h}h ago`);
  })();

  const hasCTA = totalCurrency > 0 || cropsWeightDue > 0;

  /* ════════════════════════════════════ RENDER ═══════════════════════════ */
  return (
    <Box
      sx={{
        direction: 'rtl',
        borderRadius: '20px',
        overflow: 'hidden',
        border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#eef2f7'}`,
        boxShadow: dk
          ? '0 4px 24px rgba(0,0,0,0.35)'
          : '0 4px 24px rgba(0,0,0,0.07)',
        bgcolor: dk ? DARK_CARD : '#fff',
        animation: `${fadeInUp} 0.5s ease 0.15s both`,
      }}
    >
      {/* ───────────────────── TEAL GRADIENT HEADER ─────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_MID} 100%)`,
          px: 2.5,
          py: 2.2,
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                fontFamily: ARABIC_FONT,
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.5,
              }}
            >
              {loc('إجمالي الزكاة المستحقة', 'Total Zakat Due')}
            </Typography>
            <Typography
              sx={{
                fontFamily: ARABIC_FONT,
                fontSize: '0.72rem',
                color: alpha('#fff', 0.5),
                mt: 0.2,
              }}
            >
              {loc('يتم حسابها تلقائياً', 'Calculated automatically')}
            </Typography>
          </Box>

          <IconButton
            onClick={showInfoModal}
            size="small"
            sx={{
              color: alpha('#fff', 0.7),
              '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.12) },
              transition: 'all 0.25s ease',
            }}
          >
            <Box component="i" className="fa-solid fa-circle-info" sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Stack>

        {/* ── main total ── */}
        <Box sx={{ mt: 1.8, mb: 0.5 }}>
          <Typography
            sx={{
              fontFamily: LATIN_FONT,
              fontSize: '2.2rem',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }}
          >
            {formatNumber(Math.round(totalCurrency))}
          </Typography>
          <Typography
            sx={{
              fontFamily: ARABIC_FONT,
              fontSize: '0.75rem',
              color: alpha('#fff', 0.55),
              mt: 0.3,
            }}
          >
            {loc('جنيه مصري', 'Egyptian Pounds')}
          </Typography>
        </Box>
      </Box>

      {/* ─────────────────── BODY CONTENT ───────────────────────────────── */}
      <Box sx={{ px: 2.5, py: 2 }}>
        {/* ── Nisab Progress ── */}
        {zakatableWealth > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: ARABIC_FONT,
                fontSize: '0.74rem',
                fontWeight: 600,
                color: dk ? alpha(DARK_TEXT, 0.65) : '#64748b',
                mb: 0.8,
              }}
            >
              {loc('مستوى النصاب', 'Nisab Level')}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={nisabPercent}
              sx={{
                height: 8,
                borderRadius: '4px',
                bgcolor: dk ? alpha('#fff', 0.06) : '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '4px',
                  bgcolor: nisabReached ? G_GREEN : AMBER,
                  transition: 'transform 0.6s cubic-bezier(.4,0,.2,1)',
                },
              }}
            />

            <Typography
              sx={{
                fontFamily: ARABIC_FONT,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: nisabReached ? G_GREEN : AMBER,
                mt: 0.7,
                lineHeight: 1.5,
              }}
            >
              {`${Math.round(nisabPercent)}% — `}
              {nisabReached
                ? loc('بلغت أموالك النصاب — الزكاة واجبة', 'Your wealth has reached Nisab — Zakat is due')
                : loc('أموالك لم تبلغ حد النصاب', 'Your assets are below Nisab')}
            </Typography>
          </Box>
        )}

        {/* ── Below-Nisab Warning ── */}
        {zakatableWealth > 0 && !nisabReached && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.6,
              py: 1.2,
              mb: 2,
              borderRadius: '12px',
              bgcolor: alpha(AMBER, dk ? 0.12 : 0.08),
              border: `1px solid ${alpha(AMBER, dk ? 0.2 : 0.18)}`,
            }}
          >
            <Box
              component="i"
              className="fa-solid fa-triangle-exclamation"
              sx={{ fontSize: '0.9rem', color: AMBER, flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontFamily: ARABIC_FONT,
                fontSize: '0.76rem',
                fontWeight: 600,
                color: dk ? '#fbbf24' : '#92400e',
                lineHeight: 1.6,
              }}
            >
              {loc(
                'أموالك لم تبلغ حد النصاب. لا تجب فيها الزكاة.',
                'Your assets are below the Nisab. No Zakat is due.',
              )}
            </Typography>
          </Box>
        )}

        {/* ── Info Rows ── */}
        <Divider sx={{ borderColor: dk ? 'rgba(255,255,255,0.06)' : '#f1f5f9', mb: 0.5 }} />

        <InfoRow
          label={loc('النصاب الحالي', 'Current Nisab')}
          value={formatCurrency(nisab)}
          dk={dk}
        />
        <InfoRow
          label={loc('إجمالي أموالك', 'Your Wealth')}
          value={formatCurrency(zakatableWealth)}
          dk={dk}
        />

        {/* ── Breakdown Section ── */}
        {totalCurrency > 0 && (
          <>
            <Divider sx={{ borderColor: dk ? 'rgba(255,255,255,0.06)' : '#f1f5f9', my: 1 }} />

            <Typography
              sx={{
                fontFamily: LATIN_FONT,
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: dk ? alpha(DARK_TEXT, 0.4) : '#94a3b8',
                mb: 0.5,
                mt: 0.3,
              }}
            >
              {loc('التفاصيل', 'BREAKDOWN')}
            </Typography>

            {cash > 0 && (
              <InfoRow
                label={loc('زكاة النقود', 'Cash')}
                value={formatCurrency(cash)}
                icon="fa-money-bill-wave"
                iconColor={G_GREEN}
                dk={dk}
              />
            )}
            {gold > 0 && (
              <InfoRow
                label={loc('زكاة الذهب', 'Gold')}
                value={formatCurrency(gold)}
                icon="fa-coins"
                iconColor="#f59e0b"
                dk={dk}
              />
            )}
            {silver > 0 && (
              <InfoRow
                label={loc('زكاة الفضة', 'Silver')}
                value={formatCurrency(silver)}
                icon="fa-medal"
                iconColor="#94a3b8"
                dk={dk}
              />
            )}
          </>
        )}

        {/* ── Crops Zakat ── */}
        {cropsWeightDue > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.6,
              py: 1.2,
              mt: 1.5,
              borderRadius: '12px',
              bgcolor: alpha(G_GREEN, dk ? 0.1 : 0.06),
              border: `1px solid ${alpha(G_GREEN, dk ? 0.18 : 0.14)}`,
            }}
          >
            <Box
              component="i"
              className="fa-solid fa-wheat-awn"
              sx={{ fontSize: '0.9rem', color: G_GREEN, flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontFamily: ARABIC_FONT,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: dk ? '#6ee7b7' : TEAL,
                lineHeight: 1.5,
              }}
            >
              {loc('زكاة الزروع:', 'Crops Zakat:')}{' '}
              <Box
                component="span"
                sx={{ fontFamily: LATIN_FONT, fontWeight: 800 }}
              >
                {cropsWeightDue.toFixed(1)}
              </Box>{' '}
              {loc('كجم', 'kg')}
            </Typography>
          </Box>
        )}

        {/* ── Live Prices Mini-Ticker ── */}
        {prices && (
          <>
            <Divider sx={{ borderColor: dk ? 'rgba(255,255,255,0.06)' : '#f1f5f9', my: 1.5 }} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0.8,
                mb: 1.2,
              }}
            >
              <PriceCell
                label={loc('ذهب 24', 'Gold 24K')}
                value={formatCurrency(prices.gold24k)}
                dk={dk}
              />
              <PriceCell
                label={loc('ذهب 21', 'Gold 21K')}
                value={formatCurrency(prices.gold21k)}
                dk={dk}
              />
              <PriceCell
                label={loc('ذهب 18', 'Gold 18K')}
                value={formatCurrency(prices.gold18k)}
                dk={dk}
              />
              <PriceCell
                label={loc('فضة', 'Silver')}
                value={formatCurrency(prices.silver)}
                dk={dk}
              />
            </Box>

            {/* source badge row */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.8}
              sx={{ flexWrap: 'wrap' }}
            >
              {/* pulsing dot */}
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: dotColor,
                  animation: `${pulse} 2s ease-in-out infinite`,
                  flexShrink: 0,
                }}
              />

              <Typography
                sx={{
                  fontFamily: ARABIC_FONT,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: dk ? alpha(DARK_TEXT, 0.6) : '#64748b',
                }}
              >
                {sourceLabel}
              </Typography>

              {timeAgo && (
                <Typography
                  sx={{
                    fontFamily: LATIN_FONT,
                    fontSize: '0.63rem',
                    color: dk ? alpha(DARK_TEXT, 0.38) : '#94a3b8',
                    mr: 'auto',
                  }}
                >
                  · {timeAgo}
                </Typography>
              )}

              <IconButton
                onClick={onRefresh}
                size="small"
                sx={{
                  p: 0.5,
                  color: dk ? alpha(DARK_TEXT, 0.5) : '#94a3b8',
                  '&:hover': { color: G_GREEN, bgcolor: alpha(G_GREEN, 0.08) },
                  transition: 'all 0.25s ease',
                }}
              >
                <Box
                  component="i"
                  className="fa-solid fa-rotate-right"
                  sx={{ fontSize: '0.72rem' }}
                />
              </IconButton>
            </Stack>
          </>
        )}

        {/* ── CTA Button ── */}
        <Box sx={{ mt: 2.2 }}>
          <Button
            component={Link}
            to={`/donate?amount=${Math.round(totalCurrency)}`}
            disabled={!hasCTA}
            fullWidth
            sx={{
              fontFamily: ARABIC_FONT,
              fontSize: '0.95rem',
              fontWeight: 700,
              py: 1.4,
              borderRadius: '14px',
              color: '#fff',
              textTransform: 'none',
              background: hasCTA
                ? `linear-gradient(135deg, ${G_GREEN} 0%, ${G_GREEN_DK} 100%)`
                : undefined,
              bgcolor: !hasCTA ? (dk ? alpha('#fff', 0.06) : '#e2e8f0') : undefined,
              boxShadow: hasCTA ? `0 6px 24px ${alpha(G_GREEN, 0.35)}` : 'none',
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
              '&:hover': hasCTA
                ? {
                    background: `linear-gradient(135deg, ${G_GREEN_DK} 0%, ${TEAL} 100%)`,
                    boxShadow: `0 8px 30px ${alpha(G_GREEN, 0.45)}`,
                    transform: 'translateY(-1px)',
                  }
                : {},
              '&:active': hasCTA
                ? { transform: 'translateY(0)' }
                : {},
              '&.Mui-disabled': {
                color: dk ? alpha(DARK_TEXT, 0.3) : '#94a3b8',
                bgcolor: dk ? alpha('#fff', 0.06) : '#e2e8f0',
              },
            }}
          >
            {loc('أخرج زكاتك الآن', 'Pay Zakat Now')}
            <Box
              component="i"
              className="fa-solid fa-heart"
              sx={{ fontSize: '0.82rem', ml: 1 }}
            />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ZakatSummaryCard;
