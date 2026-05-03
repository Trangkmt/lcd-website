import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AnnualEvent.css';
import { categoriesAPI, postsAPI } from '../../../../services/api';
import { ArrowRightIcon } from '../../../../SvgIcons';
import { LazyImage } from '../../../../components';

const AnnualEvent = () => {
    const [categories, setCategories] = useState([]);
    const [featuredByCategory, setFeaturedByCategory] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            categoriesAPI.getAll({ page_type: 'event_annual' }),
            postsAPI.getAll({ page_type: 'event_annual', is_featured: true, limit: 500 }),
        ])
            .then(([categoryData, featuredPosts]) => {
                const annualCategories = (Array.isArray(categoryData) ? categoryData : []).filter(
                    category => String(category.page_type || '').toLowerCase() === 'event_annual'
                );
                setCategories(annualCategories);

                const featuredMap = {};
                (Array.isArray(featuredPosts) ? featuredPosts : []).forEach(post => {
                    const categoryId = post?.category_id;
                    if (!categoryId || featuredMap[categoryId]) return;
                    featuredMap[categoryId] = post;
                });
                setFeaturedByCategory(featuredMap);
            })
            .catch(() => {
                setCategories([]);
                setFeaturedByCategory({});
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="annual-event-page">
            <div className="annual-event-content">
                <div className="content-wrapper">
                    <h1 className="annual-title">SỰ KIỆN THƯỜNG NIÊN</h1>
                    <p className="annual-subtitle">
                        Các sự kiện thường niên nổi bật của Liên Chi Đoàn Khoa Công nghệ Thông tin
                    </p>

                    {loading ? (
                        <p className="annual-loading">Đang tải...</p>
                    ) : categories.length === 0 ? (
                        <p className="annual-loading" style={{ color: 'var(--color-text-soft)' }}>Chưa có sự kiện thường niên nào.</p>
                    ) : (
                        <div className="annual-events-grid">
                            {categories.map(cat => {
                                const featuredPost = featuredByCategory[cat.id];
                                const displayImage = featuredPost?.thumbnail || cat.intro_image;

                                return (
                                    <Link
                                        key={cat.id}
                                        to={`/event/${cat.slug}`}
                                        className="annual-event-card"
                                    >
                                        <div className="annual-event-image">
                                            {displayImage ? (
                                                <LazyImage src={displayImage} alt={cat.name} />
                                            ) : (
                                                <div className="annual-event-image-placeholder">
                                                    <span>{cat.name.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="annual-event-info">
                                            <h3 className="annual-event-name">{cat.name}</h3>
                                            <span className="annual-event-link">
                                                Xem chi tiết
                                                <span className="annual-event-link-icon" aria-hidden="true"><ArrowRightIcon /></span>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnualEvent;
