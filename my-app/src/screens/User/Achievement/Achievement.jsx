import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Achievement.css';
import { postsAPI } from '../../../services/api';
import { SearchBar, PostCard, LazyImage, HeroSection } from '../../../components';

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
        postsAPI.getAll({ page_type: 'achievement', limit: 100 })
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


    return (
        <div className="achievement-page">
            <HeroSection
                slides={heroSlides.map(slide => ({
                    id: slide.id,
                    title: slide.title,
                    summary: slide.summary,
                    image: slide.thumbnail,
                    date: slide.published_at || slide.created_at,
                    categoryLabel: 'Thành tích',
                    link: `/achievement/${slide.id}`
                }))}
                currentIndex={heroIndex}
                onPrev={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                onNext={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                onDotClick={(idx) => setHeroIndex(idx)}
            />

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
                        <PostCard
                            key={item.id}
                            to={`/achievement/${item.id}`}
                            image={item.thumbnail}
                            category={item.category_name}
                            date={item.published_at || item.created_at}
                            title={item.title}
                            description={item.summary}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Achievement;

