import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, categoriesAPI } from '../../../../services/api';
import { SearchBar, PostCard, HeroSection } from '../../../../components';
import { SettingsIcon } from '../../../../SvgIcons';
import '../../News/News.css';

const asTimestamp = (item) => {
    const value = item?.published_at || item?.created_at;
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

const NonAnnualEvent = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [filterOpen, setFilterOpen] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        Promise.all([
            postsAPI.getAll({ page_type: 'event_non_annual', limit: 100 }),
            categoriesAPI.getAll({ page_type: 'event_non_annual' }),
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
        title: 'SỰ KIỆN KHÔNG THƯỜNG NIÊN MỚI NHẤT',
        summary: 'Tổng hợp các sự kiện không thường niên mới nhất của Liên Chi Đoàn khoa.',
        published_at: null,
    };
    const heroLink = activeHero.id ? `/event/non-annual/${activeHero.id}` : '/event/non-annual';

    return (
        <div className="news-page">
            <HeroSection
                slides={heroSlides.map(slide => ({
                    id: slide.id,
                    title: slide.title,
                    summary: slide.summary,
                    image: slide.thumbnail,
                    date: slide.published_at || slide.created_at,
                    categoryLabel: 'Sự kiện',
                    link: `/event/non-annual/${slide.id}`
                }))}
                currentIndex={heroIndex}
                onPrev={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                onNext={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                onDotClick={(idx) => setHeroIndex(idx)}
            />

            <div className="news-page__content">
                <div className="news-page__controls">
                    <SearchBar
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        placeholder="Tìm kiếm sự kiện..."
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

                <h2 className="news-page__title">SỰ KIỆN KHÔNG THƯỜNG NIÊN</h2>

                {loading && <p className="news-page__empty">Đang tải...</p>}
                {!loading && filtered.length === 0 && (
                    <p className="news-page__empty">Không có sự kiện nào</p>
                )}

                <div className="news-grid">
                    {filtered.map(item => (
                        <PostCard
                            key={item.id}
                            to={`/event/non-annual/${item.id}`}
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

export default NonAnnualEvent;
