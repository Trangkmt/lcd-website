import React from 'react';
import './ConfirmationDialog.css';

export default function ConfirmationDialog({
    variant = 'warning',
    title,
    message,
    detail,
    icon,
    className = '',
}) {
    const dialogClassName = [
        'confirmation-dialog',
        `confirmation-dialog--${variant || 'warning'}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={dialogClassName}>
            {icon ? <span className="confirmation-dialog__icon">{icon}</span> : null}
            <div className="confirmation-dialog__content">
                {title ? <p className="confirmation-dialog__title">{title}</p> : null}
                {message ? <p className="confirmation-dialog__message">{message}</p> : null}
                {detail ? <p className="confirmation-dialog__message">{detail}</p> : null}
            </div>
        </div>
    );
}

