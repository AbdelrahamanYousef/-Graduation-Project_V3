import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Link,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import { formatCurrency } from '../../i18n';
import styled from '@emotion/styled';

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.common.white,
    padding: theme.spacing(12, 0),
    textAlign: 'center',
}));

const StatCard = styled(Paper)(({ theme, highlight }) => ({
    padding: theme.spacing(3),
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    height: '100%',
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius * 2,
    ...(highlight && {
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        color: theme.palette.common.white,
        '& .MuiTypography-root': {
            color: 'inherit',
        },
        '& .stat-label': {
            color: 'rgba(255, 255, 255, 0.9)',
        }
    }),
}));

const PieChart = styled(Box)(({ theme }) => ({
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: `conic-gradient(
    ${theme.palette.primary.main} 0deg 316deg,
    ${theme.palette.grey[400]} 316deg 349deg,
    ${theme.palette.secondary.main} 349deg 360deg
  )`,
    margin: '0 auto',
    marginBottom: theme.spacing(3),
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const PieCenter = styled(Box)(({ theme }) => ({
    width: 100,
    height: 100,
    background: theme.palette.background.paper,
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
}));

const LegendColor = styled(Box)(({ color }) => ({
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: color,
}));

const GovernanceCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    height: '100%',
    borderRadius: theme.shape.borderRadius * 2,
}));

/**
 * Transparency Page - الشفافية
 */
