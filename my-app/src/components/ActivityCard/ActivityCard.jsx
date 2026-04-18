import React from 'react';
import { Link } from 'react-router-dom';
import './ActivityCard.css';
import { formatVietnameseDate } from '../../utils/date';

export default function ActivityCard({ activity, to }) {
    if (!activity) {
        return null;
    }

    const href = to || `/activity/${activity.slug || activity.id}`;
    const imageSrc = activity.thumbnail || `https://picsum.photos/420/280?random=${activity.id}`;
    const category = activity.category_name || 'Hoạt động';
    const summary = activity.description || activity.summary || '';

    return (
        <Link to={href} className="activity-card">
            <div className="activity-card__media">
                <img className="activity-card__image" src={imageSrc} alt={activity.title || 'Activity'} />
                <div className="activity-card__overlay">
                    <span className="activity-card__eyebrow">{category}</span>
                </div>
            </div>
            <div className="activity-card__body">
                <div className="activity-card__meta">
                    <span className="activity-card__date">{formatVietnameseDate(activity.start_date || activity.published_at || activity.created_at)}</span>
                    <span className="activity-card__arrow">↗</span>
                </div>
                <h3 className="activity-card__title">{activity.title || ''}</h3>
                <p className="activity-card__summary">{summary}</p>
            </div>
        </Link>
    );
}
