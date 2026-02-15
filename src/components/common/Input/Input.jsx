import './Input.css';

/**
 * Input Component
 * Text, number, phone, and textarea variants with validation states
 */
function Input({
    type = 'text',
    label,
    name,
    value,
    onChange,
    placeholder,
    error,
    hint,
    required = false,
    disabled = false,
    multiline = false,
    rows = 4,
    icon,
    prefix,
    suffix,
    className = '',
    ...props
}) {
    const inputId = `input-${name}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const hasError = !!error;

    const wrapperClasses = [
        'input-wrapper',
        hasError && 'input-wrapper--error',
        disabled && 'input-wrapper--disabled',
        className
    ].filter(Boolean).join(' ');

    const inputClasses = [
        'input',
        icon && 'input--with-icon',
        prefix && 'input--with-prefix',
        suffix && 'input--with-suffix'
    ].filter(Boolean).join(' ');

    const InputElement = multiline ? 'textarea' : 'input';

    return (
        <div className={wrapperClasses}>
            {label && (
                <label htmlFor={inputId} className="input__label">
                    {label}
                    {required && <span className="input__required" aria-hidden="true">*</span>}
                </label>
            )}

            <div className="input__container">
                {icon && <span className="input__icon">{icon}</span>}
                {prefix && <span className="input__prefix">{prefix}</span>}

                <InputElement
                    id={inputId}
                    name={name}
                    type={!multiline ? type : undefined}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    rows={multiline ? rows : undefined}
                    className={inputClasses}
                    aria-invalid={hasError}
                    aria-describedby={[
                        error && errorId,
                        hint && hintId
                    ].filter(Boolean).join(' ') || undefined}
                    {...props}
                />

                {suffix && <span className="input__suffix">{suffix}</span>}
            </div>

            {error && (
                <span id={errorId} className="input__error" role="alert">
                    {error}
                </span>
            )}

            {hint && !error && (
                <span id={hintId} className="input__hint">
                    {hint}
                </span>
            )}
        </div>
    );
}

export default Input;