function Transparency() {
    const theme = useTheme();

    // Mock financial data
    const financialData = {
        totalDonations: 15234567,
        totalSpent: 14123456,
        programExpenses: 12500000,
        adminExpenses: 1200000,
        fundraisingExpenses: 423456,
        beneficiaries: 48520,
    };

    const programBreakdown = [
        { name: 'رعاية الأيتام', amount: 4500000, percentage: 36, color: theme.palette.primary.main },
        { name: 'الرعاية الصحية', amount: 2800000, percentage: 22, color: theme.palette.success.main },
        { name: 'التعليم', amount: 2200000, percentage: 18, color: theme.palette.secondary.main },
        { name: 'الإغاثة العاجلة', amount: 1800000, percentage: 14, color: theme.palette.error.main },
        { name: 'التنمية المجتمعية', amount: 1200000, percentage: 10, color: theme.palette.info.main },
    ];

    const auditors = [
        { year: '2024', firm: 'شركة الحسابات المصرية', status: 'قيد المراجعة' },
        { year: '2023', firm: 'شركة الحسابات المصرية', status: 'معتمد' },
        { year: '2022', firm: 'PWC مصر', status: 'معتمد' },
        { year: '2021', firm: 'PWC مصر', status: 'معتمد' },
    ];

    return (
        <Box sx={{ pb: 12 }}>
            {/* Hero */}
            <HeroSection>
                <Container>
                    <Typography variant="h3" fontWeight="bold" gutterBottom component="h1">
                        الشفافية والمساءلة
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 700, mx: 'auto' }}>
                        نؤمن بحق المتبرعين في معرفة كيف تُستخدم أموالهم. نلتزم بالإفصاح الكامل عن جميع عملياتنا المالية
                    </Typography>
                </Container>
            </HeroSection>

            <Container sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
                {/* Financial Overview */}
                <Box sx={{ mb: 12 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6, display: 'none' }}>
                        نظرة عامة مالية
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={6} md={3}>
                            <StatCard elevation={3}>
                                <Box sx={{ fontSize: 32, color: 'primary.main', mb: 1 }}>
                                    <i className="fa-solid fa-coins"></i>
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {formatCurrency(financialData.totalDonations)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    إجمالي التبرعات
                                </Typography>
                            </StatCard>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatCard elevation={3}>
                                <Box sx={{ fontSize: 32, color: 'primary.main', mb: 1 }}>
                                    <i className="fa-solid fa-chart-pie"></i>
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {formatCurrency(financialData.totalSpent)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    إجمالي المصروفات
                                </Typography>
                            </StatCard>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatCard elevation={3} highlight={1}>
                                <Box sx={{ fontSize: 32, mb: 1 }}>
                                    <i className="fa-solid fa-bullseye"></i>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    88%
                                </Typography>
                                <Typography variant="body2" className="stat-label">
                                    نسبة الإنفاق على البرامج
                                </Typography>
                            </StatCard>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatCard elevation={3}>
                                <Box sx={{ fontSize: 32, color: 'primary.main', mb: 1 }}>
                                    <i className="fa-solid fa-users"></i>
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {financialData.beneficiaries.toLocaleString('ar-EG')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    مستفيد
                                </Typography>
                            </StatCard>
                        </Grid>
                    </Grid>
                </Box>

                {/* Expense Breakdown */}
                <Box sx={{ mb: 12 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        توزيع المصروفات
                    </Typography>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 4, borderRadius: 4 }}>
                                <PieChart>
                                    <PieCenter>
                                        <Typography variant="body2" color="text.secondary">
                                            البرامج
                                        </Typography>
                                    </PieCenter>
                                </PieChart>
                                <Stack spacing={2} sx={{ maxWidth: 300, mx: 'auto' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LegendColor color={theme.palette.primary.main} />
                                        <Typography variant="body2" sx={{ flex: 1 }}>مصروفات البرامج</Typography>
                                        <Typography variant="subtitle2">88%</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LegendColor color={theme.palette.grey[400]} />
                                        <Typography variant="body2" sx={{ flex: 1 }}>مصروفات إدارية</Typography>
                                        <Typography variant="subtitle2">9%</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LegendColor color={theme.palette.secondary.main} />
                                        <Typography variant="body2" sx={{ flex: 1 }}>تكاليف جمع التبرعات</Typography>
                                        <Typography variant="subtitle2">3%</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* Program Breakdown */}
                <Box sx={{ mb: 12 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        توزيع الإنفاق على البرامج
                    </Typography>
                    <Paper sx={{ p: 4, borderRadius: 4 }}>
                        <Stack spacing={4}>
                            {programBreakdown.map((program, index) => (
                                <Box key={index}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {program.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatCurrency(program.amount)}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={program.percentage}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: alpha(program.color, 0.1),
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: program.color,
                                                borderRadius: 5,
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>

                {/* Audit Reports */}
                <Box sx={{ mb: 12 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        تقارير المراجعة
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>السنة</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>مكتب المراجعة</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>التقرير</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {auditors.map((audit, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{audit.year}</TableCell>
                                        <TableCell>{audit.firm}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={audit.status}
                                                color={audit.status === 'معتمد' ? 'success' : 'warning'}
                                                size="small"
                                                variant="soft"
                                                sx={{
                                                    fontWeight: 'medium',
                                                    bgcolor: audit.status === 'معتمد' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                                                    color: audit.status === 'معتمد' ? 'success.dark' : 'warning.dark',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {audit.status === 'معتمد' ? (
                                                <Link href="#" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <i className="fa-solid fa-file-pdf"></i> تحميل
                                                </Link>
                                            ) : (
                                                <Typography variant="body2" color="text.disabled">
                                                    قريباً
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Governance */}
                <Box>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        الحوكمة والرقابة
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <GovernanceCard elevation={2}>
                                <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                                    <i className="fa-solid fa-clipboard-list"></i>
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    مجلس الإدارة
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    مجلس مستقل من 7 أعضاء يجتمع شهريًا لمراجعة الأداء واتخاذ القرارات الاستراتيجية
                                </Typography>
                            </GovernanceCard>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <GovernanceCard elevation={2}>
                                <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                                    <i className="fa-solid fa-shield-halved"></i>
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    لجنة المراجعة
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    لجنة مستقلة تراجع البيانات المالية والالتزام بالسياسات والإجراءات
                                </Typography>
                            </GovernanceCard>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <GovernanceCard elevation={2}>
                                <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                                    <i className="fa-solid fa-scale-balanced"></i>
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    الامتثال
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    نلتزم بجميع القوانين المصرية المنظمة للعمل الأهلي ومعايير الشفافية الدولية
                                </Typography>
                            </GovernanceCard>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}

export default Transparency;
