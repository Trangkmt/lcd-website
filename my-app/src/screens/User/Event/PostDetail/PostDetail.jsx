import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../../../../services/api';
import { PostDetail as PostDetailComponent } from '../../../../components';

const PostDetail = () => {
    const { eventName, postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        postsAPI.getById(postId)
            .then(data => {
                setPost(data);
                // Fetch related posts from same category
                return postsAPI.getAll({ category_slug: eventName, limit: 10 });
            })
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setRelatedPosts(all.filter(p => String(p.id) !== String(postId)).slice(0, 3));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [postId, eventName]);

    return (
        <PostDetailComponent
            loading={loading}
            post={post}
            relatedPosts={relatedPosts}
            eventName={eventName}
            onBack={() => navigate(-1)}
        />
    );
};

export default PostDetail;
