import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Achievement.css';
import { newsAPI } from '../../../services/api';
import AchievementCard from '../../../components/AchievementCard/AchievementCard';
import { SearchBar } from '../../../components';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../SvgIcons';

const asTimestamp = (item) => {
    const value = item?.published_at || item?.created_at;
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

const Achievement = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        newsAPI.getAll({ page_type: 'achievement', limit: 100 })
            .then(data => setAchievements(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = achievements.filter(item =>
        !searchQuery || (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const heroSlides = [...achievements]
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
        title: 'THANH TICH NOI BAT MOI NHAT',
        summary: 'Cap nhat nhung thanh tich moi nhat cua Lien Chi doan khoa.',
        thumbnail: 'https://picsum.photos/1600/620?random=220',
        published_at: null,
    };
    const heroLink = activeHero.id ? `/achievement/${activeHero.id}` : '/achievement';

    return (
        <div className="achievement-page">
            <div className="achievement-page__hero achievement-page__hero--banner">
                <Link to={heroLink} className="achievement-page__hero-link">
                    <img
                        className="achievement-page__hero-image"
                        src={activeHero.thumbnail || `https://picsum.photos/1600/620?random=${activeHero.id || 220}`}
                        alt={activeHero.title}
                    />
                    <div className="achievement-page__hero-overlay" />
                    <div className="achievement-page__hero-content">
                        <span className="achievement-page__hero-badge">Thành tích</span>
                        <h1 className="achievement-page__hero-title">{activeHero.title}</h1>
                        <p className="achievement-page__hero-summary">{activeHero.summary}</p>
                    </div>
                </Link>

                {heroSlides.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="achievement-page__hero-control achievement-page__hero-control--prev"
                            onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                            aria-label="Slide trước"
                        >
                            <ChevronLeftIcon />
                        </button>
                        <button
                            type="button"
                            className="achievement-page__hero-control achievement-page__hero-control--next"
                            onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                            aria-label="Slide kế tiếp"
                        >
                            <ChevronRightIcon />
                        </button>
                        <div className="achievement-page__hero-dots">
                            {heroSlides.map((slide, idx) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    className={`achievement-page__hero-dot${idx === heroIndex ? ' achievement-page__hero-dot--active' : ''}`}
                                    onClick={() => setHeroIndex(idx)}
                                    aria-label={`Đi tới slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="achievement-page__content">
                {/* Search */}
                <div className="achievement-page__controls">
                    <SearchBar
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        placeholder="Tìm kiếm thành tích..."
                        variant="page"
                    />
                </div>

                <h2 className="achievement-page__title">
                    CÁC THÀNH TÍCH NỔI BẬT CỦA LIÊN CHI ĐOÀN
                </h2>

                {loading && <p className="achievement-page__empty">Đang tải...</p>}
                {!loading && filtered.length === 0 && (
                    <p className="achievement-page__empty">Không có thành tích nào</p>
                )}

                {/* Achievement Grid */}
                <div className="achievement-grid">
                    {filtered.map(item => (
                        <AchievementCard
                            key={item.id}
                            achievement={item}
                            to={`/achievement/${item.id}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Achievement;
