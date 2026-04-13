import React from 'react';
import { Link } from 'react-router-dom';
import './AchievementCard.css';

function formatDate(value) {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleDateString('vi-VN');
}

export default function AchievementCard({ achievement, to }) {
    if (!achievement) {
        return null;
    }

    const href = to || `/achievement/${achievement.id}`;
    const imageSrc = achievement.thumbnail || `https://picsum.photos/400/280?random=${achievement.id}`;

    return (
        <Link to={href} className="achievement-feature-card">
            <div className="achievement-feature-card__media">
                <img className="achievement-feature-card__image" src={imageSrc} alt={achievement.title || 'Achievement'} />
            </div>
            <div className="achievement-feature-card__body">
                <div className="achievement-feature-card__meta">
                    <span className="achievement-feature-card__date">{formatDate(achievement.published_at || achievement.created_at)}</span>
                </div>
                <h3 className="achievement-feature-card__title">{achievement.title || ''}</h3>
                <p className="achievement-feature-card__summary">{achievement.summary || ''}</p>
            </div>
        </Link>
    );
}
