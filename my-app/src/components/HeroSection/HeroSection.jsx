import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import { ChevronLeftIcon, ChevronRightIcon } from '../../SvgIcons';
import { formatVietnameseDate } from '../../utils/date';

const HeroSection = ({ slides, currentIndex, onPrev, onNext, onDotClick }) => {
    const navigate = useNavigate();
    
    if (!slides || slides.length === 0) return null;
    
    const activeHero = slides[currentIndex] || {
        title: 'TIN NỔI BẬT MỚI NHẤT',
        image: '',
        summary: 'Theo dõi các thông tin nổi bật mới nhất từ Tin tức, Sự kiện thường niên và Sự kiện không thường niên.',
        categoryLabel: 'Nổi bật',
        date: null,
        link: '/news'
    };

    return (
        <div className="hero-section" onClick={() => navigate(activeHero.link)}>
            <img className="hero-section__image" src={activeHero.image} alt={activeHero.title} />
            <div className="hero-section__overlay" />
            <div className="hero-section__content">
                <div className="hero-section__meta">
                    <span className="hero-section__badge">{activeHero.categoryLabel}</span>
                    <span className="hero-section__date">
                        {formatVietnameseDate(activeHero.date)}
                    </span>
                </div>
                <h2 className="hero-section__title">{activeHero.title}</h2>
                <p className="hero-section__summary">{activeHero.summary}</p>
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        type="button"
                        className="hero-section__control hero-section__control--prev"
                        onClick={(event) => {
                            event.stopPropagation();
                            onPrev();
                        }}
                        aria-label="Slide trước"
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        type="button"
                        className="hero-section__control hero-section__control--next"
                        onClick={(event) => {
                            event.stopPropagation();
                            onNext();
                        }}
                        aria-label="Slide kế tiếp"
                    >
                        <ChevronRightIcon />
                    </button>
                    <div className="hero-section__dots">
                        {slides.map((slide, idx) => (
                            <button
                                key={slide.id || idx}
                                type="button"
                                className={`hero-section__dot ${idx === currentIndex ? 'hero-section__dot--active' : ''}`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDotClick(idx);
                                }}
                                aria-label={`Đi tới slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default HeroSection;
