import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    InputAdornment,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Stack,
    IconButton,
    MenuItem,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';

/**
 * Admin Beneficiaries Page - إدارة المستفيدين
 */
function AdminBeneficiaries() {
    const theme = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Mock beneficiaries data
    const beneficiaries = [
        { id: 1, name: 'عائلة محمد أحمد', type: 'أسرة', program: 'رعاية الأيتام', status: 'active', cases: 2, location: 'القاهرة' },
        { id: 2, name: 'فاطمة السيد', type: 'فرد', program: 'الرعاية الصحية', status: 'active', cases: 1, location: 'الجيزة' },
        { id: 3, name: 'عائلة حسن علي', type: 'أسرة', program: 'التعليم', status: 'pending', cases: 3, location: 'الإسكندرية' },
        { id: 4, name: 'أحمد محمود', type: 'فرد', program: 'الإغاثة العاجلة', status: 'inactive', cases: 1, location: 'المنيا' },
        { id: 5, name: 'عائلة خالد عمر', type: 'أسرة', program: 'رعاية الأيتام', status: 'active', cases: 4, location: 'أسوان' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'inactive': return 'default';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'pending': return 'قيد المراجعة';
            case 'inactive': return 'غير نشط';
            default: return status;
        }
    };

    const tabsTags = ['all', 'active', 'pending', 'inactive'];

    const filtered = tabsTags[activeTab] === 'all'
        ? beneficiaries
        : beneficiaries.filter(b => b.status === tabsTags[activeTab]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
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
                        إدارة المستفيدين
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        إضافة ومتابعة حالات المستفيدين
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<i className="fa-solid fa-plus"></i>}
                    onClick={() => setIsModalOpen(true)}
                >
                    إضافة مستفيد
                </Button>
            </Box>

            {/* Stats */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{
                        border: 1,
                        borderColor: 'divider',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        color: 'white'
                    }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ fontSize: 24, opacity: 0.9 }}>
                                <i className="fa-solid fa-people-group"></i>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {beneficiaries.length}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                إجمالي المستفيدين
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ fontSize: 24, color: 'text.secondary' }}>
                                <i className="fa-solid fa-clipboard-list"></i>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {beneficiaries.reduce((sum, b) => sum + b.cases, 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                الحالات النشطة
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ fontSize: 24, color: 'success.main' }}>
                                <i className="fa-solid fa-circle-check"></i>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {beneficiaries.filter(b => b.status === 'active').length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                مستفيد نشط
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ fontSize: 24, color: 'warning.main' }}>
                                <i className="fa-solid fa-hourglass-half"></i>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {beneficiaries.filter(b => b.status === 'pending').length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                قيد المراجعة
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs & Search */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label={`الكل (${beneficiaries.length})`} />
                    <Tab label={`نشط (${beneficiaries.filter(b => b.status === 'active').length})`} />
                    <Tab label={`قيد المراجعة (${beneficiaries.filter(b => b.status === 'pending').length})`} />
                    <Tab label={`غير نشط (${beneficiaries.filter(b => b.status === 'inactive').length})`} />
                </Tabs>
                <TextField
                    placeholder="بحث بالاسم..."
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Box>

            {/* Table */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>الاسم</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>النوع</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>البرنامج</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>الحالات</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>الموقع</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((ben) => (
                                <TableRow key={ben.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 14 }}>
                                                <i className="fa-solid fa-user"></i>
                                            </Avatar>
                                            <Typography variant="body2" fontWeight="medium">{ben.name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{ben.type}</TableCell>
                                    <TableCell>{ben.program}</TableCell>
                                    <TableCell>{ben.cases} حالة</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <i className="fa-solid fa-location-dot" style={{ fontSize: 12, color: theme.palette.text.secondary }}></i>
                                            <Typography variant="body2">{ben.location}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(ben.status)}
                                            color={getStatusColor(ben.status)}
                                            size="small"
                                            variant="soft"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <IconButton size="small">
                                                <i className="fa-solid fa-eye" style={{ fontSize: 14 }}></i>
                                            </IconButton>
                                            <IconButton size="small">
                                                <i className="fa-solid fa-pen-to-square" style={{ fontSize: 14 }}></i>
                                            </IconButton>
                                            <IconButton size="small">
                                                <i className="fa-solid fa-clipboard-list" style={{ fontSize: 14 }}></i>
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Add Modal */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>إضافة مستفيد جديد</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="الاسم الكامل" fullWidth required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="النوع" fullWidth defaultValue="family">
                                <MenuItem value="family">أسرة</MenuItem>
                                <MenuItem value="individual">فرد</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="رقم الهاتف" fullWidth type="tel" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="رقم الهوية" fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="المحافظة" fullWidth defaultValue="">
                                <MenuItem value="">اختر المحافظة</MenuItem>
                                <MenuItem value="cairo">القاهرة</MenuItem>
                                <MenuItem value="giza">الجيزة</MenuItem>
                                <MenuItem value="alex">الإسكندرية</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="العنوان التفصيلي" fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="ملاحظات"
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="ملاحظات إضافية..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsModalOpen(false)} variant="outlined" color="inherit">
                        إلغاء
                    </Button>
                    <Button onClick={() => setIsModalOpen(false)} variant="contained">
                        إضافة المستفيد
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminBeneficiaries;
