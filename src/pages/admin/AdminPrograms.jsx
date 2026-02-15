import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tooltip,
    Box,
    Typography,
    Stack,
    Card,
    useTheme,
    alpha
} from '@mui/material';
import { StatusChip } from '../../components/common';
import { programs } from '../../data/mockData';

/**
 * Admin Programs Page - إدارة البرامج
 */
function AdminPrograms() {
    const theme = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    const handleEdit = (program) => {
        setSelectedProgram(program);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedProgram(null);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
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
                        إدارة البرامج
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        إضافة وتعديل برامج الجمعية الخيرية
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAdd}
                    startIcon={<i className="fa-solid fa-plus"></i>}
                >
                    إضافة برنامج
                </Button>
            </Box>

            {/* Programs Table */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>البرنامج</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>عدد المشاريع</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>إجمالي التبرعات</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {programs.map((program) => (
                                <TableRow
                                    key={program.id}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 1,
                                                bgcolor: alpha(program.color || theme.palette.primary.main, 0.1),
                                                color: program.color || 'primary.main',
                                                fontSize: '1.25rem'
                                            }}>
                                                <i className={program.icon}></i>
                                            </Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {program.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{Math.floor(Math.random() * 10) + 1}</TableCell>
                                    <TableCell align="right">{(Math.floor(Math.random() * 5000) + 1000).toLocaleString('ar-EG')} ج.م</TableCell>
                                    <TableCell align="center">
                                        <StatusChip status="active">نشط</StatusChip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="تعديل">
                                                <IconButton size="small" onClick={() => handleEdit(program)} sx={{ color: 'text.secondary' }}>
                                                    <i className="fa-solid fa-pen-to-square" style={{ fontSize: 16 }}></i>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="عرض">
                                                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                                    <i className="fa-solid fa-eye" style={{ fontSize: 16 }}></i>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="حذف">
                                                <IconButton size="small" color="error">
                                                    <i className="fa-solid fa-trash" style={{ fontSize: 16 }}></i>
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog
                open={isModalOpen}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    {selectedProgram ? 'تعديل البرنامج' : 'إضافة برنامج جديد'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="اسم البرنامج"
                            defaultValue={selectedProgram?.name || ''}
                            fullWidth
                            variant="outlined"
                            required
                        />
                        <TextField
                            margin="dense"
                            label="الأيقونة (Font Awesome Class)"
                            defaultValue={selectedProgram?.icon || ''}
                            placeholder="مثال: fa-solid fa-house"
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            margin="dense"
                            label="اللون (HEX)"
                            defaultValue={selectedProgram?.color || '#0B6B6B'}
                            type="color"
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            margin="dense"
                            label="الوصف"
                            multiline
                            rows={4}
                            placeholder="وصف مختصر للبرنامج..."
                            fullWidth
                            variant="outlined"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleClose} color="inherit">
                        إلغاء
                    </Button>
                    <Button onClick={handleClose} variant="contained" color="primary">
                        {selectedProgram ? 'حفظ التغييرات' : 'إضافة'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminPrograms;
