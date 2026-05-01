import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../../../../services/api';
import { PostDetail as PostDetailComponent } from '../../../../components';

const NonAnnualEventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        postsAPI.getById(id)
            .then(data => {
                setPost(data);
                return postsAPI.getAll({ page_type: 'event_non_annual', limit: 4 });
            })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setRelatedPosts(all.filter(p => String(p.id) !== String(id)).slice(0, 3));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <PostDetailComponent
            loading={loading}
            post={post}
            relatedPosts={relatedPosts}
            sectionLabel="Sự kiện"
            sectionPath="/event"
            parentCrumb={{ label: 'Không thường niên', to: '/event/non-annual' }}
            relatedTitle="SỰ KIỆN LIÊN QUAN"
            onBack={() => navigate('/event/non-annual')}
            getRelatedTo={(related) => `/event/non-annual/${related.id}`}
            notFoundText="Không tìm thấy sự kiện"
            loadingText="Đang tải..."
        />
    );
};

export default NonAnnualEventDetail;

