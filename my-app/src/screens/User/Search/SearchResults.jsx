import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar, PostCard } from '../../../components';
import { postsAPI } from '../../../services/api';
import './SearchResults.css';

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function getAnnualEventRoute(item) {
    return `/event/${item.category_slug}/post/${item.id}`;
}

function matchesQuery(item, normalizedQuery, fields) {
    if (!normalizedQuery) {
        return true;
    }

    return fields.some((field) => normalizeText(item?.[field]).includes(normalizedQuery));
}

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);
    const [news, setNews] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [annualPosts, setAnnualPosts] = useState([]);
    const [nonAnnualPosts, setNonAnnualPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        Promise.all([
            postsAPI.getAll({ page_type: 'news', limit: 200, search: query }),
            postsAPI.getAll({ page_type: 'achievement', limit: 200, search: query }),
            postsAPI.getAll({ page_type: 'event_annual', limit: 200, search: query }),
            postsAPI.getAll({ page_type: 'event_non_annual', limit: 200, search: query }),
        ])
            .then(([newsData, achievementData, annualData, nonAnnualData]) => {
                if (!isMounted) {
                    return;
                }

                setNews(Array.isArray(newsData) ? newsData : []);
                setAchievements(Array.isArray(achievementData) ? achievementData : []);
                setAnnualPosts(Array.isArray(annualData) ? annualData : []);
                setNonAnnualPosts(Array.isArray(nonAnnualData) ? nonAnnualData : []);
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                setNews([]);
                setAchievements([]);
                setAnnualPosts([]);
                setNonAnnualPosts([]);
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [query]);

    const normalizedQuery = useMemo(() => normalizeText(query), [query]);

    const filteredNews = useMemo(
        () => news.filter((item) => matchesQuery(item, normalizedQuery, ['title', 'summary', 'content', 'category_name'])),
        [news, normalizedQuery]
    );

    const filteredAchievements = useMemo(
        () => achievements.filter((item) => matchesQuery(item, normalizedQuery, ['title', 'summary', 'content', 'category_name'])),
        [achievements, normalizedQuery]
    );

    const filteredAnnualPosts = useMemo(
        () => annualPosts.filter((item) => matchesQuery(item, normalizedQuery, ['title', 'summary', 'content', 'category_name'])),
        [annualPosts, normalizedQuery]
    );

    const filteredNonAnnualPosts = useMemo(
        () => nonAnnualPosts.filter((item) => matchesQuery(item, normalizedQuery, ['title', 'summary', 'content', 'category_name'])),
        [nonAnnualPosts, normalizedQuery]
    );

    const totalResults = filteredNews.length
        + filteredAchievements.length
        + filteredAnnualPosts.length
        + filteredNonAnnualPosts.length;

    const handleSubmit = () => {
        const trimmedValue = inputValue.trim();
        setSearchParams(trimmedValue ? { q: trimmedValue } : {});
    };

    return (
        <div className="search-results-page">
            <section className="search-results-page__hero">
                <div className="search-results-page__hero-inner">
                    <p className="search-results-page__eyebrow">Tìm kiếm nội dung</p>
                    <h1 className="search-results-page__title">Kết quả tìm kiếm</h1>
                    <p className="search-results-page__summary">
                        {query
                            ? `Đang hiển thị ${totalResults} kết quả cho từ khóa "${query}".`
                            : 'Nhập từ khóa để tìm tin tức, thành tích và sự kiện.'}
                    </p>
                    <div className="search-results-page__searchbar">
                        <SearchBar
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            onClear={() => {
                                setInputValue('');
                                setSearchParams({});
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSubmit();
                                }
                            }}
                            placeholder="Tìm kiếm theo tiêu đề, mô tả, nội dung..."
                            variant="page"
                        />
                        <button type="button" className="search-results-page__submit" onClick={handleSubmit}>
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </section>

            <section className="search-results-page__content">
                {loading && <p className="search-results-page__empty">Đang tải dữ liệu...</p>}

                {!loading && !query && (
                    <p className="search-results-page__empty">Nhập từ khóa để bắt đầu tìm kiếm.</p>
                )}

                {!loading && query && totalResults === 0 && (
                    <p className="search-results-page__empty">Không tìm thấy nội dung phù hợp với từ khóa này.</p>
                )}

                {!loading && query && totalResults > 0 && (
                    <>
                        {filteredAnnualPosts.length > 0 && (
                            <section className="search-results-section">
                                <div className="search-results-section__header">
                                    <h2>Sự kiện thường niên</h2>
                                    <span>{filteredAnnualPosts.length} kết quả</span>
                                </div>
                                <div className="search-results-grid search-results-grid--event">
                                    {filteredAnnualPosts.map((item) => (
                                        <PostCard
                                            key={`annual-post-${item.id}`}
                                            to={getAnnualEventRoute(item)}
                                            image={item.thumbnail}
                                            category={item.category_name || ''}
                                            categorySlug={item.category_slug || ''}
                                            pageType="event_annual"
                                            date={item.published_at || item.created_at}
                                            title={item.title || ''}
                                            summary={item.summary || ''}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {filteredNonAnnualPosts.length > 0 && (
                            <section className="search-results-section">
                                <div className="search-results-section__header">
                                    <h2>Sự kiện không thường niên</h2>
                                    <span>{filteredNonAnnualPosts.length} kết quả</span>
                                </div>
                                <div className="search-results-grid search-results-grid--event">
                                    {filteredNonAnnualPosts.map((item) => (
                                        <PostCard
                                            key={`non-annual-post-${item.id}`}
                                            to={`/event/non-annual/${item.id}`}
                                            image={item.thumbnail}
                                            category={item.category_name || ''}
                                            categorySlug={item.category_slug || ''}
                                            pageType="event_non_annual"
                                            date={item.published_at || item.created_at}
                                            title={item.title || ''}
                                            summary={item.summary || ''}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {filteredNews.length > 0 && (
                            <section className="search-results-section">
                                <div className="search-results-section__header">
                                    <h2>Tin tức</h2>
                                    <span>{filteredNews.length} kết quả</span>
                                </div>
                                <div className="search-results-grid search-results-grid--news">
                                    {filteredNews.map((item) => (
                                        <PostCard
                                            key={`news-${item.id}`}
                                            to={`/news/${item.id}`}
                                            image={item.thumbnail}
                                            category={item.category_name || ''}
                                            categorySlug={item.category_slug || ''}
                                            pageType="news"
                                            date={item.published_at || item.created_at}
                                            title={item.title || ''}
                                            summary={item.summary || ''}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {filteredAchievements.length > 0 && (
                            <section className="search-results-section">
                                <div className="search-results-section__header">
                                    <h2>Thành tích</h2>
                                    <span>{filteredAchievements.length} kết quả</span>
                                </div>
                                <div className="search-results-grid search-results-grid--achievement">
                                    {filteredAchievements.map((item) => (
                                        <PostCard
                                            key={`achievement-${item.id}`}
                                            to={`/achievement/${item.id}`}
                                            image={item.thumbnail}
                                            category={item.category_name || ''}
                                            categorySlug={item.category_slug || ''}
                                            pageType="achievement"
                                            date={item.published_at || item.created_at}
                                            title={item.title || ''}
                                            summary={item.summary || ''}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}


                    </>
                )}
            </section>
        </div>
    );
}

