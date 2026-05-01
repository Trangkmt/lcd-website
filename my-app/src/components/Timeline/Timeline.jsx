import React from 'react';
import './Timeline.css';
import {
    toMonthNumber,
    getTimelineYear,
    sortTimelineEvents,
    pickActiveTimelineEvent,
} from '../../utils/timeline';

const Timeline = ({
    events = [],
    title = 'LỊCH TRÌNH THƯỜNG NIÊN',
    emptyText = 'Chưa có dữ liệu timeline.',
    loading = false,
    loadingText = 'Đang tải...',
    maxItems,
    layout = 'sidebar',
    showSectionHeader = true,
    className = '',
}) => {
    const referenceDate = new Date();
    const currentMonth = referenceDate.getMonth() + 1;
    const sortedEvents = sortTimelineEvents(
        Array.isArray(events) ? events.filter((event) => toMonthNumber(event?.month)) : [],
        referenceDate
    );
    const timelineDisplayEvents = Number.isInteger(maxItems)
        ? sortedEvents.slice(0, Math.max(0, maxItems))
        : sortedEvents;
    const activeTimelineEvent = pickActiveTimelineEvent(sortedEvents, currentMonth, referenceDate);

    if (layout === 'dashboard') {
        return (
            <div className={`dashboard-timeline ${className}`.trim()}>
                {loading ? (
                    <p className="dashboard-empty-state">{loadingText}</p>
                ) : timelineDisplayEvents.length === 0 ? (
                    <p className="dashboard-empty-state">{emptyText}</p>
                ) : (
                    timelineDisplayEvents.map((event, index) => {
                        const eventMonth = toMonthNumber(event.month);
                        const eventYear = getTimelineYear(event, referenceDate);
                        const isActive = Number(event.id) === Number(activeTimelineEvent?.id);
                        const isCurrentMonth = eventMonth === currentMonth;

                        return (
                            <div
                                key={event.id}
                                className={`dashboard-timeline__item ${isActive ? 'dashboard-timeline__item--active' : ''}`}
                            >
                                <div className="dashboard-timeline__marker" aria-hidden="true">
                                    <span className="dashboard-timeline__dot" />
                                    {index < timelineDisplayEvents.length - 1 && (
                                        <span className="dashboard-timeline__line" />
                                    )}
                                </div>
                                <div className="dashboard-timeline__content">
                                    <div className="dashboard-timeline__meta">
                                        <span className="dashboard-timeline__month">Tháng {eventMonth}</span>
                                        <span className="dashboard-timeline__year">Năm {eventYear}</span>
                                        {isActive && (
                                            <span className={`dashboard-timeline__status ${isCurrentMonth ? 'dashboard-timeline__status--live' : 'dashboard-timeline__status--upcoming'}`}>
                                                {isCurrentMonth ? 'Đang diễn ra' : 'Sắp diễn ra'}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="dashboard-timeline__title">{event.event_name || event.title || ''}</h3>
                                    <p className="dashboard-timeline__summary">{event.summary || 'Chưa có mô tả.'}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    }

    return (
        <div className={`timeline-section ${className}`.trim()}>
            {showSectionHeader && (
                <>
                    <b className="section-title section-title--timeline">{title}</b>
                    <div className="section-divider section-divider--timeline" aria-hidden="true" />
                </>
            )}

            <div className="timeline-track" role="list" aria-label={title}>
                {loading && (
                    <div className="timeline-empty">{loadingText}</div>
                )}

                {!loading && timelineDisplayEvents.length === 0 && (
                    <div className="timeline-empty">{emptyText}</div>
                )}

                {!loading && timelineDisplayEvents.map((event, index) => {
                    const eventMonth = toMonthNumber(event.month);
                    const eventYear = getTimelineYear(event, referenceDate);
                    const isActive = Number(event.id) === Number(activeTimelineEvent?.id);
                    const isLeft = index % 2 === 0;
                    const statusLabel = isActive
                        ? eventMonth === currentMonth
                            ? 'Đang diễn ra'
                            : 'Sắp diễn ra'
                        : '';

                    const timelineCard = (
                        <div className="timeline-item__card">
                            <div className="timeline-item__month">Năm {eventYear} • Tháng {eventMonth}</div>
                            <h3 className="timeline-item__title">{event.event_name || event.title || ''}</h3>
                            <p className="timeline-item__summary">{event.summary || ''}</p>
                            {statusLabel && <span className="timeline-item__status">{statusLabel}</span>}
                        </div>
                    );

                    return (
                        <article
                            key={event.id}
                            role="listitem"
                            className={`timeline-item ${isActive ? 'timeline-item--active' : 'timeline-item--muted'}`}
                            aria-label={`Năm ${eventYear}, tháng ${eventMonth}: ${event.event_name || event.title || ''}`}
                        >
                            {isLeft ? timelineCard : <div className="timeline-item__spacer" aria-hidden="true" />}
                            <div className="timeline-item__axis" aria-hidden="true">
                                <span className="timeline-item__dot" />
                                {index < timelineDisplayEvents.length - 1 && <span className="timeline-item__line" />}
                            </div>
                            {!isLeft ? timelineCard : <div className="timeline-item__spacer" aria-hidden="true" />}
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default Timeline;
