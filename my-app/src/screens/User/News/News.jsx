import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './News.css';
import { postsAPI, categoriesAPI } from '../../../services/api';
import { SearchBar, PostCard, LazyImage, HeroSection } from '../../../components';
import { SettingsIcon } from '../../../SvgIcons';

const asTimestamp = (item) => {
    const value = item?.published_at || item?.created_at;
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

const News = () => {
    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [filterOpen, setFilterOpen] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);

    const location = useLocation();
    
    useEffect(() => {
        Promise.all([
            postsAPI.getAll({ page_type: 'news', limit: 100 }),
            categoriesAPI.getAll({ page_type: 'news' }),
        ])
            .then(([newsData, catsData]) => {
                setNews(Array.isArray(newsData) ? newsData : []);
                setCategories(Array.isArray(catsData) ? catsData : []);
                
                // Kiểm tra tham số category từ URL
                const queryParams = new URLSearchParams(location.search);
                const categoryParam = queryParams.get('category');
                if (categoryParam) {
                    setSelectedCategory(categoryParam);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [location.search]);

    const categoryNames = ['Tất cả', ...categories.map(c => c.name).filter(Boolean)];

    const filtered = news
        .filter(item => {
            if (selectedCategory === 'Tất cả') return true;
            const normSelected = String(selectedCategory || '').trim().toLowerCase();
            const normItemCat = String(item.category_name || '').trim().toLowerCase();
            return normSelected === normItemCat;
        })
        .filter(item => !searchQuery || (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const heroSlides = [...news]
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


    return (
        <div className="news-page">
            <HeroSection
                slides={heroSlides.map(slide => ({
                    id: slide.id,
                    title: slide.title,
                    summary: slide.summary,
                    image: slide.thumbnail,
                    date: slide.published_at || slide.created_at,
                    categoryLabel: 'Tin tức',
                    link: `/news/${slide.id}`
                }))}
                currentIndex={heroIndex}
                onPrev={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                onNext={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                onDotClick={(idx) => setHeroIndex(idx)}
            />

            <div className="news-page__content">
                {/* Controls */}
                <div className="news-page__controls">
                    <SearchBar
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        placeholder="Tìm kiếm tin tức..."
                        variant="page"
                    />

                    <div className="news-filter-wrapper">
                        <button
                            className="btn btn-secondary news-filter-btn"
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
                        <PostCard
                            key={item.id}
                            to={`/news/${item.id}`}
                            image={item.thumbnail || ''}
                            category={item.category_name || ''}
                            pageType="news"
                            date={item.published_at || item.created_at}
                            title={item.title || ''}
                            description={item.summary || ''}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default News;

