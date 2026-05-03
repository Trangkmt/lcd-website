import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../../../../services/api';
import { PostDetail as PostDetailComponent } from '../../../../components';

const PostDetail = () => {
    const { eventName, postId, id } = useParams();
    const actualId = postId || id;
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        postsAPI.getById(actualId)
            .then(data => {
                setPost(data);
                if (eventName) {
                    // Annual event
                    return postsAPI.getAll({ category_slug: eventName, limit: 10 });
                } else {
                    // Non-annual event
                    return postsAPI.getAll({ page_type: 'event_non_annual', limit: 10 });
                }
            })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setRelatedPosts(all.filter(p => String(p.id) !== String(actualId)).slice(0, 3));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [actualId, eventName]);

    const isAnnual = !!eventName;

    return (
        <PostDetailComponent
            loading={loading}
            post={post}
            relatedPosts={relatedPosts}
            sectionLabel="Sự kiện"
            sectionPath="/event"
            parentCrumb={isAnnual ? null : { label: 'Không thường niên', to: '/event/non-annual' }}
            eventName={isAnnual ? eventName : undefined}
            relatedTitle="SỰ KIỆN LIÊN QUAN"
            onBack={() => isAnnual ? navigate(-1) : navigate('/event/non-annual')}
            getRelatedTo={(related) => isAnnual 
                ? `/event/${eventName}/post/${related.id}` 
                : `/event/non-annual/${related.id}`
            }
        />
    );
};

export default PostDetail;
