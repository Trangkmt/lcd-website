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
    // Trạng thái lưu trữ dữ liệu
    const [achievements, setAchievements] = useState([]); // Danh sách các thành tích
    const [loading, setLoading] = useState(true);         // Trạng thái chờ tải
    const [searchQuery, setSearchQuery] = useState('');   // Từ khóa tìm kiếm
    const [heroIndex, setHeroIndex] = useState(0);        // Chỉ số của slide đang hiển thị trên đầu trang

    useEffect(() => {
        // Gọi API lấy danh sách bài viết thuộc loại 'achievement' (thành tích)
        postsAPI.getAll({ page_type: 'achievement', limit: 100 })
            .then(data => setAchievements(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = achievements.filter(item =>
        !searchQuery || (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 5 thành tích mới nhất sẽ được chọn làm Slide nổi bật (Hero Slides)
    const heroSlides = [...achievements]
        .sort((a, b) => asTimestamp(b) - asTimestamp(a)) // Sắp xếp theo thời gian mới nhất
        .slice(0, 5);

    // Tự động chuyển Slide sau mỗi 5 giây
    useEffect(() => {
        if (heroSlides.length <= 1) return undefined;
        const timer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer); // Xóa bộ đếm khi component bị đóng (unmount)
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

