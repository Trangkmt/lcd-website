import React from 'react';
import { Link } from 'react-router-dom';
import { LazyImage } from '../LazyImage';
import './PostCard.css';
import { formatVietnameseDate } from '../../utils/date';

const PostCard = ({
    category,
    date,
    image,
    content,
    title,
    description,
    summary,
    to,
    pageType = '',
    categorySlug = '',
    variant = '', // 'news', 'activity', 'achievement'
    className = '',
    style,
}) => {
    const displayTitle = title || content || '';
    const displayDescription = description || summary || '';
    
    // Tự động xác định variant từ danh mục nếu không được cung cấp
    const effectiveVariant = variant || (category ? category.toLowerCase() : '');
    
    const getCategoryLink = (cat, type, slug) => {
        if (!cat) return '/';
        const encodedCat = encodeURIComponent(cat);
        const t = type || '';
        const s = slug || '';
        let url = '/';
        
        // Ưu tiên tuyệt đối theo pageType
        if (t === 'news') url = `/news?category=${encodedCat}`;
        else if (t === 'achievement') url = `/achievement?category=${encodedCat}`;
        else if (t === 'event_non_annual' || t === 'event') url = `/event/non-annual?category=${encodedCat}`;
        else if (t === 'event_annual') {
            return s ? `/event/${s}` : `/event`;
        }
        else {
            // Fallback dựa trên text nếu thiếu type (Chỉ dùng khi không có pageType)
            const c = cat.toLowerCase();
            if (c.includes('tin tức')) url = `/news?category=${encodedCat}`;
            else if (c.includes('sự kiện') || c.includes('hoạt động')) url = `/event/non-annual?category=${encodedCat}`;
            else if (c.includes('thành tích')) url = `/achievement?category=${encodedCat}`;
        }
        
        return url;
    };

    const cardClassName = [
        'post-card',
        effectiveVariant ? `post-card--${effectiveVariant}` : '',
        variant === 'horizontal' ? 'post-card--horizontal' : '',
        variant === 'sidebar' ? 'post-card--sidebar' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClassName} style={style}>
            {/* Link phủ toàn bộ Card */}
            {to && <Link to={to} className="post-card__cover-link" aria-label={displayTitle} />}
            
            <div className="post-card__background" />
            
            <div className="post-card__image-container">
                <LazyImage
                    className="post-card__image"
                    src={image}
                    alt={displayTitle || 'Post'}
                />
            </div>

            <div className='post-card__body'>
                <div className="post-card__meta">
                    {/* Badge Link được đặt z-index cao để click được */}
                    <Link 
                        to={getCategoryLink(category, pageType, categorySlug)} 
                        className="post-card__badge"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <b className="post-card__badge-text">{category || ''}</b>
                    </Link>
                    <div className="post-card__date">{formatVietnameseDate(date) || date || ''}</div>
                </div>

                <b className="post-card__title">{displayTitle}</b>
                <div className="post-card__description">{displayDescription}</div>
            </div>
        </div>
    );
};

export default PostCard;
