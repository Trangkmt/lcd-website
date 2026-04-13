import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './TimelineManagement.css';
import { categoriesAPI, timelineAPI } from '../../../services/api';

const MONTH_OPTIONS = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
];

const EMPTY_FORM = {
    month: '',
    event_name: '',
    summary: '',
    sort_order: 0,
    is_published: true,
};

function toMonthNumber(value) {
    const month = Number.parseInt(value, 10);
    if (!Number.isFinite(month) || month < 1 || month > 12) {
        return null;
    }
    return month;
}

function sortTimelineEvents(events, activeTimelineId = null) {
    return [...events].sort((a, b) => {
        const isActiveA = activeTimelineId !== null && Number(a?.id) === Number(activeTimelineId);
        const isActiveB = activeTimelineId !== null && Number(b?.id) === Number(activeTimelineId);

        if (isActiveA !== isActiveB) {
            return isActiveA ? -1 : 1;
        }

        const monthA = toMonthNumber(a?.month) || 13;
        const monthB = toMonthNumber(b?.month) || 13;

        if (monthA !== monthB) {
            return monthA - monthB;
        }

        const orderA = Number.parseInt(a?.sort_order, 10);
        const orderB = Number.parseInt(b?.sort_order, 10);
        const safeOrderA = Number.isFinite(orderA) ? orderA : 0;
        const safeOrderB = Number.isFinite(orderB) ? orderB : 0;

        if (safeOrderA !== safeOrderB) {
            return safeOrderA - safeOrderB;
        }

        return Number(a?.id || 0) - Number(b?.id || 0);
    });
}

function pickActiveTimelineEvent(events, currentMonth) {
    if (!events.length) return null;

    const inCurrentMonth = events.find((event) => toMonthNumber(event.month) === currentMonth);
    if (inCurrentMonth) {
        return inCurrentMonth;
    }

    const upcoming = events.find((event) => {
        const month = toMonthNumber(event.month);
        return month && month > currentMonth;
    });

    if (upcoming) {
        return upcoming;
    }

    return events[0];
}

export default function TimelineManagement() {
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [annualEventOptions, setAnnualEventOptions] = useState([]);
    const [loadingEventOptions, setLoadingEventOptions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({ month: '', status: 'all' });

    const fetchTimelineEvents = useCallback(async (nextFilters = filters) => {
        setLoading(true);
        setError('');

        try {
            const params = { limit: 500 };
            if (nextFilters.month) {
                params.month = nextFilters.month;
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
        () => sortTimelineEvents(timelineEvents, activeTimelineId),
        [timelineEvents, activeTimelineId]
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

    function handleEdit(item) {
        setEditingId(item.id);
        setForm({
            month: item.month,
            event_name: item.event_name || '',
            summary: item.summary || '',
            sort_order: Number(item.sort_order || 0),
            is_published: !!item.is_published,
        });
    }

    async function handleDelete(item) {
        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa sự kiện: ${item.event_name}?`);
        if (!confirmDelete) {
            return;
        }

        try {
            await timelineAPI.delete(item.id);
            await fetchTimelineEvents();
            if (editingId === item.id) {
                resetForm();
            }
        } catch (err) {
            alert('Xóa sự kiện thất bại: ' + err.message);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const month = toMonthNumber(form.month);
        if (!month) {
            alert('Tháng không hợp lệ, vui lòng chọn từ 1 đến 12.');
            return;
        }

        if (!form.event_name.trim()) {
            alert('Tên sự kiện là bắt buộc.');
            return;
        }

        const payload = {
            month,
            event_name: form.event_name.trim(),
            summary: form.summary?.trim() || null,
            sort_order: Number.parseInt(form.sort_order, 10) || 0,
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
            resetForm();
        } catch (err) {
            alert('Lưu timeline thất bại: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="timeline-management-page">
            <div className="timeline-management-header">
                <h1 className="timeline-management-title">Quản lý timeline thường niên</h1>
                <p className="timeline-management-subtitle">
                    Chỉ quản lý các mốc sự kiện thường niên theo tháng để hiển thị trên homepage.
                </p>
            </div>

            <div className="timeline-management-grid">
                <section className="timeline-management-card timeline-management-card--form">
                    <h2 className="timeline-management-card__title">
                        {editingId ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
                    </h2>

                    <form className="timeline-form" onSubmit={handleSubmit}>
                        <label className="timeline-form__field">
                            <span>Tháng</span>
                            <select
                                value={form.month}
                                onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))}
                                required
                            >
                                <option value="">Chọn tháng</option>
                                {MONTH_OPTIONS.map((monthOption) => (
                                    <option key={monthOption.value} value={monthOption.value}>
                                        {monthOption.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="timeline-form__field">
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

                        <label className="timeline-form__field">
                            <span>Nội dung tóm tắt</span>
                            <textarea
                                rows={4}
                                value={form.summary}
                                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                                placeholder="Mô tả ngắn gọn cho timeline homepage"
                            />
                        </label>

                        <label className="timeline-form__field">
                            <span>Thứ tự trong tháng</span>
                            <input
                                type="number"
                                value={form.sort_order}
                                onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
                                placeholder="0"
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
                            <button type="button" className="timeline-btn timeline-btn--ghost" onClick={resetForm} disabled={saving}>
                                Làm mới
                            </button>
                        </div>
                    </form>
                </section>

                <section className="timeline-management-card timeline-management-card--list">
                    <div className="timeline-list-header">
                        <h2 className="timeline-management-card__title">Danh sách timeline</h2>
                        <div className="timeline-list-filters">
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
                            >
                                <option value="">Tất cả tháng</option>
                                {MONTH_OPTIONS.map((monthOption) => (
                                    <option key={monthOption.value} value={monthOption.value}>
                                        {monthOption.label}
                                    </option>
                                ))}
                            </select>
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
                                        <span className="timeline-vertical-card__month">Tháng {eventMonth}</span>
                                        <span className={`timeline-status ${isActive ? 'timeline-status--active' : item.is_published ? 'timeline-status--published' : 'timeline-status--draft'}`}>
                                            {statusLabel}
                                        </span>
                                    </div>

                                    <h3 className="timeline-vertical-card__title">{item.event_name}</h3>
                                    <p className="timeline-vertical-card__summary">{item.summary || 'Chưa có nội dung tóm tắt.'}</p>

                                    <div className="timeline-vertical-card__footer">
                                        <span className="timeline-vertical-card__order">Thứ tự: {item.sort_order || 0}</span>
                                        <div className="timeline-table__actions">
                                            <button type="button" className="timeline-btn timeline-btn--ghost" onClick={() => handleEdit(item)}>
                                                Sửa
                                            </button>
                                            <button type="button" className="timeline-btn timeline-btn--danger" onClick={() => handleDelete(item)}>
                                                Xóa
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
        </div>
    );
}
