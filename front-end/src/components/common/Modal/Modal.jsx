import { useEffect, useCallback } from 'react';
import './Modal.css';

/**
 * Modal Component - Dialog overlay
 */
function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    closeOnOverlay = true,
    showCloseButton = true,
    children,
    footer,
    className = '',
}) {
    // Handle escape key
    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) {
            onClose?.();
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [handleEscape]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && closeOnOverlay) {
            onClose?.();
        }
    };

    const classNames = [
        'modal',
        `modal--${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="modal__overlay" onClick={handleOverlayClick}>
            <div
                className={classNames}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {(title || showCloseButton) && (
                    <div className="modal__header">
                        {title && <h2 id="modal-title" className="modal__title">{title}</h2>}
                        {showCloseButton && (
                            <button
                                className="modal__close"
                                onClick={onClose}
                                aria-label="إغلاق"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                <div className="modal__body">
                    {children}
                </div>

                {footer && (
                    <div className="modal__footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Modal;
