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
    variant = '', // 'news', 'activity', 'achievement'
    className = '',
    style,
}) => {
    const displayTitle = title || content || '';
    const displayDescription = description || summary || '';
    
    // Tự động xác định variant từ danh mục nếu không được cung cấp
    const effectiveVariant = variant || (category ? category.toLowerCase() : '');
    
    const cardClassName = [
        'post-card',
        effectiveVariant ? `post-card--${effectiveVariant}` : '',
        variant === 'horizontal' ? 'post-card--horizontal' : '',
        variant === 'sidebar' ? 'post-card--sidebar' : '',
        className
    ].filter(Boolean).join(' ');

    const cardContent = (
        <>
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
                    <div className="post-card__badge">
                        <b className="post-card__badge-text">{category || ''}</b>
                    </div>
                    <div className="post-card__date">{formatVietnameseDate(date) || date || ''}</div>
                </div>
                <b className="post-card__title">{displayTitle}</b>
                <div className="post-card__description">{displayDescription}</div>
            </div>

        </>
    );

    if (to) {
        return (
            <Link to={to} className={cardClassName} style={style || { textDecoration: 'none', color: 'inherit' }}>
                {cardContent}
            </Link>
        );
    }

    return (
        <div className={cardClassName} style={style}>
            {cardContent}
        </div>
    );
};

export default PostCard;

