import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AnnualActivity.css';
import { activitiesAPI } from '../../services/api';

const ANNUAL_EVENTS = [
    { label: 'Chào tân', slug: 'chao-tan' },
    { label: 'Quân sự', slug: 'quan-su' },
    { label: 'Prom cuối khoá', slug: 'prom-cuoi-khoa' },
    { label: 'Talkshow', slug: 'talkshow' },
    { label: 'Cuộc thi', slug: 'cuoc-thi' },
];

const AnnualActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        activitiesAPI.getAll({ limit: 100 })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                const annual = all.filter(a => a.category_name === 'Sự kiện thường niên');
                setActivities(annual);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Merge API data into hardcoded events
    const events = ANNUAL_EVENTS.map(ev => {
        const found = activities.find(a =>
            a.slug === ev.slug ||
            (a.title || '').toLowerCase().includes(ev.label.toLowerCase())
        );
        return {
            ...ev,
            thumbnail: found?.thumbnail || null,
            description: found?.description || '',
            slug: found?.slug || ev.slug,
        };
    });

    return (
        <div className="annual-activity-page">
            <div className="annual-activity-content">
                <div className="content-wrapper">
                    <h1 className="annual-title">HOẠT ĐỘNG THƯỜNG NIÊN</h1>
                    <p className="annual-subtitle">
                        Các sự kiện thường niên nổi bật của Liên Chi Đoàn Khoa Công nghệ Thông tin
                    </p>

                    {loading ? (
                        <p className="annual-loading">Đang tải...</p>
                    ) : (
                        <div className="annual-events-grid">
                            {events.map((ev, i) => (
                                <Link
                                    key={i}
                                    to={`/activity/${ev.slug}`}
                                    className="annual-event-card"
                                >
                                    <div className="annual-event-image">
                                        {ev.thumbnail ? (
                                            <img src={ev.thumbnail} alt={ev.label} />
                                        ) : (
                                            <div className="annual-event-image-placeholder">
                                                <span>{ev.label.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="annual-event-info">
                                        <h3 className="annual-event-name">{ev.label}</h3>
                                        {ev.description && (
                                            <p className="annual-event-desc">{ev.description}</p>
                                        )}
                                        <span className="annual-event-link">Xem chi tiết →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnualActivity;
