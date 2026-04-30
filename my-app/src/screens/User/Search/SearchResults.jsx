import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../../../components';
import NewsCard from '../../../components/NewsCard/NewsCard';
import AchievementCard from '../../../components/AchievementCard/AchievementCard';
import ActivityCard from '../../../components/ActivityCard/ActivityCard';
import { activitiesAPI, newsAPI } from '../../../services/api';
import './SearchResults.css';

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function getAnnualPostRoute(item) {
    return `/activity/${item.category_slug}/post/${item.id}`;
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
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        Promise.all([
            newsAPI.getAll({ page_type: 'post', limit: 200 }),
            newsAPI.getAll({ page_type: 'achievement', limit: 200 }),
            newsAPI.getAll({ page_type: 'activity_annual', limit: 200 }),
            newsAPI.getAll({ page_type: 'activity_non_annual', limit: 200 }),
            activitiesAPI.getAll({ limit: 200 }),
        ])
            .then(([newsData, achievementData, annualData, nonAnnualData, activityData]) => {
                if (!isMounted) {
                    return;
                }

                setNews(Array.isArray(newsData) ? newsData : []);
                setAchievements(Array.isArray(achievementData) ? achievementData : []);
                setAnnualPosts(Array.isArray(annualData) ? annualData : []);
                setNonAnnualPosts(Array.isArray(nonAnnualData) ? nonAnnualData : []);
                setActivities(Array.isArray(activityData) ? activityData : []);
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                setNews([]);
                setAchievements([]);
                setAnnualPosts([]);
                setNonAnnualPosts([]);
                setActivities([]);
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

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

    const filteredActivities = useMemo(
        () => activities.filter((item) => matchesQuery(item, normalizedQuery, ['title', 'description', 'content', 'category_name', 'location', 'organizer'])),
        [activities, normalizedQuery]
    );

    const totalResults = filteredNews.length
        + filteredAchievements.length
        + filteredAnnualPosts.length
        + filteredNonAnnualPosts.length
        + filteredActivities.length;

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
                            : 'Nhập từ khóa để tìm tin tức, thành tích và hoạt động.'}
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
                                    <h2>Hoạt động thường niên</h2>
                                    <span>{filteredAnnualPosts.length} kết quả</span>
                                </div>
                                <div className="search-results-grid search-results-grid--news">
                                    {filteredAnnualPosts.map((item) => (
                                        <NewsCard
                                            key={`annual-post-${item.id}`}
                                            to={getAnnualPostRoute(item)}
                                            image={item.thumbnail || `https://picsum.photos/400/250?random=${item.id}`}
                                            category={item.category_name || ''}
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
                                    <h2>Hoạt động không thường niên</h2>
                                    <span>{filteredNonAnnualPosts.length} kết quả</span>
                                </div>
                                <div className="search-results-grid search-results-grid--news">
                                    {filteredNonAnnualPosts.map((item) => (
                                        <NewsCard
                                            key={`non-annual-post-${item.id}`}
                                            to={`/activity/non-annual/${item.id}`}
                                            image={item.thumbnail || `https://picsum.photos/400/250?random=${item.id}`}
                                            category={item.category_name || ''}
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
                                        <NewsCard
                                            key={`news-${item.id}`}
                                            to={`/news/${item.id}`}
                                            image={item.thumbnail || `https://picsum.photos/400/250?random=${item.id}`}
                                            category={item.category_name || ''}
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
                                        <AchievementCard
                                            key={`achievement-${item.id}`}
                                            achievement={item}
                                            to={`/achievement/${item.id}`}
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
