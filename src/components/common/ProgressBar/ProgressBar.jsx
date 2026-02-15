import './ProgressBar.css';
import { formatCurrency } from '../../../i18n';

/**
 * ProgressBar Component - Shows funding/completion progress
 */
function ProgressBar({
    current = 0,
    goal = 100,
    showLabel = true,
    showAmount = true,
    size = 'md',
    color = 'primary',
    animated = true,
    className = '',
}) {
    const percentage = Math.min(Math.round((current / goal) * 100), 100);

    const classNames = [
        'progress',
        `progress--${size}`,
        `progress--${color}`,
        animated && 'progress--animated',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames}>
            {(showLabel || showAmount) && (
                <div className="progress__header">
                    {showAmount && (
                        <span className="progress__amount">
                            <span className="progress__current">{formatCurrency(current)}</span>
                            <span className="progress__separator"> / </span>
                            <span className="progress__goal">{formatCurrency(goal)}</span>
                        </span>
                    )}
                    {showLabel && (
                        <span className="progress__percentage">{percentage}%</span>
                    )}
                </div>
            )}

            <div
                className="progress__track"
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="progress__fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default ProgressBar;
