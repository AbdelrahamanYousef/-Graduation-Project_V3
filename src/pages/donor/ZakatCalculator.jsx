import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    InputAdornment,
    Divider,
    Paper,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import { t, formatCurrency, getLanguage } from '../../i18n';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const GOLD_PRICE_PER_GRAM = 3800; // EGP approximate
const SILVER_PRICE_PER_GRAM = 45;
const ZAKAT_RATE = 0.025;

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
    color: theme.palette.common.white,
    padding: theme.spacing(12, 0),
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
}));

const CalculatorSection = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
    boxShadow: theme.shadows[3],
}));

const ResultCard = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(4),
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    border: `1px solid ${theme.palette.divider}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const ResultAmount = styled(Typography)(({ theme, active }) => ({
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: active ? theme.palette.primary.main : theme.palette.text.disabled,
    margin: theme.spacing(2, 0),
}));

function ZakatCalculator() {
    const theme = useTheme();
    const [values, setValues] = useState({
        gold: '',
        silver: '',
        cash: '',
        investments: '',
        debtsOwed: '',
        liabilities: '',
    });

    const handleChange = (field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    const num = (v) => parseFloat(v) || 0;

    const goldValue = num(values.gold) * GOLD_PRICE_PER_GRAM;
    const silverValue = num(values.silver) * SILVER_PRICE_PER_GRAM;
    const totalAssets = goldValue + silverValue + num(values.cash) + num(values.investments) + num(values.debtsOwed);
    const totalDeductions = num(values.liabilities);
    const zakatableAmount = Math.max(0, totalAssets - totalDeductions);
    const nisabGold = 85 * GOLD_PRICE_PER_GRAM;
    const zakatDue = zakatableAmount >= nisabGold ? zakatableAmount * ZAKAT_RATE : 0;

    const resetCalc = () => {
        setValues({ gold: '', silver: '', cash: '', investments: '', debtsOwed: '', liabilities: '' });
    };

    const isEn = getLanguage() === 'en';
    const gramLabel = isEn ? 'gram' : 'جرام';
    const currencyLabel = isEn ? 'EGP' : 'ج.م';

    const fields = [
        { key: 'gold', label: t('zakat.gold'), icon: 'fa-solid fa-coins', suffix: `(${formatCurrency(GOLD_PRICE_PER_GRAM)}/${gramLabel})` },
        { key: 'silver', label: t('zakat.silver'), icon: 'fa-solid fa-medal', suffix: `(${formatCurrency(SILVER_PRICE_PER_GRAM)}/${gramLabel})` },
        { key: 'cash', label: t('zakat.cash'), icon: 'fa-solid fa-money-bill-wave' },
        { key: 'investments', label: t('zakat.investments'), icon: 'fa-solid fa-chart-line' },
        { key: 'debtsOwed', label: t('zakat.debts'), icon: 'fa-solid fa-clipboard-list' },
        { key: 'liabilities', label: t('zakat.liabilities'), icon: 'fa-solid fa-file-invoice-dollar', isDeduction: true },
    ];

    return (
        <Box sx={{ pb: 12 }}>
            {/* Hero */}
            <HeroSection>
                <Container maxWidth="md">
                    <Box sx={{ fontSize: 48, mb: 2, animation: `${fadeInUp} 0.6s ease forwards` }}>
                        <i className="fa-solid fa-mosque"></i>
                    </Box>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ animation: `${fadeInUp} 0.6s ease forwards 0.1s`, opacity: 0, animationFillMode: 'forwards' }}
                    >
                        {t('zakat.title')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ maxWidth: 600, mx: 'auto', animation: `${fadeInUp} 0.6s ease forwards 0.2s`, opacity: 0, animationFillMode: 'forwards' }}
                    >
                        {t('zakat.description')}
                    </Typography>
                </Container>
            </HeroSection>

            <Container sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={4}>
                    {/* Calculator Form */}
                    <Grid item xs={12} lg={8}>
                        <CalculatorSection sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h5" fontWeight="bold">
                                    {t('zakat.howToCalc')}
                                </Typography>
                            </Box>

                            <Grid container spacing={3}>
                                {fields.map(field => (
                                    <Grid item xs={12} md={6} key={field.key}>
                                        <TextField
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <i className={field.icon}></i>
                                                    {field.label}
                                                    {field.suffix && <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>{field.suffix}</Typography>}
                                                </Box>
                                            }
                                            type="number"
                                            value={values[field.key]}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            fullWidth
                                            placeholder="0"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">{currencyLabel}</InputAdornment>,
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: field.isDeduction ? alpha(theme.palette.error.main, 0.05) : 'background.paper',
                                                }
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="text" color="inherit" onClick={resetCalc}>
                                    {t('zakat.resetCalc')} <i className="fa-solid fa-rotate-right" style={{ marginLeft: 8 }}></i>
                                </Button>
                            </Box>
                        </CalculatorSection>
                    </Grid>

                    {/* Result Card */}
                    <Grid item xs={12} lg={4}>
                        <ResultCard elevation={0}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'primary.main'
                                }}>
                                    <i className="fa-solid fa-moon"></i>
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                    {t('zakat.zakatDue')}
                                </Typography>
                            </Box>

                            <ResultAmount variant="h3" active={zakatDue > 0 ? 1 : 0}>
                                {formatCurrency(zakatDue)}
                            </ResultAmount>

                            <Stack spacing={2} sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">{t('zakat.totalAssets')}</Typography>
                                    <Typography fontWeight="bold">{formatCurrency(totalAssets)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                                    <Typography>{t('zakat.totalDeductions')}</Typography>
                                    <Typography fontWeight="bold">- {formatCurrency(totalDeductions)}</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography fontWeight="medium">{t('zakat.zakatableAmount')}</Typography>
                                    <Typography fontWeight="bold">{formatCurrency(zakatableAmount)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">{t('zakat.nisab')}</Typography>
                                    <Typography variant="body2" color="text.secondary">{formatCurrency(nisabGold)}</Typography>
                                </Box>
                            </Stack>

                            {zakatDue > 0 ? (
                                <Button
                                    component={Link}
                                    to={`/donate?amount=${Math.round(zakatDue)}&type=zakat`}
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    startIcon={<i className="fa-solid fa-hand-holding-heart"></i>}
                                >
                                    {t('zakat.payZakat')}
                                </Button>
                            ) : zakatableAmount > 0 && zakatableAmount < nisabGold ? (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        borderColor: alpha(theme.palette.warning.main, 0.3),
                                        color: 'warning.dark'
                                    }}
                                >
                                    <Typography variant="body2" textAlign="center">
                                        {t('zakat.belowNisab')} ({formatCurrency(nisabGold)})
                                    </Typography>
                                </Paper>
                            ) : null}
                        </ResultCard>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default ZakatCalculator;
