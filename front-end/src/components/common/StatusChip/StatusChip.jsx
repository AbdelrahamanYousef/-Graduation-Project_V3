import './StatusChip.css';
import { t } from '../../../i18n';

/**
 * StatusChip Component - Display status badges
 */
const STATUS_CONFIG = {
    draft: { color: 'neutral', icon: '📝' },
    active: { color: 'success', icon: '✓' },
    pending: { color: 'warning', icon: '⏳' },
    approved: { color: 'success', icon: '✓' },
    rejected: { color: 'error', icon: '✕' },
    completed: { color: 'primary', icon: '★' },
    archived: { color: 'neutral', icon: '📁' },
    cancelled: { color: 'error', icon: '✕' },
};

function StatusChip({
    status,
    size = 'md',
    showIcon = true,
    className = '',
}) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const label = t(`status.${status}`) || status;

    const classNames = [
        'status-chip',
        `status-chip--${config.color}`,
        `status-chip--${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classNames}>
            {showIcon && <span className="status-chip__icon">{config.icon}</span>}
            <span className="status-chip__label">{label}</span>
        </span>
    );
}

export default StatusChip;
