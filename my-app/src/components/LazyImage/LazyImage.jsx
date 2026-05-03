import React, { useState, useEffect } from 'react';
import './LazyImage.css';

const LazyImage = ({ src, alt, className, ...props }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoaded(false);
        setError(false);
    }, [src]);

    return (
        <div className={`lazy-image-container ${loaded ? 'loaded' : ''} ${error ? 'error' : ''} ${className || ''}`}>
            {!loaded && !error && <div className="lazy-image-placeholder" />}
            <img
                src={src}
                alt={alt || ''}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                className={`lazy-image-img ${loaded ? 'visible' : 'hidden'}`}
                {...props}
            />
            {error && <div className="lazy-image-error">Failed to load</div>}
        </div>
    );
};

export default LazyImage;
