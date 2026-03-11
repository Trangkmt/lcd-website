import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './PostDetail.css';
import { newsAPI } from '../../services/api';

const PostDetail = () => {
    const { eventName, year, postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        newsAPI.getById(postId)
            .then(data => {
                setPost(data);
                // Fetch related posts from same category
                return newsAPI.getAll({ category_slug: eventName, limit: 10 });
            })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setRelatedPosts(all.filter(p => String(p.id) !== String(postId)).slice(0, 3));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [postId, eventName]);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Đang tải...</div>;
    if (!post) return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Không tìm thấy bài viết</div>;

    return (
        <div className="post-detail-page">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="back-button">
                ← Quay lại
            </button>

            {/* Main Content */}
            <div className="post-detail-content">
                <div className="content-wrapper">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span className="separator">/</span>
                        <Link to="/activity">Hoạt động</Link>
                        <span className="separator">/</span>
                        <Link to={`/activity/${eventName}`}>{eventName}</Link>
                        <span className="separator">/</span>
                        <Link to={`/activity/${eventName}/${year}`}>{year}</Link>
                        <span className="separator">/</span>
                        <span className="current">Bài đăng</span>
                    </div>

                    {/* Post Header */}
                    <div className="post-header-section">
                        <div className="post-meta">
                            <span className="post-category-badge">{post.category_name || ''}</span>
                            <span className="post-date-text">
                                {post.published_at || post.created_at
                                    ? new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')
                                    : ''}
                            </span>
                            {post.author_name && (
                                <span className="post-author">Bởi: {post.author_name}</span>
                            )}
                        </div>
                        <h1 className="post-main-title">{post.title}</h1>
                        {post.summary && <p className="post-lead">{post.summary}</p>}
                    </div>

                    {/* Main Image */}
                    {post.thumbnail && (
                        <div className="post-main-image-section">
                            <img src={post.thumbnail} alt={post.title} className="post-main-image" />
                        </div>
                    )}

                    {/* Post Content */}
                    {post.content && (
                        <div className="post-content-section">
                            <div
                                className="post-content-text"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    )}

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="related-posts-section">
                            <h2 className="related-title">BÀI ĐĂNG LIÊN QUAN</h2>
                            <div className="related-posts-grid">
                                {relatedPosts.map(related => (
                                    <Link
                                        key={related.id}
                                        to={`/activity/${eventName}/${year}/post/${related.id}`}
                                        className="related-post-card"
                                    >
                                        <div className="related-post-image-wrapper">
                                            {related.thumbnail && (
                                                <img src={related.thumbnail} alt={related.title} className="related-post-image" />
                                            )}
                                        </div>
                                        <div className="related-post-info">
                                            <h3 className="related-post-title">{related.title}</h3>
                                            <span className="related-post-date">
                                                {related.created_at ? new Date(related.created_at).toLocaleDateString('vi-VN') : ''}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
