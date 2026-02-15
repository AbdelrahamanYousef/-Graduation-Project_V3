import './Card.css';

/**
 * Card Component - Base card with variants for different use cases
 */
function Card({
    children,
    variant = 'default',
    padding = 'md',
    hoverable = false,
    onClick,
    className = '',
    ...props
}) {
    const Component = onClick ? 'button' : 'div';

    const classNames = [
        'card',
        `card--${variant}`,
        `card--padding-${padding}`,
        hoverable && 'card--hoverable',
        onClick && 'card--clickable',
        className
    ].filter(Boolean).join(' ');

    return (
        <Component
            className={classNames}
            onClick={onClick}
            {...props}
        >
            {children}
        </Component>
    );
}

/**
 * Card Header
 */
Card.Header = function CardHeader({ children, className = '' }) {
    return (
        <div className={`card__header ${className}`}>
            {children}
        </div>
    );
};

/**
 * Card Body
 */
Card.Body = function CardBody({ children, className = '' }) {
    return (
        <div className={`card__body ${className}`}>
            {children}
        </div>
    );
};

/**
 * Card Footer
 */
Card.Footer = function CardFooter({ children, className = '' }) {
    return (
        <div className={`card__footer ${className}`}>
            {children}
        </div>
    );
};

/**
 * Card Image
 */
Card.Image = function CardImage({ src, alt, aspectRatio = '16/9', className = '' }) {
    return (
        <div
            className={`card__image ${className}`}
            style={{ aspectRatio }}
        >
            <img src={src} alt={alt} loading="lazy" />
        </div>
    );
};

export default Card;
