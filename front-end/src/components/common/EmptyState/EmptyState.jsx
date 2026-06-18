import { Button } from '@mui/material';
import './EmptyState.css';

/**
 * EmptyState Component - Display when no data available
 */
function EmptyState({
    icon,
    title,
    description,
    action,
    actionLabel,
    onAction,
    size = 'md',
    className = '',
}) {
    const classNames = [
        'empty-state',
        `empty-state--${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames}>
            {icon && (
                <div className="empty-state__icon">
                    {typeof icon === 'string' ? (
                        <span className="empty-state__emoji">{icon}</span>
                    ) : icon}
                </div>
            )}

            {title && <h3 className="empty-state__title">{title}</h3>}

            {description && (
                <p className="empty-state__description">{description}</p>
            )}

            {(action || (actionLabel && onAction)) && (
                <div className="empty-state__action">
                    {action || (
                        <Button variant="outlined" onClick={onAction}>
                            {actionLabel}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default EmptyState;
