import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Achievement.css';
import { newsAPI } from '../../services/api';

const Achievement = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        newsAPI.getAll({ page_type: 'achievement', limit: 100 })
            .then(data => setAchievements(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = achievements.filter(item =>
        !searchQuery || (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="achievement-page">
            {/* Banner */}
            <div className="achievement-page__banner">
                <div className="achievement-page__banner-overlay" />
                <h1 className="achievement-page__banner-title">THÀNH TÍCH NỔI BẬT</h1>
            </div>

            <div className="achievement-page__content">
                {/* Search */}
                <div className="achievement-page__controls">
                    <div className="achievement-search-bar">
                        <span className="achievement-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm thành tích..."
                            className="achievement-search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <span
                                className="achievement-search-clear"
                                onClick={() => setSearchQuery('')}
                            >
                                ✕
                            </span>
                        )}
                    </div>
                </div>

                <h2 className="achievement-page__title">
                    CÁC THÀNH TÍCH NỔI BẬT CỦA LIÊN CHI ĐOÀN
                </h2>

                {loading && <p className="achievement-page__empty">Đang tải...</p>}
                {!loading && filtered.length === 0 && (
                    <p className="achievement-page__empty">Không có thành tích nào</p>
                )}

                {/* Achievement Grid */}
                <div className="achievement-grid">
                    {filtered.map(item => (
                        <Link key={item.id} to={`/achievement/${item.id}`} className="achievement-card-item">
                            <div className="achievement-card-item__image">
                                <img
                                    src={item.thumbnail || `https://picsum.photos/400/250?random=${50 + item.id}`}
                                    alt={item.title}
                                />
                                {item.is_featured && (
                                    <div className="achievement-card-item__badge">Nổi bật</div>
                                )}
                            </div>
                            <div className="achievement-card-item__body">
                                <span className="achievement-card-item__date">
                                    {item.published_at
                                        ? new Date(item.published_at).toLocaleDateString('vi-VN')
                                        : ''}
                                </span>
                                <h3 className="achievement-card-item__title">{item.title}</h3>
                                <p className="achievement-card-item__summary">{item.summary}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Achievement;
