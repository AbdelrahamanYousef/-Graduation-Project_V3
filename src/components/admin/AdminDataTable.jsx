import {
    Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Typography, Stack,
    IconButton, Tooltip, Chip
} from '@mui/material';
import { getStatusColor, getStatusLabel } from '../../utils/admin.helpers';

/**
 * AdminDataTable — Generic data table with column definitions, actions, and status rendering.
 * Replaces ~300 lines of duplicated table markup across 6 admin pages.
 *
 * @param {Array} columns - Column definitions:
 *   { key, label, align, fontWeight, color, render(value, row), sx }
 * @param {Array} data - Array of row objects
 * @param {Array} [actions] - Row action buttons:
 *   { icon, tooltip, onClick(row), color, show(row) }
 * @param {string} [rowKey] - Key to use as React key (default: 'id')
 * @param {string} [emptyMessage] - Message when data is empty
 * @param {React.ReactNode} [header] - Optional header inside the card
 */
function AdminDataTable({ columns, data, actions, rowKey = 'id', emptyMessage, header }) {
    return (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            {header}
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            {columns.map((col, i) => (
                                <TableCell
                                    key={col.key || i}
                                    align={col.align || 'inherit'}
                                    sx={{ fontWeight: 'bold', ...col.headerSx }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                            {actions && actions.length > 0 && (
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">
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
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
                                                    fontWeight: col.fontWeight,
                                                    color: col.color,
                                                    ...col.sx,
                                                }}
                                            >
                                                {col.render ? col.render(value, row) : (
                                                    col.type === 'status' ? (
                                                        <Chip
                                                            label={getStatusLabel(value)}
                                                            color={getStatusColor(value)}
                                                            size="small"
                                                            variant="soft"
                                                            sx={{ fontWeight: 'medium' }}
                                                        />
                                                    ) : value
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    {actions && actions.length > 0 && (
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                {actions
                                                    .filter(a => !a.show || a.show(row))
                                                    .map((action, i) => (
                                                        <Tooltip title={action.tooltip || ''} key={i}>
                                                            <IconButton
                                                                size="small"
                                                                color={action.color || 'default'}
                                                                onClick={() => action.onClick?.(row)}
                                                                sx={{ color: action.color ? undefined : 'text.secondary' }}
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
