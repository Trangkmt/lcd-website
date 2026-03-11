import React from 'react';
import './NewsCard.css';

const NewsCard = ({ category, date, image, content }) => {
    return (
        <div className="news-card">
            <div className="news-image" style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div className="news-info">
                <span className="news-category">{category}</span>
                <span className="news-date">{date}</span>
            </div>
            <div className="news-text">{content}</div>
        </div>
    );
};

export default NewsCard;
