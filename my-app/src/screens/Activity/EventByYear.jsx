import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './EventByYear.css';
import { activitiesAPI, newsAPI } from '../../services/api';

const EventByYear = () => {
    const { eventName } = useParams();
    const [activity, setActivity] = useState(null);
    const [yearGroups, setYearGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch activity info by slug
        activitiesAPI.getBySlug(eventName)
            .then(data => setActivity(data))
            .catch(() => {});

        // Fetch all news in this activity's category, group by year
        newsAPI.getAll({ category_slug: eventName, limit: 500 })
            .then(data => {
                const posts = Array.isArray(data) ? data : [];
                const yearMap = {};
                posts.forEach(p => {
                    const y = p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear();
                    if (!yearMap[y]) yearMap[y] = { year: y, count: 0, thumbnail: null };
                    yearMap[y].count++;
                    if (!yearMap[y].thumbnail) yearMap[y].thumbnail = p.thumbnail;
                });
                setYearGroups(Object.values(yearMap).sort((a, b) => b.year - a.year));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [eventName]);

    return (
        <div className="event-year-page">
            {/* Main Content */}
            <div className="event-year-content">
                <div className="content-wrapper">
                    {/* Event Info Section */}
                    <div className="event-info-section">
                        <div className="event-main-image">
                            <div className="event-image-border">
                                {activity?.thumbnail
                                    ? <img src={activity.thumbnail} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <div className="event-image-placeholder"></div>
                                }
                            </div>
                        </div>
                        <div className="event-details">
                            <h2 className="event-details-title">
                                {activity ? `GIỚI THIỆU VỀ ${activity.title.toUpperCase()}` : 'ĐANG TẢI...'}
                            </h2>
                            <p className="event-details-description">
                                {activity?.description || ''}
                            </p>
                        </div>
                    </div>

                    {/* Events by Year Section */}
                    <div className="events-by-year-section">
                        <div className="section-header">
                            <h2 className="section-title">HOẠT ĐỘNG THEO NĂM</h2>
                        </div>

                        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Đang tải...</p>}
                        {!loading && yearGroups.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#888' }}>Chưa có bài đăng nào</p>
                        )}
                        <div className="year-events-grid">
                            {yearGroups.map(group => (
                                <Link
                                    key={group.year}
                                    to={`/activity/${eventName}/${group.year}`}
                                    className="year-event-card"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="year-event-image">
                                        {group.thumbnail && (
                                            <img src={group.thumbnail} alt={String(group.year)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <h3 className="year-event-title">
                                        {activity ? `${activity.title.toUpperCase()} NĂM ${group.year}` : `NĂM ${group.year}`}
                                    </h3>
                                    <p className="year-event-description">{group.count} bài đăng</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventByYear;
