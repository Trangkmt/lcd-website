import React from 'react';

export default function ConfirmationDialog({
    variant = 'warning',
    title,
    message,
    detail,
    icon,
    className = '',
}) {
    const baseStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        width: 'fit-content',
        maxWidth: '460px',
        border: '1px solid transparent',
        padding: '10px 12px',
        fontSize: '0.875rem',
        lineHeight: 1.45,
        borderRadius: '8px',
    };

    const variantStyles = {
        success: { background: '#edf9f1', borderColor: '#cdeed8', color: '#207d45' },
        error: { background: '#fff4f4', borderColor: '#ffd8d8', color: '#c43232' },
        delete: {
            background: 'var(--color-state-danger-soft)',
            borderColor: 'var(--color-state-danger-border)',
            color: 'var(--color-state-danger-strong)',
        },
        warning: { background: '#fff7ec', borderColor: '#ffe4bf', color: '#a96513' },
        info: { background: '#eef5ff', borderColor: '#d4e6ff', color: '#245a99' },
    };

    const iconStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: '18px',
        height: '18px',
        marginTop: '1px',
        fontSize: '1rem',
        lineHeight: 0,
    };

    const contentStyle = { flex: 1, minWidth: 0 };
    const titleStyle = { margin: '0 0 2px', fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.35 };
    const messageStyle = { margin: 0, color: 'inherit' };

    const activeVariant = variantStyles[variant] ? variant : 'warning';
    const dialogClassName = [
        'confirmation-dialog',
        `confirmation-dialog--${variant || 'warning'}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={dialogClassName} style={{ ...baseStyle, ...variantStyles[activeVariant] }}>
            {icon ? <span className="confirmation-dialog__icon" style={iconStyle}>{icon}</span> : null}
            <div className="confirmation-dialog__content" style={contentStyle}>
                {title ? <p className="confirmation-dialog__title" style={titleStyle}>{title}</p> : null}
                {message ? <p className="confirmation-dialog__message" style={messageStyle}>{message}</p> : null}
                {detail ? <p className="confirmation-dialog__message" style={messageStyle}>{detail}</p> : null}
            </div>
        </div>
    );
}
