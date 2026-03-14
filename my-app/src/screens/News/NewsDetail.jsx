import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './NewsDetail.css';
import { newsAPI } from '../../services/api';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        newsAPI.getById(id)
            .then(data => {
                setPost(data);
                return newsAPI.getAll({ page_type: 'news', limit: 4 });
            })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setRelatedPosts(all.filter(p => String(p.id) !== String(id)).slice(0, 3));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="news-detail-loading">
                <div className="news-detail-spinner" />
                <p>Đang tải bài viết...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="news-detail-notfound">
                <h2>Không tìm thấy bài viết</h2>
                <button onClick={() => navigate('/news')} className="news-detail-back-btn">
                    ← Quay lại Tin tức
                </button>
            </div>
        );
    }

    return (
        <div className="news-detail-page">
            {/* Header Banner */}
            <div className="news-detail-banner">
                <div className="news-detail-banner-overlay" />
                <h1 className="news-detail-banner-title">TIN TỨC</h1>
            </div>

            <div className="news-detail-outer">
                {/* Breadcrumb */}
                <nav className="news-detail-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span className="news-detail-sep">/</span>
                    <Link to="/news">Tin tức</Link>
                    <span className="news-detail-sep">/</span>
                    <span className="news-detail-current">{post.title}</span>
                </nav>

                <div className="news-detail-layout">
                    {/* Main Article */}
                    <article className="news-detail-article">
                        {/* Meta */}
                        <div className="news-detail-meta">
                            {post.category_name && (
                                <span className="news-detail-category">{post.category_name}</span>
                            )}
                            <span className="news-detail-date">
                                {post.published_at || post.created_at
                                    ? new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN', {
                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                    })
                                    : ''}
                            </span>
                            {post.author_name && (
                                <span className="news-detail-author">✍ {post.author_name}</span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="news-detail-title">{post.title}</h1>

                        {/* Summary */}
                        {post.summary && (
                            <p className="news-detail-summary">{post.summary}</p>
                        )}

                        {/* Thumbnail */}
                        {post.thumbnail && (
                            <div className="news-detail-thumbnail">
                                <img src={post.thumbnail} alt={post.title} />
                            </div>
                        )}

                        {/* Content */}
                        {post.content && (
                            <div
                                className="news-detail-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        )}

                        {/* Back Button */}
                        <div className="news-detail-footer">
                            <button onClick={() => navigate('/news')} className="news-detail-back-btn">
                                ← Quay lại Tin tức
                            </button>
                        </div>
                    </article>

                    {/* Sidebar – Related */}
                    {relatedPosts.length > 0 && (
                        <aside className="news-detail-sidebar">
                            <h3 className="news-detail-related-title">Bài viết liên quan</h3>
                            <div className="news-detail-related-list">
                                {relatedPosts.map(related => (
                                    <Link
                                        key={related.id}
                                        to={`/news/${related.id}`}
                                        className="news-detail-related-card"
                                    >
                                        <div className="news-detail-related-img">
                                            <img
                                                src={related.thumbnail || `https://picsum.photos/200/130?random=${related.id}`}
                                                alt={related.title}
                                            />
                                        </div>
                                        <div className="news-detail-related-info">
                                            <h4>{related.title}</h4>
                                            <span>
                                                {related.published_at
                                                    ? new Date(related.published_at).toLocaleDateString('vi-VN')
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

export default NewsDetail;
