import { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Stack,
    InputAdornment,
    useTheme,
    alpha
} from '@mui/material';
import { formatCurrency, formatDate } from '../../i18n';

/**
 * Admin Donations Page - إدارة التبرعات
 */
function AdminDonations() {
    const theme = useTheme();
    const [dateRange, setDateRange] = useState('all');

    // Mock donations data
    const donations = [
        { id: 1, donor: 'أحمد محمد', project: 'مشروع المياه النظيفة', amount: 5000, date: '2024-01-15', method: 'بطاقة ائتمان', status: 'completed' },
        { id: 2, donor: 'فاطمة علي', project: 'كفالة يتيم', amount: 1500, date: '2024-01-14', method: 'فودافون كاش', status: 'completed' },
        { id: 3, donor: 'خالد عبدالله', project: 'القافلة الطبية', amount: 10000, date: '2024-01-13', method: 'تحويل بنكي', status: 'pending' },
        { id: 4, donor: 'سارة أحمد', project: 'تجهيز فصول دراسية', amount: 2500, date: '2024-01-12', method: 'بطاقة ائتمان', status: 'completed' },
        { id: 5, donor: 'محمود حسن', project: 'إفطار صائم', amount: 500, date: '2024-01-11', method: 'فوري', status: 'completed' },
        { id: 6, donor: 'نورة السيد', project: 'مشروع المياه النظيفة', amount: 3000, date: '2024-01-10', method: 'بطاقة ائتمان', status: 'refunded' },
    ];

    const stats = {
        total: donations.reduce((sum, d) => sum + d.amount, 0),
        count: donations.length,
        avgAmount: Math.round(donations.reduce((sum, d) => sum + d.amount, 0) / donations.length),
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'refunded': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'pending': return 'قيد المعالجة';
            case 'refunded': return 'مسترد';
            default: return status;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        إدارة التبرعات
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        عرض وتتبع جميع التبرعات
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<i className="fa-solid fa-download"></i>}
                >
                    تصدير Excel
                </Button>
            </Box>

            {/* Stats */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary">إجمالي التبرعات</Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {formatCurrency(stats.total)}
                            </Typography>
                        </Stack>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary">عدد التبرعات</Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {stats.count}
                            </Typography>
                        </Stack>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary">متوسط التبرع</Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {formatCurrency(stats.avgAmount)}
                            </Typography>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="بحث بالاسم أو رقم التبرع..."
                        variant="outlined"
                        size="small"
                        sx={{ flexGrow: 1, minWidth: 200 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: theme.palette.text.secondary }}></i>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        defaultValue=""
                        sx={{ minWidth: 150 }}
                        label="المشروع"
                    >
                        <MenuItem value="">كل المشاريع</MenuItem>
                        <MenuItem value="1">مشروع المياه النظيفة</MenuItem>
                        <MenuItem value="2">كفالة يتيم</MenuItem>
                    </TextField>
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        defaultValue=""
                        sx={{ minWidth: 150 }}
                        label="الحالة"
                    >
                        <MenuItem value="">كل الحالات</MenuItem>
                        <MenuItem value="completed">مكتمل</MenuItem>
                        <MenuItem value="pending">قيد المعالجة</MenuItem>
                        <MenuItem value="refunded">مسترد</MenuItem>
                    </TextField>
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        sx={{ minWidth: 150 }}
                        label="الفترة"
                    >
                        <MenuItem value="all">كل الفترات</MenuItem>
                        <MenuItem value="today">اليوم</MenuItem>
                        <MenuItem value="week">هذا الأسبوع</MenuItem>
                        <MenuItem value="month">هذا الشهر</MenuItem>
                    </TextField>
                </Box>
            </Card>

            {/* Donations Table */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>رقم التبرع</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>المتبرع</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>المشروع</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>المبلغ</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>طريقة الدفع</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>التاريخ</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {donations.map((donation) => (
                                <TableRow
                                    key={donation.id}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                        #{donation.id.toString().padStart(5, '0')}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{donation.donor}</TableCell>
                                    <TableCell>{donation.project}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        {formatCurrency(donation.amount)}
                                    </TableCell>
                                    <TableCell>{donation.method}</TableCell>
                                    <TableCell>{formatDate(donation.date)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(donation.status)}
                                            color={getStatusColor(donation.status)}
                                            size="small"
                                            variant="soft"
                                            sx={{ fontWeight: 'medium' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <IconButton size="small">
                                                <i className="fa-solid fa-eye" style={{ fontSize: 14 }}></i>
                                            </IconButton>
                                            <IconButton size="small">
                                                <i className="fa-solid fa-file-lines" style={{ fontSize: 14 }}></i>
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}

export default AdminDonations;
