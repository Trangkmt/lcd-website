import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Activity.css';
import { activitiesAPI } from '../../services/api';

const NonAnnualActivity = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        activitiesAPI.getAll({ limit: 100 })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setActivities(all.filter(a => a.category_name === 'Sự kiện không thường niên'));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = activities.filter(a =>
        !searchQuery || (a.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="activity-page">
            <div className="activity-content">
                <div className="content-wrapper">
                    {/* Search Section */}
                    <div className="search-section">
                        <div className="search-bar">
                            <div className="search-icon">🔍</div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm"
                                className="search-input"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <div className="search-close" onClick={() => setSearchQuery('')}>✕</div>
                            )}
                        </div>
                    </div>

                    <h1 className="activities-title">HOẠT ĐỘNG KHÔNG THƯỜNG NIÊN</h1>

                    <div className="activities-grid">
                        {loading && (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Đang tải...</p>
                        )}
                        {!loading && filtered.length === 0 && (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Không có hoạt động nào</p>
                        )}
                        {filtered.map(activity => (
                            <Link
                                key={activity.id}
                                to={`/activity/${activity.slug}`}
                                className="activity-box"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="activity-image">
                                    {activity.thumbnail && (
                                        <img src={activity.thumbnail} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                                <h3 className="activity-title">{activity.title}</h3>
                                <p className="activity-description">{activity.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NonAnnualActivity;
