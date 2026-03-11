import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './EventDetail.css';
import { activitiesAPI, newsAPI } from '../../services/api';

const EventDetail = () => {
    const { eventName, year } = useParams();
    const [activity, setActivity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [yearGroups, setYearGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        activitiesAPI.getBySlug(eventName)
            .then(data => setActivity(data))
            .catch(() => {});

        // Fetch all posts in this category to build year navigation
        newsAPI.getAll({ category_slug: eventName, limit: 500 })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                const yearMap = {};
                all.forEach(p => {
                    const y = p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear();
                    if (!yearMap[y]) yearMap[y] = { year: y, count: 0, thumbnail: null };
                    yearMap[y].count++;
                    if (!yearMap[y].thumbnail) yearMap[y].thumbnail = p.thumbnail;
                });
                setYearGroups(Object.values(yearMap).sort((a, b) => b.year - a.year));
            })
            .catch(() => {});

        // Fetch posts for the selected year
        newsAPI.getAll({ category_slug: eventName, year, limit: 100 })
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [eventName, year]);

    const filtered = posts.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="event-detail-page">
            {/* Main Content */}
            <div className="event-detail-content">
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
                                {activity ? `GIỚI THIỆU VỀ ${activity.title.toUpperCase()} ${year}` : 'ĐANG TẢI...'}
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
                        <div className="year-events-grid">
                            {yearGroups.map(group => (
                                <Link
                                    key={group.year}
                                    to={`/activity/${eventName}/${group.year}`}
                                    className={`year-event-card${String(group.year) === String(year) ? ' year-event-card--active' : ''}`}
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

                    {/* Posts Section */}
                    <div className="posts-section">
                        <div className="posts-header">
                            <h2 className="posts-title">BÀI ĐĂNG NĂM {year}</h2>
                            <div className="search-bar-posts">
                                <div className="search-icon">🔍</div>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm"
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <div className="search-close" onClick={() => setSearchQuery('')} style={{ cursor: 'pointer' }}>✕</div>
                                )}
                            </div>
                        </div>

                        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Đang tải...</p>}
                        {!loading && filtered.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#888' }}>Không có bài đăng nào</p>
                        )}
                        <div className="posts-list">
                            {filtered.map(post => (
                                <Link
                                    key={post.id}
                                    to={`/activity/${eventName}/${year}/post/${post.id}`}
                                    className="post-card"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="post-image">
                                        {post.thumbnail && (
                                            <img src={post.thumbnail} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <div className="post-content">
                                        <div className="post-header">
                                            <h3 className="post-title">{post.title}</h3>
                                            <span className="post-date">
                                                {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
                                            </span>
                                            <span className="post-category">{post.category_name || ''}</span>
                                        </div>
                                        <p className="post-description">{post.summary || ''}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
