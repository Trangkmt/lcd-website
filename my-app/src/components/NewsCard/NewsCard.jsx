import React from 'react';
import { Link } from 'react-router-dom';
import './NewsCard.css';
import { formatVietnameseDate } from '../../utils/date';

const NewsCard = ({
    category,
    date,
    image,
    content,
    title,
    description,
    summary,
    to,
    className = '',
    style,
}) => {
    const displayTitle = title || content || '';
    const displayDescription = description || summary || '';
    const cardClassName = ['news-card', className].filter(Boolean).join(' ');

    const cardContent = (
        <>
            <div className="news-card__background" />
            <img
                className="news-card__image"
                src={image || 'https://picsum.photos/300/200?random=1'}
                alt={displayTitle || 'News'}
            />
            <div className='news-card__body'>
                <div className="news-card__meta">
                    <div className="news-card__badge">
                        <b className="news-card__badge-text">{category || ''}</b>
                    </div>
                    <div className="news-card__date">{formatVietnameseDate(date) || date || ''}</div>
                </div>
                <b className="news-card__title">{displayTitle}</b>
                <div className="news-card__description">{displayDescription}</div>
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

export default NewsCard;
