import React, { useCallback, useState } from 'react';
import { ConfirmationDialog } from '../../components';

const INITIAL_STATE = {
    open: false,
    title: 'Xác nhận',
    message: '',
    detail: '',
    variant: 'warning',
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
    confirmButtonClassName: 'btn-primary',
    panelClassName: 'admin-modal__panel--confirm-fit',
    resolve: null,
};

export default function useAdminConfirm() {
    const [confirmState, setConfirmState] = useState(INITIAL_STATE);

    const closeConfirm = useCallback((result) => {
        setConfirmState((prev) => {
            if (typeof prev.resolve === 'function') {
                prev.resolve(result);
            }
            return INITIAL_STATE;
        });
    }, []);

    const confirm = useCallback((options = {}) => new Promise((resolve) => {
        setConfirmState({
            ...INITIAL_STATE,
            ...options,
            open: true,
            resolve,
        });
    }), []);

    const confirmModal = confirmState.open ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-label={confirmState.title || 'Xác nhận'}>
            <div className="admin-modal__backdrop" onClick={() => closeConfirm(false)} />
            <section className={`admin-modal__panel ${confirmState.panelClassName || ''}`.trim()}>
                <div className="admin-modal__header">
                    <h2 className="admin-modal__title">{confirmState.title}</h2>
                </div>

                <div className="admin-modal__body">
                    <ConfirmationDialog
                        variant={confirmState.variant || 'warning'}
                        title={confirmState.message}
                        message={confirmState.detail}
                    />

                    <div className="admin-modal__actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => closeConfirm(false)}
                        >
                            {confirmState.cancelText}
                        </button>
                        <button
                            type="button"
                            className={confirmState.confirmButtonClassName}
                            onClick={() => closeConfirm(true)}
                        >
                            {confirmState.confirmText}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    ) : null;

    return { confirm, confirmModal };
}
