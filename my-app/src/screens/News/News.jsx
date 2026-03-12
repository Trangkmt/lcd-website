import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './News.css';
import { newsAPI, categoriesAPI } from '../../services/api';

const News = () => {
    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        Promise.all([
            newsAPI.getAll({ page_type: 'news', limit: 100 }),
            categoriesAPI.getAll({ page_type: 'news' }),
        ])
            .then(([newsData, catsData]) => {
                setNews(Array.isArray(newsData) ? newsData : []);
                setCategories(Array.isArray(catsData) ? catsData : []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const categoryNames = ['Tất cả', ...categories.map(c => c.name).filter(Boolean)];

    const filtered = news
        .filter(item => selectedCategory === 'Tất cả' || item.category_name === selectedCategory)
        .filter(item => !searchQuery || (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="news-page">
            {/* Banner */}
            <div className="news-page__banner">
                <div className="news-page__banner-overlay" />
                <h1 className="news-page__banner-title">TIN TỨC</h1>
            </div>

            <div className="news-page__content">
                {/* Controls */}
                <div className="news-page__controls">
                    <div className="news-search-bar">
                        <span className="news-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin tức..."
                            className="news-search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <span className="news-search-clear" onClick={() => setSearchQuery('')}>✕</span>
                        )}
                    </div>

                    <div className="news-filter-wrapper">
                        <span className="news-filter-icon">⚙</span>
                        <button
                            className="news-filter-btn"
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            {selectedCategory === 'Tất cả' ? 'Lọc' : selectedCategory}
                        </button>
                        {filterOpen && (
                            <div className="news-filter-menu">
                                {categoryNames.map((cat, i) => (
                                    <div
                                        key={i}
                                        className={`news-filter-option${selectedCategory === cat ? ' news-filter-option--active' : ''}`}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setFilterOpen(false);
                                        }}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="news-page__title">TIN TỨC &amp; SỰ KIỆN</h2>

                {loading && <p className="news-page__empty">Đang tải...</p>}
                {!loading && filtered.length === 0 && (
                    <p className="news-page__empty">Không có tin tức nào</p>
                )}

                {/* News Grid */}
                <div className="news-grid">
                    {filtered.map(item => (
                        <Link key={item.id} to={`/news/${item.id}`} className="news-card-item">
                            <div className="news-card-item__image">
                                <img
                                    src={item.thumbnail || `https://picsum.photos/400/250?random=${item.id}`}
                                    alt={item.title}
                                />
                            </div>
                            <div className="news-card-item__body">
                                <div className="news-card-item__meta">
                                    {item.category_name && (
                                        <span className="news-card-item__category">{item.category_name}</span>
                                    )}
                                    <span className="news-card-item__date">
                                        {item.published_at
                                            ? new Date(item.published_at).toLocaleDateString('vi-VN')
                                            : ''}
                                    </span>
                                </div>
                                <h3 className="news-card-item__title">{item.title}</h3>
                                <p className="news-card-item__summary">{item.summary}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default News;
