import './Skeleton.css';

/**
 * Skeleton Component - Loading placeholder
 */
function Skeleton({
    variant = 'text',
    width,
    height,
    count = 1,
    className = '',
}) {
    const classNames = [
        'skeleton',
        `skeleton--${variant}`,
        className
    ].filter(Boolean).join(' ');

    const style = {
        width: width,
        height: height,
    };

    if (count > 1) {
        return (
            <div className="skeleton-group">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className={classNames} style={style} />
                ))}
            </div>
        );
    }

    return <div className={classNames} style={style} />;
}

/**
 * Pre-built skeleton patterns
 */
Skeleton.Card = function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <Skeleton variant="image" />
            <div className="skeleton-card__content">
                <Skeleton variant="title" />
                <Skeleton variant="text" count={2} />
                <Skeleton variant="button" />
            </div>
        </div>
    );
};

Skeleton.List = function SkeletonList({ count = 5 }) {
    return (
        <div className="skeleton-list">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-list__item">
                    <Skeleton variant="avatar" />
                    <div className="skeleton-list__content">
                        <Skeleton variant="title" width="60%" />
                        <Skeleton variant="text" width="80%" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Skeleton;
