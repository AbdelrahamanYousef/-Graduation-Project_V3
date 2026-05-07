import { Chip } from '@mui/material';
import { getStatusColor, getStatusLabel } from '../../utils/admin.helpers';

/**
 * AdminStatusChip — Standardized status chip for admin tables/cards.
 *
 * @param {string} status - Status key (e.g. 'active', 'pending', 'completed')
 * @param {string} [label] - Override label instead of using automatic mapping
 * @param {string} [variant] - MUI Chip variant (default: 'soft')
 * @param {string} [size] - MUI Chip size (default: 'small')
 */
function AdminStatusChip({ status, label, variant = 'soft', size = 'small' }) {
    return (
        <Chip
            label={label || getStatusLabel(status)}
            color={getStatusColor(status)}
            size={size}
            variant={variant}
            sx={{ fontWeight: 'medium' }}
        />
    );
}

export default AdminStatusChip;
