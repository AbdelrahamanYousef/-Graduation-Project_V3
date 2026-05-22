import {
    Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Typography, Stack,
    IconButton, Tooltip, Chip, useTheme, alpha
} from '@mui/material';
import { getStatusColor, getStatusLabel } from '../../utils/admin.helpers';

function AdminDataTable({ columns, data, actions, rowKey = 'id', emptyMessage, header }) {
    const theme = useTheme();

    return (
        <Card elevation={0} sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            overflow: 'hidden'
        }}>
            {header}
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.04),
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}>
                            {columns.map((col, i) => (
                                <TableCell
                                    key={col.key || i}
                                    align={col.align || 'inherit'}
                                    sx={{
                                        fontWeight: '700',
                                        fontSize: '0.8125rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: 'text.primary',
                                        py: 1.75,
                                        px: 2,
                                        ...col.headerSx
                                    }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                            {actions && actions.length > 0 && (
                                <TableCell sx={{
                                    fontWeight: '700',
                                    fontSize: '0.8125rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    py: 1.75,
                                    px: 2
                                }} align="center">
                                    الإجراءات
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {emptyMessage || 'لا توجد بيانات'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow
                                    key={row[rowKey]}
                                    hover
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                            '& .MuiTableCell-root': {
                                                color: 'text.primary'
                                            }
                                        },
                                        '&:last-child': {
                                            borderBottomColor: 'divider'
                                        }
                                    }}
                                >
                                    {columns.map((col, i) => {
                                        const value = col.key ? row[col.key] : null;
                                        return (
                                            <TableCell
                                                key={col.key || i}
                                                align={col.align || 'inherit'}
                                                component={i === 0 ? 'th' : undefined}
                                                scope={i === 0 ? 'row' : undefined}
                                                sx={{
                                                    fontWeight: col.fontWeight || '500',
                                                    color: col.color || 'text.primary',
                                                    py: 1.75,
                                                    px: 2,
                                                    fontSize: '0.9rem',
                                                    ...col.sx,
                                                }}
                                            >
                                                {col.render ? col.render(value, row) : (
                                                    col.type === 'status' ? (
                                                        <Chip
                                                            label={getStatusLabel(value)}
                                                            color={getStatusColor(value)}
                                                            size="small"
                                                            variant="filled"
                                                            sx={{
                                                                fontWeight: '600',
                                                                height: '24px',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    ) : value
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    {actions && actions.length > 0 && (
                                        <TableCell align="center" sx={{ py: 1.75, px: 2 }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                {actions
                                                    .filter(a => !a.show || a.show(row))
                                                    .map((action, i) => (
                                                        <Tooltip title={action.tooltip || ''} key={i}>
                                                            <IconButton
                                                                size="small"
                                                                color={action.color || 'default'}
                                                                onClick={() => action.onClick?.(row)}
                                                                sx={{
                                                                    color: action.color ? undefined : 'text.secondary',
                                                                    '&:hover': {
                                                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                                                        color: 'secondary.main'
                                                                    },
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                <i className={action.icon} style={{ fontSize: action.iconSize || 16 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    ))
                                                }
                                            </Stack>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}

export default AdminDataTable;
