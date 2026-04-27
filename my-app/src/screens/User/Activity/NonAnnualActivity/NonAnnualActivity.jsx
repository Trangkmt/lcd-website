import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../News/News.css';
import { newsAPI, categoriesAPI } from '../../../../services/api';
import NewsCard from '../../../../components/NewsCard/NewsCard';
import { SearchBar } from '../../../../components';
import { SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../../SvgIcons';

const asTimestamp = (item) => {
    const value = item?.published_at || item?.created_at;
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

const NonAnnualActivity = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [filterOpen, setFilterOpen] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        Promise.all([
            newsAPI.getAll({ page_type: 'activity_non_annual', limit: 100 }),
            categoriesAPI.getAll({ page_type: 'activity_non_annual' }),
        ])
            .then(([postsData, catsData]) => {
                setPosts(Array.isArray(postsData) ? postsData : []);
                setCategories(Array.isArray(catsData) ? catsData : []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const categoryNames = ['Tất cả', ...categories.map(c => c.name).filter(Boolean)];

    const filtered = posts
        .filter(item => selectedCategory === 'Tất cả' || item.category_name === selectedCategory)
        .filter(item => !searchQuery || (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const heroSlides = [...posts]
        .sort((a, b) => asTimestamp(b) - asTimestamp(a))
        .slice(0, 5);

    useEffect(() => {
        if (heroSlides.length <= 1) return undefined;
        const timer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    useEffect(() => {
        setHeroIndex(0);
    }, [heroSlides.length]);

    const activeHero = heroSlides[heroIndex] || {
        id: null,
        title: 'HOẠT ĐỘNG KHÔNG THƯỜNG NIÊN MỚI NHẤT',
        summary: 'Tổng hợp các hoạt động không thường niên mới nhất của Liên Chi Đoàn khoa.',
        published_at: null,
    };
    const heroLink = activeHero.id ? `/activity/non-annual/${activeHero.id}` : '/activity/non-annual';

    return (
        <div className="news-page">
            <div className="news-page__hero news-page__hero--banner">
                <Link to={heroLink} className="news-page__hero-link">
                    <img
                        className="news-page__hero-image"
                        src={activeHero.thumbnail || ''}
                        alt={activeHero.title}
                    />
                    <div className="news-page__hero-overlay" />
                    <div className="news-page__hero-content">
                        <span className="news-page__hero-badge">Hoạt động</span>
                        <h1 className="news-page__hero-title">{activeHero.title}</h1>
                        <p className="news-page__hero-summary">{activeHero.summary}</p>
                    </div>
                </Link>

                {heroSlides.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="news-page__hero-control news-page__hero-control--prev"
                            onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                            aria-label="Slide trước"
                        >
                            <ChevronLeftIcon />
                        </button>
                        <button
                            type="button"
                            className="news-page__hero-control news-page__hero-control--next"
                            onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                            aria-label="Slide kế tiếp"
                        >
                            <ChevronRightIcon />
                        </button>
                        <div className="news-page__hero-dots">
                            {heroSlides.map((slide, idx) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    className={`news-page__hero-dot${idx === heroIndex ? ' news-page__hero-dot--active' : ''}`}
                                    onClick={() => setHeroIndex(idx)}
                                    aria-label={`Đi tới slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="news-page__content">
                {/* Controls */}
                <div className="news-page__controls">
                    <SearchBar
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        placeholder="Tìm kiếm hoạt động..."
                        variant="page"
                    />

                    <div className="news-filter-wrapper">
                        <span className="news-filter-icon" aria-hidden="true"><SettingsIcon /></span>
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

                <h2 className="news-page__title">HOẠT ĐỘNG KHÔNG THƯỜNG NIÊN</h2>

                {loading && <p className="news-page__empty">Đang tải...</p>}
                {!loading && filtered.length === 0 && (
                    <p className="news-page__empty">Không có hoạt động nào</p>
                )}

                {/* Posts Grid */}
                <div className="news-grid">
                    {filtered.map(item => (
                        <NewsCard
                            key={item.id}
                            to={`/activity/non-annual/${item.id}`}
                            image={item.thumbnail || ''}
                            category={item.category_name || ''}
                            date={item.published_at || item.created_at}
                            title={item.title || ''}
                            summary={item.summary || ''}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NonAnnualActivity;
