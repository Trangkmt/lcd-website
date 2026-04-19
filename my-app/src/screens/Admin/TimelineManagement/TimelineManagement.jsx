import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './TimelineManagement.css';
import { categoriesAPI, timelineAPI } from '../../../services/api';
import {
    toMonthNumber,
    toMonthInputValue,
    parseMonthInputValue,
    getTimelineYear,
    sortTimelineEvents,
    pickActiveTimelineEvent,
} from '../../../utils/timeline';
import { EditIcon, DeleteIcon, CloseIcon } from '../../../SvgIcons';
import { ConfirmationDialog } from '../../../components';

const DEFAULT_CALENDAR_YEAR = new Date().getFullYear();

const EMPTY_FORM = {
    month: '',
    event_name: '',
    summary: '',
    is_published: true,
};

export default function TimelineManagement() {
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [annualEventOptions, setAnnualEventOptions] = useState([]);
    const [loadingEventOptions, setLoadingEventOptions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [filters, setFilters] = useState({ month: '', status: 'all' });
    const timelineReferenceDate = useMemo(() => new Date(), []);

    const fetchTimelineEvents = useCallback(async (nextFilters = filters) => {
        setLoading(true);
        setError('');

        try {
            const params = { limit: 500 };
            const selectedMonth = toMonthNumber(nextFilters.month);
            if (selectedMonth) {
                params.month = selectedMonth;
            }
            if (nextFilters.status === 'published') {
                params.is_published = '1';
            }
            if (nextFilters.status === 'draft') {
                params.is_published = '0';
            }

            const data = await timelineAPI.getAdmin(params);
            setTimelineEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Không thể tải timeline: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTimelineEvents(filters);
    }, [filters, fetchTimelineEvents]);

    useEffect(() => {
        fetchAnnualEventOptions();
    }, []);

    async function fetchAnnualEventOptions() {
        setLoadingEventOptions(true);
        try {
            const categories = await categoriesAPI.getAll({ page_type: 'activity_annual' });
            const mappedOptions = Array.isArray(categories)
                ? categories
                    .map((item) => (item?.name ? String(item.name).trim() : ''))
                    .filter(Boolean)
                : [];
            setAnnualEventOptions(Array.from(new Set(mappedOptions)));
        } catch (err) {
            setError((prev) => prev || 'Không thể tải danh sách sự kiện thường niên: ' + err.message);
        } finally {
            setLoadingEventOptions(false);
        }
    }

    const hasActiveFilter = useMemo(() => {
        return !!filters.month || filters.status !== 'all';
    }, [filters]);

    const currentMonth = new Date().getMonth() + 1;
    const activeTimelineId = useMemo(() => {
        const activeEvent = pickActiveTimelineEvent(timelineEvents, currentMonth);
        return activeEvent?.id || null;
    }, [timelineEvents, currentMonth]);

    const timelineDisplayEvents = useMemo(
        () => sortTimelineEvents(timelineEvents, timelineReferenceDate),
        [timelineEvents, timelineReferenceDate]
    );

    const eventNameOptions = useMemo(() => {
        if (!form.event_name) {
            return annualEventOptions;
        }

        return annualEventOptions.includes(form.event_name)
            ? annualEventOptions
            : [form.event_name, ...annualEventOptions];
    }, [annualEventOptions, form.event_name]);

    function resetForm() {
        setForm(EMPTY_FORM);
        setEditingId(null);
    }

    function openCreateModal() {
        resetForm();
        setIsFormModalOpen(true);
    }

    function closeFormModal() {
        if (saving) {
            return;
        }
        setIsFormModalOpen(false);
        resetForm();
    }

    function handleEdit(item) {
        setEditingId(item.id);
        setForm({
            month: toMonthInputValue(item.month, item.year || DEFAULT_CALENDAR_YEAR),
            event_name: item.event_name || '',
            summary: item.summary || '',
            is_published: !!item.is_published,
        });
        setIsFormModalOpen(true);
    }

    function requestDelete(item) {
        setDeleteTarget(item);
    }

    function closeDeleteModal() {
        if (deleting) {
            return;
        }
        setDeleteTarget(null);
    }

    async function confirmDelete() {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);

        try {
            await timelineAPI.delete(deleteTarget.id);
            await fetchTimelineEvents();
            if (editingId === deleteTarget.id) {
                resetForm();
            }
            setDeleteTarget(null);
        } catch (err) {
            alert('Xóa sự kiện thất bại: ' + err.message);
        } finally {
            setDeleting(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const { year, month } = parseMonthInputValue(form.month);
        if (!month) {
            alert('Tháng không hợp lệ, vui lòng chọn từ 1 đến 12.');
            return;
        }

        if (!year) {
            alert('Năm timeline không hợp lệ, vui lòng chọn tháng có đủ năm.');
            return;
        }

        if (!form.event_name.trim()) {
            alert('Tên sự kiện là bắt buộc.');
            return;
        }

        const payload = {
            month,
            year,
            event_name: form.event_name.trim(),
            summary: form.summary?.trim() || null,
            is_published: !!form.is_published,
        };

        setSaving(true);
        try {
            if (editingId) {
                await timelineAPI.update(editingId, payload);
            } else {
                await timelineAPI.create(payload);
            }

            await fetchTimelineEvents();
            setIsFormModalOpen(false);
            resetForm();
        } catch (err) {
            alert('Lưu timeline thất bại: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="timeline-management-page">
            <div className="timeline-management-grid">
                <section className="timeline-management-card timeline-management-card--list">
                    <div className="timeline-list-header">
                        <h2 className="page-title">Danh sách timeline</h2>
                        <div className="timeline-list-filters">
                            <button
                                type="button"
                                className="timeline-btn timeline-btn--primary"
                                onClick={openCreateModal}
                            >
                                Thêm sự kiện
                            </button>
                            <input
                                type="month"
                                value={filters.month}
                                onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
                            />
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="published">Đang hiển thị</option>
                                <option value="draft">Bản nháp</option>
                            </select>
                            {hasActiveFilter && (
                                <button
                                    type="button"
                                    className="timeline-btn timeline-btn--ghost"
                                    onClick={() => setFilters({ month: '', status: 'all' })}
                                >
                                    Xóa lọc
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="timeline-alert timeline-alert--error">{error}</div>}

                    <div className="timeline-vertical">
                        {loading && <div className="timeline-table__empty">Đang tải dữ liệu...</div>}

                        {!loading && timelineEvents.length === 0 && (
                            <div className="timeline-table__empty">Chưa có dữ liệu timeline.</div>
                        )}

                        {!loading && timelineDisplayEvents.map((item, index) => {
                            const eventMonth = toMonthNumber(item.month);
                            const eventYear = getTimelineYear(item, timelineReferenceDate);
                            const isActive = Number(item.id) === Number(activeTimelineId);
                            const isLeft = index % 2 === 0;
                            const statusLabel = isActive
                                ? eventMonth === currentMonth
                                    ? 'Đang diễn ra'
                                    : 'Sắp diễn ra'
                                : item.is_published
                                    ? 'Đang hiển thị'
                                    : 'Bản nháp';

                            const timelineCard = (
                                <div className={`timeline-vertical-card ${isActive ? 'timeline-vertical-card--active' : ''}`}>
                                    <div className="timeline-vertical-card__meta">
                                        <span className="timeline-vertical-card__month">Năm {eventYear} • Tháng {eventMonth}</span>
                                        <span className={`timeline-status ${isActive ? 'timeline-status--active' : item.is_published ? 'timeline-status--published' : 'timeline-status--draft'}`}>
                                            {statusLabel}
                                        </span>
                                    </div>

                                    <h3 className="timeline-vertical-card__title">{item.event_name}</h3>
                                    <p className="timeline-vertical-card__summary">{item.summary || 'Chưa có nội dung tóm tắt.'}</p>

                                    <div className="timeline-vertical-card__footer">
                                        <div className="timeline-table__actions">
                                            <button
                                                type="button"
                                                className="btn-action btn-edit btn-action--icon-only"
                                                onClick={() => handleEdit(item)}
                                                title="Sửa sự kiện"
                                                aria-label="Sửa sự kiện"
                                            >
                                                <span className="btn-action-icon" aria-hidden="true"><EditIcon /></span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-action btn-delete btn-action--icon-only"
                                                onClick={() => requestDelete(item)}
                                                title="Xóa sự kiện"
                                                aria-label="Xóa sự kiện"
                                            >
                                                <span className="btn-action-icon" aria-hidden="true"><DeleteIcon /></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );

                            return (
                                <article key={item.id} className="timeline-vertical-item">
                                    {isLeft ? timelineCard : <div className="timeline-vertical-item__empty" aria-hidden="true" />}
                                    <div className="timeline-vertical-axis" aria-hidden="true">
                                        <span className="timeline-vertical-axis__dot" />
                                    </div>
                                    {!isLeft ? timelineCard : <div className="timeline-vertical-item__empty" aria-hidden="true" />}
                                </article>
                            );
                        })}
                    </div>
                </section>
            </div>

            {isFormModalOpen && (
                <div className="admin-modal" role="dialog" aria-modal="true" aria-label={editingId ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}>
                    <div className="admin-modal__backdrop" onClick={closeFormModal} />
                    <section className="admin-modal__panel">
                        <div className="admin-modal__header">
                            <h2 className="page-title">{editingId ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}</h2>
                            <button
                                type="button"
                                className="timeline-btn timeline-btn--ghost"
                                onClick={closeFormModal}
                                disabled={saving}
                            >
                                Đóng
                            </button>
                        </div>

                        <form className="timeline-form" onSubmit={handleSubmit}>
                            <div className="timeline-form__row">
                                <label className="timeline-form__field timeline-form__field--event-name">
                                    <span>Tên sự kiện</span>
                                    <select
                                        value={form.event_name}
                                        onChange={(e) => setForm((prev) => ({ ...prev, event_name: e.target.value }))}
                                        disabled={loadingEventOptions || annualEventOptions.length === 0}
                                        required
                                    >
                                        <option value="">
                                            {loadingEventOptions ? 'Đang tải danh sách sự kiện...' : 'Chọn sự kiện thường niên'}
                                        </option>
                                        {eventNameOptions.map((eventName) => (
                                            <option key={eventName} value={eventName}>
                                                {eventName}
                                            </option>
                                        ))}
                                    </select>
                                    {!loadingEventOptions && annualEventOptions.length === 0 && (
                                        <small>Chưa có danh mục hoạt động thường niên. Vui lòng tạo ở mục Quản lý danh mục.</small>
                                    )}
                                </label>

                                <label className="timeline-form__field timeline-form__field--month">
                                    <span>Lịch sự kiện</span>
                                    <input
                                        type="month"
                                        value={form.month}
                                        onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))}
                                        required
                                    />
                                </label>
                            </div>

                            <label className="timeline-form__field">
                                <span>Nội dung tóm tắt</span>
                                <textarea
                                    rows={4}
                                    value={form.summary}
                                    onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                                    placeholder="Mô tả ngắn gọn cho timeline homepage"
                                />
                            </label>

                            <label className="timeline-form__checkbox">
                                <input
                                    type="checkbox"
                                    checked={!!form.is_published}
                                    onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                                />
                                <span>Hiển thị trên homepage</span>
                            </label>

                            <div className="timeline-form__actions">
                                <button type="submit" className="timeline-btn timeline-btn--primary" disabled={saving}>
                                    {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                                <button type="button" className="timeline-btn timeline-btn--ghost" onClick={closeFormModal} disabled={saving}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {deleteTarget && (
                <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Xác nhận xóa sự kiện">
                    <div className="admin-modal__backdrop" onClick={closeDeleteModal} />
                    <section className="admin-modal__panel timeline-delete-modal__panel">
                        <div className="admin-modal__header">
                            <h2 className="admin-modal__title">Xác nhận xóa</h2>
                            <button
                                type="button"
                                className="admin-modal__close"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                aria-label="Đóng"
                            >
                                <CloseIcon size={20} />
                            </button>
                        </div>

                        <div className="admin-modal__body timeline-delete-modal__body">
                            <ConfirmationDialog
                                variant="delete"
                                title="Bạn có chắc muốn xóa sự kiện này?"
                                message={(
                                    <>
                                        Sự kiện <strong>{deleteTarget.event_name}</strong> sẽ bị xóa và không thể khôi phục.
                                    </>
                                )}
                            />

                            <div className="timeline-delete-modal__actions">
                                <button
                                    type="button"
                                    className="timeline-btn timeline-btn--ghost"
                                    onClick={closeDeleteModal}
                                    disabled={deleting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn-action btn-delete"
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Đang xóa...' : 'Xóa sự kiện'}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
