import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './NonAnnualActivityDetail.css';
import { activitiesAPI } from '../../services/api';

const NonAnnualActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        activitiesAPI.getById(id)
            .then(data => {
                setActivity(data);
                return activitiesAPI.getAll({ limit: 20 });
            })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setRelated(
                    all
                        .filter(a => a.category_name === 'Sự kiện không thường niên' && String(a.id) !== String(id))
                        .slice(0, 3)
                );
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="na-detail-loading">
                <div className="na-detail-spinner" />
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="na-detail-notfound">
                <h2>Không tìm thấy hoạt động</h2>
                <button onClick={() => navigate('/activity/non-annual')} className="na-detail-back-btn">
                    ← Quay lại
                </button>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="na-detail-page">
            {/* Banner */}
            <div className="na-detail-banner">
                <div className="na-detail-banner-overlay" />
                <h1 className="na-detail-banner-title">HOẠT ĐỘNG KHÔNG THƯỜNG NIÊN</h1>
            </div>

            <div className="na-detail-outer">
                {/* Breadcrumb */}
                <nav className="na-detail-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>/</span>
                    <Link to="/activity">Hoạt động</Link>
                    <span>/</span>
                    <Link to="/activity/non-annual">Không thường niên</Link>
                    <span>/</span>
                    <span className="na-detail-crumb-current">{activity.title}</span>
                </nav>

                <div className="na-detail-layout">
                    {/* Main article */}
                    <article className="na-detail-article">
                        {/* Meta */}
                        <div className="na-detail-meta">
                            {activity.category_name && (
                                <span className="na-detail-category">{activity.category_name}</span>
                            )}
                            {activity.start_date && (
                                <span className="na-detail-date">
                                    {formatDate(activity.start_date)}
                                    {activity.end_date && activity.end_date !== activity.start_date &&
                                        ` – ${formatDate(activity.end_date)}`}
                                </span>
                            )}
                            {activity.location && (
                                <span className="na-detail-location">📍 {activity.location}</span>
                            )}
                        </div>

                        <h1 className="na-detail-title">{activity.title}</h1>

                        {activity.description && (
                            <p className="na-detail-summary">{activity.description}</p>
                        )}

                        {activity.thumbnail && (
                            <div className="na-detail-thumbnail">
                                <img src={activity.thumbnail} alt={activity.title} />
                            </div>
                        )}

                        {activity.content && (
                            <div
                                className="na-detail-content"
                                dangerouslySetInnerHTML={{ __html: activity.content }}
                            />
                        )}

                        {activity.organizer && (
                            <div className="na-detail-organizer">
                                <strong>Ban tổ chức:</strong> {activity.organizer}
                            </div>
                        )}

                        <div className="na-detail-footer">
                            <button onClick={() => navigate('/activity/non-annual')} className="na-detail-back-btn">
                                ← Quay lại
                            </button>
                        </div>
                    </article>

                    {/* Sidebar */}
                    {related.length > 0 && (
                        <aside className="na-detail-sidebar">
                            <h3 className="na-detail-related-title">Hoạt động khác</h3>
                            <div className="na-detail-related-list">
                                {related.map(r => (
                                    <Link
                                        key={r.id}
                                        to={`/activity/non-annual/${r.id}`}
                                        className="na-detail-related-card"
                                    >
                                        <div className="na-detail-related-img">
                                            <img
                                                src={r.thumbnail || `https://picsum.photos/200/130?random=${r.id}`}
                                                alt={r.title}
                                            />
                                        </div>
                                        <div className="na-detail-related-info">
                                            <h4>{r.title}</h4>
                                            <span>{formatDate(r.start_date)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NonAnnualActivityDetail;
