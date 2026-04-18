import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsAPI } from '../../../services/api';
import { PostDetail as PostDetailComponent } from '../../../components';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        newsAPI.getById(id)
            .then(data => {
                setPost(data);
                return newsAPI.getAll({ page_type: 'news', limit: 4 });
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
            sectionLabel="Tin tức"
            sectionPath="/news"
            relatedTitle="BÀI VIẾT LIÊN QUAN"
            onBack={() => navigate('/news')}
            getRelatedTo={(related) => `/news/${related.id}`}
            loadingText="Đang tải bài viết..."
        />
    );
};

export default NewsDetail;
