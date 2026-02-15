import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    Stepper,
    Step,
    StepLabel,
    Radio,
    RadioGroup,
    FormControlLabel,
    Checkbox,
    Stack,
    Paper,
    InputAdornment,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import { t, formatCurrency } from '../../i18n';
import { projects, donationTypes, paymentMethods } from '../../data/mockData';
import styled from '@emotion/styled';

// --- Styled Components ---

const AmountButton = styled(Button)(({ theme, selected }) => ({
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
    color: selected ? theme.palette.primary.main : theme.palette.text.primary,
    height: 56,
    fontSize: '1.1rem',
    fontWeight: selected ? 'bold' : 'normal',
    '&:hover': {
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.2) : theme.palette.action.hover,
        border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.text.secondary}`,
    },
}));

const OptionButton = styled(Button)(({ theme, selected }) => ({
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
    justifyContent: 'flex-start',
    padding: theme.spacing(1.5, 2),
    '&:hover': {
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.1) : theme.palette.action.hover,
        border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.text.primary}`,
    },
}));

const SummaryCard = styled(Card)(({ theme }) => ({
    position: 'sticky',
    top: theme.spacing(10),
    backgroundColor: theme.palette.grey[50],
}));

/**
 * Donate Page - Multi-step donation flow
 */
function Donate() {
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const preSelectedAmount = parseInt(searchParams.get('amount')) || null;
    const preSelectedProject = parseInt(searchParams.get('project')) || null;

    const [step, setStep] = useState(0); // 0-indexed for MUI Stepper
    const [formData, setFormData] = useState({
        amount: preSelectedAmount || 100,
        customAmount: '',
        donationType: 'sadaqah',
        projectId: preSelectedProject || null,
        isRecurring: false,
        // Donor info
        fullName: '',
        email: '',
        phone: '',
        isAnonymous: false,
        // Payment
        paymentMethod: 'card',
    });

    const [errors, setErrors] = useState({});

    const amounts = [50, 100, 200, 500, 1000, 2000];
    const selectedProject = projects.find(p => p.id === formData.projectId);

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateStep = (stepNum) => {
        const newErrors = {};

        if (stepNum === 0) {
            const amount = formData.customAmount || formData.amount;
            if (!amount || amount < 10) {
                newErrors.amount = 'الحد الأدنى للتبرع 10 ج.م';
            }
        }

        if (stepNum === 1) {
            if (!formData.isAnonymous) {
                if (!formData.fullName.trim()) newErrors.fullName = t('validation.required');
                if (!formData.phone.trim()) newErrors.phone = t('validation.required');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = () => {
        // Simulate payment processing
        navigate('/confirmation?receipt=' + Date.now());
    };

    const getTotalAmount = () => {
        return formData.customAmount || formData.amount;
    };

    const steps = [
        t('donate.selectAmount') || 'المبلغ', // Fallback if translation missing
        t('donate.yourInfo') || 'البيانات',
        t('donate.paymentMethod') || 'الدفع'
    ];

    return (
        <Box sx={{ py: 8 }}>
            <Container>
                <Grid container spacing={4}>
                    {/* Main Form */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                            {/* Progress Steps */}
                            <Stepper activeStep={step} alternativeLabel sx={{ mb: 5 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {/* Step 1: Amount & Type */}
                            {step === 0 && (
                                <Stack spacing={4}>
                                    <Box>
                                        <Typography variant="h6" gutterBottom>{t('donate.selectAmount')}</Typography>
                                        <Grid container spacing={2}>
                                            {amounts.map(amount => (
                                                <Grid item xs={4} sm={4} key={amount}>
                                                    <AmountButton
                                                        fullWidth
                                                        selected={formData.amount === amount && !formData.customAmount}
                                                        onClick={() => { updateForm('amount', amount); updateForm('customAmount', ''); }}
                                                    >
                                                        {formatCurrency(amount, 'USD').replace('$', '')}
                                                    </AmountButton>
                                                </Grid>
                                            ))}
                                        </Grid>
                                        <TextField
                                            fullWidth
                                            label={t('donate.customAmount')}
                                            type="number"
                                            value={formData.customAmount}
                                            onChange={(e) => updateForm('customAmount', e.target.value)}
                                            error={!!errors.amount}
                                            helperText={errors.amount}
                                            sx={{ mt: 2 }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">ج.م</InputAdornment>,
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" gutterBottom>{t('donate.donationType')}</Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                            {donationTypes.map(type => (
                                                <OptionButton
                                                    key={type.id}
                                                    fullWidth
                                                    selected={formData.donationType === type.id}
                                                    onClick={() => updateForm('donationType', type.id)}
                                                >
                                                    {type.label}
                                                </OptionButton>
                                            ))}
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" gutterBottom>{t('donate.selectProject')}</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <OptionButton
                                                    fullWidth
                                                    selected={!formData.projectId}
                                                    onClick={() => updateForm('projectId', null)}
                                                >
                                                    {t('donate.generalDonation')}
                                                </OptionButton>
                                            </Grid>
                                            {projects.slice(0, 4).map(project => (
                                                <Grid item xs={12} sm={6} key={project.id}>
                                                    <OptionButton
                                                        fullWidth
                                                        selected={formData.projectId === project.id}
                                                        onClick={() => updateForm('projectId', project.id)}
                                                    >
                                                        {project.title}
                                                    </OptionButton>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.isRecurring}
                                                    onChange={(e) => updateForm('isRecurring', e.target.checked)}
                                                />
                                            }
                                            label={t('donate.monthly')}
                                        />
                                    </Box>

                                    <Button variant="contained" size="large" onClick={nextStep} fullWidth>
                                        {t('common.next')}
                                    </Button>
                                </Stack>
                            )}

                            {/* Step 2: Donor Info */}
                            {step === 1 && (
                                <Stack spacing={4}>
                                    <Typography variant="h6">{t('donate.yourInfo')}</Typography>

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.isAnonymous}
                                                onChange={(e) => updateForm('isAnonymous', e.target.checked)}
                                            />
                                        }
                                        label={t('donate.anonymous')}
                                    />

                                    {!formData.isAnonymous && (
                                        <Stack spacing={3}>
                                            <TextField
                                                label={t('donate.fullName')}
                                                value={formData.fullName}
                                                onChange={(e) => updateForm('fullName', e.target.value)}
                                                error={!!errors.fullName}
                                                helperText={errors.fullName}
                                                required
                                                fullWidth
                                            />
                                            <TextField
                                                label={t('donate.email')}
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => updateForm('email', e.target.value)}
                                                fullWidth
                                            />
                                            <TextField
                                                label={t('donate.phone')}
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => updateForm('phone', e.target.value)}
                                                error={!!errors.phone}
                                                helperText={errors.phone}
                                                required
                                                fullWidth
                                            />
                                        </Stack>
                                    )}

                                    <Stack direction="row" spacing={2}>
                                        <Button variant="outlined" onClick={prevStep} fullWidth>{t('common.back')}</Button>
                                        <Button variant="contained" onClick={nextStep} fullWidth>{t('common.next')}</Button>
                                    </Stack>
                                </Stack>
                            )}

                            {/* Step 3: Payment */}
                            {step === 2 && (
                                <Stack spacing={4}>
                                    <Typography variant="h6">{t('donate.paymentMethod')}</Typography>

                                    <Grid container spacing={2}>
                                        {paymentMethods.map(method => (
                                            <Grid item xs={12} sm={4} key={method.id}>
                                                <OptionButton
                                                    fullWidth
                                                    selected={formData.paymentMethod === method.id}
                                                    onClick={() => updateForm('paymentMethod', method.id)}
                                                    sx={{ flexDirection: 'column', alignItems: 'center', py: 3, gap: 1 }}
                                                >
                                                    <i className={method.icon} style={{ fontSize: '1.5rem', marginBottom: 8 }}></i>
                                                    {method.label}
                                                </OptionButton>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {formData.paymentMethod === 'card' && (
                                        <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField label="رقم البطاقة" fullWidth placeholder="0000 0000 0000 0000" />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField label="تاريخ الانتهاء" fullWidth placeholder="MM/YY" />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField label="CVV" fullWidth placeholder="123" />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField label="الاسم على البطاقة" fullWidth />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', gap: 1 }}>
                                        <i className="fa-solid fa-shield-halved"></i>
                                        <Typography variant="body2">{t('donate.securePayment')}</Typography>
                                    </Box>

                                    <Stack direction="row" spacing={2}>
                                        <Button variant="outlined" onClick={prevStep} fullWidth>{t('common.back')}</Button>
                                        <Button variant="contained" size="large" onClick={handleSubmit} fullWidth>{t('donate.payNow')}</Button>
                                    </Stack>
                                </Stack>
                            )}
                        </Paper>
                    </Grid>

                    {/* Order Summary Sidebar */}
                    <Grid item xs={12} md={4}>
                        <SummaryCard variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{t('donate.orderSummary')}</Typography>
                                <Divider sx={{ mb: 2 }} />

                                {selectedProject && (
                                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                        <Box
                                            component="img"
                                            src={selectedProject.image}
                                            alt={selectedProject.title}
                                            sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>{selectedProject.title}</Typography>
                                        </Box>
                                    </Box>
                                )}

                                <Stack spacing={2} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">{t('donate.subtotal')}</Typography>
                                        <Typography fontWeight="medium">{formatCurrency(getTotalAmount())}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">نوع التبرع</Typography>
                                        <Typography fontWeight="medium">{donationTypes.find(d => d.id === formData.donationType)?.label}</Typography>
                                    </Box>
                                    {formData.isRecurring && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">التكرار</Typography>
                                            <Typography fontWeight="medium">شهري</Typography>
                                        </Box>
                                    )}
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">{t('donate.total')}</Typography>
                                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                                        {formatCurrency(getTotalAmount())}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </SummaryCard>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default Donate;
