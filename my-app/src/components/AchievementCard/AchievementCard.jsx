import React from 'react';
import { Link } from 'react-router-dom';
import './AchievementCard.css';
import { formatVietnameseDate } from '../../utils/date';

export default function AchievementCard({ achievement, to, className = '', style }) {
    if (!achievement) {
        return null;
    }

    const href = to || `/achievement/${achievement.id}`;
    const imageSrc = achievement.thumbnail || `https://picsum.photos/400/280?random=${achievement.id}`;
    const cardClassName = ['achievement-card', className].filter(Boolean).join(' ');

    return (
        <Link to={href} className={cardClassName} style={style || { textDecoration: 'none', color: 'inherit' }}>
            <div className="achievement-card__background" />
            <img className="achievement-card__image" src={imageSrc} alt={achievement.title || 'Achievement'} />
            <b className="achievement-card__title">{achievement.title || ''}</b>
            <div className="achievement-card__date">{formatVietnameseDate(achievement.published_at || achievement.created_at)}</div>
        </Link>
    );
}
