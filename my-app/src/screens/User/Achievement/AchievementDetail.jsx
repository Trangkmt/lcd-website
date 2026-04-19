import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsAPI } from '../../../services/api';
import { PostDetail as PostDetailComponent } from '../../../components';
import { StarIcon } from '../../../SvgIcons';

const AchievementDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        newsAPI.getById(id)
            .then(data => {
                setItem(data);
                return newsAPI.getAll({ page_type: 'achievement', limit: 4 });
            })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setRelated(all.filter(p => String(p.id) !== String(id)).slice(0, 3));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <PostDetailComponent
            loading={loading}
            post={item}
            relatedPosts={related}
            sectionLabel="Thành tích"
            sectionPath="/achievement"
            relatedTitle="THÀNH TÍCH KHÁC"
            onBack={() => navigate('/achievement')}
            getRelatedTo={(entry) => `/achievement/${entry.id}`}
            notFoundText="Không tìm thấy thành tích"
            loadingText="Đang tải..."
            renderMetaExtras={(entry) => (
                entry.is_featured ? (
                    <span className="post-detail-featured-badge">
                        <span className="post-detail-featured-badge__icon" aria-hidden="true"><StarIcon /></span>
                        Nổi bật
                    </span>
                ) : null
            )}
        />
    );
};

export default AchievementDetail;
