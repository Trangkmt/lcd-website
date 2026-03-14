import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './AchievementDetail.css';
import { newsAPI } from '../../services/api';

const AchievementDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        newsAPI.getById(id)
            .then(data => {
                setItem(data);
                return newsAPI.getAll({ page_type: 'achievement', limit: 4 });
            })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setRelated(all.filter(p => String(p.id) !== String(id)).slice(0, 3));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="ach-detail-loading">
                <div className="ach-detail-spinner" />
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="ach-detail-notfound">
                <h2>Không tìm thấy thành tích</h2>
                <button onClick={() => navigate('/achievement')} className="ach-detail-back-btn">
                    ← Quay lại Thành tích
                </button>
            </div>
        );
    }

    return (
        <div className="ach-detail-page">
            {/* Banner */}
            <div className="ach-detail-banner">
                <div className="ach-detail-banner-overlay" />
                <h1 className="ach-detail-banner-title">THÀNH TÍCH NỔI BẬT</h1>
            </div>

            <div className="ach-detail-outer">
                {/* Breadcrumb */}
                <nav className="ach-detail-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span className="ach-detail-sep">/</span>
                    <Link to="/achievement">Thành tích</Link>
                    <span className="ach-detail-sep">/</span>
                    <span className="ach-detail-current">{item.title}</span>
                </nav>

                <div className="ach-detail-layout">
                    {/* Main */}
                    <article className="ach-detail-article">
                        {/* Featured badge & meta */}
                        <div className="ach-detail-meta">
                            {item.is_featured ? (
                                <span className="ach-detail-badge-featured">⭐ Nổi bật</span>
                            ) : null}
                            {item.category_name && (
                                <span className="ach-detail-category">{item.category_name}</span>
                            )}
                            <span className="ach-detail-date">
                                {item.published_at || item.created_at
                                    ? new Date(item.published_at || item.created_at).toLocaleDateString('vi-VN', {
                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                    })
                                    : ''}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="ach-detail-title">{item.title}</h1>

                        {/* Summary */}
                        {item.summary && (
                            <p className="ach-detail-summary">{item.summary}</p>
                        )}

                        {/* Thumbnail */}
                        {item.thumbnail && (
                            <div className="ach-detail-thumbnail">
                                <img src={item.thumbnail} alt={item.title} />
                            </div>
                        )}

                        {/* Content */}
                        {item.content && (
                            <div
                                className="ach-detail-content"
                                dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                        )}

                        {/* Footer */}
                        <div className="ach-detail-footer">
                            <button onClick={() => navigate('/achievement')} className="ach-detail-back-btn">
                                ← Quay lại Thành tích
                            </button>
                        </div>
                    </article>

                    {/* Sidebar */}
                    {related.length > 0 && (
                        <aside className="ach-detail-sidebar">
                            <h3 className="ach-detail-related-title">Thành tích khác</h3>
                            <div className="ach-detail-related-list">
                                {related.map(r => (
                                    <Link
                                        key={r.id}
                                        to={`/achievement/${r.id}`}
                                        className="ach-detail-related-card"
                                    >
                                        <div className="ach-detail-related-img">
                                            <img
                                                src={r.thumbnail || `https://picsum.photos/200/130?random=${50 + r.id}`}
                                                alt={r.title}
                                            />
                                        </div>
                                        <div className="ach-detail-related-info">
                                            <h4>{r.title}</h4>
                                            <span>
                                                {r.published_at
                                                    ? new Date(r.published_at).toLocaleDateString('vi-VN')
                                                    : ''}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementDetail;
