import React from 'react';
import { Link } from 'react-router-dom';
import './PostDetail.css';
import { LazyImage } from '../LazyImage';
import { PostCard } from '../PostCard';
import { formatVietnameseDate } from '../../utils/date';

export default function PostDetail({
    loading,
    post,
    relatedPosts = [],
    sectionLabel = 'Sự kiện',
    sectionPath = '/event',
    parentCrumb,
    currentLabel,
    relatedTitle = 'BÀI ĐĂNG LIÊN QUAN',
    getRelatedTo,
    renderMetaExtras,
    onBack,
    loadingText = 'Đang tải...',
    notFoundText = 'Không tìm thấy bài viết',
}) {
    if (loading) {
        return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-soft)' }}>{loadingText}</div>;
    }

    if (!post) {
        return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-soft)' }}>{notFoundText}</div>;
    }

    const fallbackRelatedTo = (related) => `${sectionPath}/${related.id}`;
    const resolveRelatedTo = getRelatedTo || fallbackRelatedTo;
    const currentCrumbLabel = currentLabel || post.title || 'Bài đăng';

    return (
        <div className="post-detail-page">
            <button onClick={onBack} className="back-button" type="button">
                {'← Quay lại'}
            </button>

            <div className="post-detail-content">
                <div className="content-wrapper">
                    <div className="breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span className="separator">/</span>
                        <Link to={sectionPath}>{sectionLabel}</Link>
                        {parentCrumb?.label && parentCrumb?.to && (
                            <>
                                <span className="separator">/</span>
                                <Link to={parentCrumb.to}>{parentCrumb.label}</Link>
                            </>
                        )}
                        <span className="separator">/</span>
                        <span className="current">{currentCrumbLabel}</span>
                    </div>

                    <div className="post-detail-layout">
                        <article className="post-detail-article">
                            <div className="post-header-section">

                                <h1 className="post-main-title">{post.title}</h1>
                                {post.summary && <p className="post-lead">{post.summary}</p>}
                                <div className="post-meta">
                                    {renderMetaExtras ? renderMetaExtras(post) : null}
                                    <span className="post-category-badge">{post.category_name || ''}</span>
                                    <span className="post-date-text">{formatVietnameseDate(post.published_at || post.created_at)}</span>
                                    {post.author_name && <span className="post-author">Bởi: {post.author_name}</span>}
                                </div>
                            </div>

                            {post.thumbnail && (
                                <div className="post-main-image-section">
                                    <LazyImage src={post.thumbnail} alt={post.title} className="post-main-image" />
                                </div>
                            )}

                            {post.content && (
                                <div className="post-content-section">
                                    <div className="post-content-text" dangerouslySetInnerHTML={{ __html: post.content }} />
                                </div>
                            )}
                        </article>

                        {relatedPosts.length > 0 && (
                            <aside className="post-detail-sidebar">
                                <h2 className="post-detail-related-title">{relatedTitle}</h2>
                                <div className="post-detail-related-list">
                                    {relatedPosts.map((related) => (
                                        <div key={related.id} className="post-detail-sidebar-item">
                                            <PostCard
                                                to={resolveRelatedTo(related)}
                                                image={related.thumbnail}
                                                title={related.title}
                                                date={related.published_at || related.created_at}
                                                category={related.category_name}
                                                variant="sidebar"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

