import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './AnnualActivityDetail.css';
import { categoriesAPI, newsAPI } from '../../services/api';

function formatEventNameFromSlug(slug) {
    return String(slug || '')
        .split('-')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const AnnualActivityDetail = () => {
    const { eventName } = useParams();
    const [category, setCategory] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLoading(true);
        categoriesAPI.getBySlug(eventName)
            .then(data => setCategory(data))
            .catch(() => { });

        newsAPI.getAll({ category_slug: eventName, limit: 500 })
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [eventName]);

    const filtered = posts.filter(p =>
        !searchQuery || (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayTitle = category?.name || posts?.[0]?.category_name || formatEventNameFromSlug(eventName);
    const displayDescription = category?.description || '';

    return (
        <div className="event-detail-page annual-activity-detail-page">
            <div className="event-detail-content">
                <div className="content-wrapper">
                    <div className="event-info-section">
                        <div className="event-main-image">
                            <div className="event-image-border">
                                {category?.intro_image
                                    ? <img src={category.intro_image} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <div className="event-image-placeholder"></div>
                                }
                            </div>
                        </div>
                        <div className="event-details">
                            <h2 className="event-details-title">
                                {`GIỚI THIỆU VỀ ${displayTitle.toUpperCase()}`}
                            </h2>
                            <p className="event-details-description">
                                {displayDescription || 'Chưa có tóm tắt danh mục.'}
                            </p>
                        </div>
                    </div>

                    <div className="posts-section">
                        <div className="posts-header">
                            <h2 className="posts-title">TẤT CẢ BÀI ĐĂNG</h2>
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
                                    to={`/activity/${eventName}/post/${post.id}`}
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

export default AnnualActivityDetail;
