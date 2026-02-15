import { Link, useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Divider,
    IconButton,
    Grid,
    useTheme,
    alpha
} from '@mui/material';
import { t, formatCurrency } from '../../i18n';

/**
 * Confirmation Page - Thank you / Receipt
 */
function Confirmation() {
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const receiptNumber = searchParams.get('receipt') || Date.now();

    // Mock data - in real app this would come from API
    const donation = {
        amount: 500,
        type: 'صدقة',
        project: 'كسوة الشتاء للأسر المحتاجة',
        date: new Date().toLocaleDateString('ar-EG'),
        receiptNumber: `NRR-${receiptNumber}`,
    };

    return (
        <Box sx={{ py: 10, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <Container maxWidth="md">
                <Card sx={{ textAlign: 'center', p: { xs: 2, md: 5 }, borderRadius: 3, boxShadow: theme.shadows[5] }}>
                    <CardContent>
                        {/* Success Icon */}
                        <Box sx={{ mb: 3 }}>
                            <i className="fa-solid fa-circle-check" style={{ fontSize: '5rem', color: theme.palette.success.main }}></i>
                        </Box>

                        {/* Title */}
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            {t('confirmation.title')}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {t('confirmation.thankYou')}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}>
                            {t('confirmation.impactMessage')}
                        </Typography>

                        {/* Receipt Details */}
                        <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 4, borderRadius: 2, mb: 5, maxWidth: 600, mx: 'auto' }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">{t('confirmation.receiptNumber')}</Typography>
                                    <Typography fontWeight="medium">{donation.receiptNumber}</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">المبلغ</Typography>
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">{formatCurrency(donation.amount)}</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">نوع التبرع</Typography>
                                    <Typography fontWeight="medium">{donation.type}</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">المشروع</Typography>
                                    <Typography fontWeight="medium">{donation.project}</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">التاريخ</Typography>
                                    <Typography fontWeight="medium">{donation.date}</Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* Actions */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                            <Button
                                variant="outlined"
                                startIcon={<i className="fa-solid fa-download"></i>}
                                onClick={() => window.print()}
                                sx={{ minWidth: 200 }}
                            >
                                {t('confirmation.downloadReceipt')}
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 5 }}>
                            <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                <i className="fa-brands fa-whatsapp"></i>
                            </IconButton>
                            <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                <i className="fa-brands fa-facebook-f"></i>
                            </IconButton>
                            <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                <i className="fa-brands fa-x-twitter"></i>
                            </IconButton>
                        </Stack>

                        {/* Navigation Links */}
                        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                component={Link}
                                to="/"
                                variant="text"
                                color="inherit"
                            >
                                {t('confirmation.backToHome')}
                            </Button>
                            <Button
                                component={Link}
                                to="/donate"
                                variant="contained"
                                size="large"
                                sx={{ minWidth: 200 }}
                            >
                                {t('confirmation.donateAgain')}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}

export default Confirmation;
