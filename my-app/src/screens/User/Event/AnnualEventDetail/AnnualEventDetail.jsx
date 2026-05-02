import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './AnnualEventDetail.css';
import { SearchBar, PostCard } from '../../../../components';
import { categoriesAPI, postsAPI } from '../../../../services/api';

function formatEventNameFromSlug(slug) {
    return String(slug || '')
        .split('-')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const AnnualEventDetail = () => {
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

        postsAPI.getAll({ category_slug: eventName, limit: 500 })
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
        <div className="event-detail-page annual-event-detail-page">
            <div className="event-detail-content">
                <div className="content-wrapper">
                    <div className="event-info-section">
                        <div className="event-main-image">
                            <div className="event-image-border">
                                {category?.intro_image
                                    ? <img src={category.intro_image} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '300px' }} />
                                    : <div className="event-image-placeholder"></div>
                                }
                            </div>
                        </div>
                        <div className="event-details">
                            <h2>
                                {`GIỚI THIỆU VỀ ${displayTitle.toUpperCase()}`}
                            </h2>
                            <p className="event-details-description">
                                {displayDescription || 'Chưa có tóm tắt danh mục.'}
                            </p>
                        </div>
                    </div>

                    <div className="posts-section">
                        <div className="posts-header">
                            <h2>TẤT CẢ BÀI ĐĂNG</h2>
                            <SearchBar
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onClear={() => setSearchQuery('')}
                                placeholder="Tìm kiếm"
                                variant="compact"
                            />
                        </div>

                        {loading && <p style={{ textAlign: 'center', color: 'var(--color-text-soft)' }}>Đang tải...</p>}
                        {!loading && filtered.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-soft)' }}>Không có bài đăng nào</p>
                        )}
                        <div className="posts-list">
                            {filtered.map(post => (
                                <PostCard
                                    key={post.id}
                                    to={`/event/${eventName}/post/${post.id}`}
                                    title={post.title}
                                    summary={post.summary}
                                    date={post.created_at}
                                    image={post.thumbnail}
                                    category={post.category_name}
                                    variant="horizontal"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnualEventDetail;

