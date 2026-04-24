import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Homepage.css';
import { newsAPI, timelineAPI } from '../../../services/api';
import NewsCard from '../../../components/NewsCard/NewsCard';
import AchievementCard from '../../../components/AchievementCard/AchievementCard';
import { Timeline } from '../../../components';
import { formatVietnameseDate } from '../../../utils/date';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../SvgIcons';

const getSlideRoute = (item) => {
  if (item.page_type === 'activity_annual' && item.category_slug) {
    return `/activity/${item.category_slug}/post/${item.id}`;
  }
  if (item.page_type === 'activity_non_annual') {
    return `/activity/non-annual/${item.id}`;
  }
  return `/news/${item.id}`;
};

const getSlideCategoryLabel = (item) => {
  if (item.page_type === 'activity_annual') return 'Hoạt động thường niên';
  if (item.page_type === 'activity_non_annual') return 'Hoạt động không thường niên';
  return item.category_name || 'Tin tức';
};

const mapHeroSlide = (item) => ({
  id: `${item.page_type || 'news'}-${item.id}`,
  title: item.title || '',
  image: item.thumbnail || '',
  summary: item.summary || '',
  date: item.published_at || item.created_at,
  categoryLabel: getSlideCategoryLabel(item),
  link: getSlideRoute(item)
});

const asArray = (data) => (Array.isArray(data) ? data : []);

const normalizeBool = (value) => value === true || value === 1 || value === '1';

const isAchievementPost = (item) => item?.page_type === 'achievement';

const isFeaturedPost = (item) => normalizeBool(item?.is_featured);

const asTimestamp = (item) => {
  const value = item?.published_at || item?.created_at;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
};

const Homepage = () => {
  const navigate = useNavigate();
  const [newsCards, setNewsCards] = useState([]);
  const [activityPosts, setActivityPosts] = useState([]);
  const [featuredActivity, setFeaturedActivity] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [hoveredActivityIndex, setHoveredActivityIndex] = useState(null);
  const [activityImageIndex, setActivityImageIndex] = useState(0);

  useEffect(() => {
    const activityTypes = ['activity_annual', 'activity_non_annual'];
    const allSectionTypes = ['news', 'achievement', ...activityTypes];

    Promise.all([
      ...allSectionTypes.map((pageType) =>
        newsAPI.getAll({ page_type: pageType, is_featured: true, limit: 4 })
      ),
      ...allSectionTypes.map((pageType) =>
        newsAPI.getAll({ page_type: pageType, limit: 4 })
      ),
    ])
      .then((responses) => {
        const featuredResponses = responses.slice(0, allSectionTypes.length);
        const latestResponses = responses.slice(allSectionTypes.length);

        const featured = featuredResponses.flatMap(asArray);
        const latest = latestResponses.flatMap(asArray);

        const seen = new Set();
        const merged = [...featured, ...latest].filter((item) => {
          const key = `${item.page_type || 'news'}-${item.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const sorted = merged.sort((a, b) => asTimestamp(b) - asTimestamp(a));
        setHeroSlides(sorted.slice(0, 6).map(mapHeroSlide));
      })
      .catch(() => {
        setHeroSlides([]);
      });

    // Tin tức nổi bật
    newsAPI.getAll({ page_type: 'news', is_featured: true, limit: 4 })
      .then(data => {
        const featuredNews = asArray(data).filter(isFeaturedPost).slice(0, 4);
        setNewsCards(featuredNews);
      })
      .catch(() => { });

    // Hoạt động nổi bật: gom featured từ thường niên + không thường niên
    Promise.all([
      newsAPI.getAll({ page_type: 'activity_annual', is_featured: true, limit: 4 }),
      newsAPI.getAll({ page_type: 'activity_non_annual', is_featured: true, limit: 4 }),
    ])
      .then(([annual, nonAnnual]) => {
        const merged = [...asArray(annual), ...asArray(nonAnnual)]
          .filter(isFeaturedPost)
          .sort((a, b) => asTimestamp(b) - asTimestamp(a));
        setActivityPosts(merged.slice(0, 4));
        setFeaturedActivity(merged[0] || null);
      })
      .catch(() => { });

    // Thành tích nổi bật từ trang Admin (page_type=achievement, is_featured=true)
    newsAPI.getAll({ page_type: 'achievement', is_featured: true, limit: 4 })
      .then(data => {
        const filteredAchievements = asArray(data)
          .filter(isAchievementPost)
          .filter(isFeaturedPost)
          .slice(0, 4);
        setAchievements(filteredAchievements);
      })
      .catch(() => { });

    timelineAPI.getPublic({ limit: 100 })
      .then((data) => {
        setTimelineEvents(asArray(data));
      })
      .catch(() => {
        setTimelineEvents([]);
      });
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    setHeroIndex(0);
  }, [heroSlides.length]);

  // Auto-rotate activity images
  useEffect(() => {
    if (hoveredActivityIndex !== null || activityPosts.length === 0) return;

    const timer = setInterval(() => {
      setActivityImageIndex((prev) => (prev + 1) % activityPosts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activityPosts.length, hoveredActivityIndex]);

  // Get the image to display for featured activity
  const displayedActivity = hoveredActivityIndex !== null
    ? activityPosts[hoveredActivityIndex]
    : activityPosts[activityImageIndex];

  const activeHero = heroSlides[heroIndex] || {
    title: 'TIN NỔI BẬT MỚI NHẤT',
    image: '',
    summary: 'Theo dõi các thông tin nổi bật mới nhất từ Tin tức, Hoạt động thường niên và Hoạt động không thường niên.',
    categoryLabel: 'Nổi bật',
    date: null,
    link: '/news'
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section" onClick={() => navigate(activeHero.link)}>
        <img className="hero-section__image" src={activeHero.image} alt={activeHero.title} />
        <div className="hero-section__overlay" />
        <div className="hero-section__content">
          <div className="hero-section__meta">
            <span className="hero-section__badge">{activeHero.categoryLabel}</span>
            <span className="hero-section__date">
              {formatVietnameseDate(activeHero.date)}
            </span>
          </div>
          <h2 className="hero-section__title">{activeHero.title}</h2>
          <p className="hero-section__summary">{activeHero.summary}</p>
        </div>

        {heroSlides.length > 1 && (
          <>
            <button
              type="button"
              className="hero-section__control hero-section__control--prev"
              onClick={(event) => {
                event.stopPropagation();
                setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
              }}
              aria-label="Slide trước"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="hero-section__control hero-section__control--next"
              onClick={(event) => {
                event.stopPropagation();
                setHeroIndex((prev) => (prev + 1) % heroSlides.length);
              }}
              aria-label="Slide kế tiếp"
            >
              <ChevronRightIcon />
            </button>
            <div className="hero-section__dots">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`hero-section__dot ${idx === heroIndex ? 'hero-section__dot--active' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setHeroIndex(idx);
                  }}
                  aria-label={`Đi tới slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Timeline events={timelineEvents} />

      {/* Activity Section */}
      <div className="activity-section">
        <div className="activity-section__featured-box">
          <img
            className="activity-section__featured-image"
            src={displayedActivity?.thumbnail}
            alt={displayedActivity?.title || 'Featured Activity'}
          />
        </div>
        <div className="section-header">
          <b className="section-title section-title--activity">HOẠT ĐỘNG NỔI BẬT</b>
          <div className="section-divider section-divider--activity" aria-hidden="true" />
        </div>
        <Link to="/activity" className="btn-view-more" style={{ textDecoration: 'none', color: 'inherit' }}>
          <b className="btn-view-more__text">Xem thêm</b>
        </Link>
        {activityPosts.map((activity, index) => (
          <Link
            key={activity.id}
            to={getSlideRoute(activity)}
            className={`activity-post activity-post--${index + 1}${hoveredActivityIndex === index ? ' activity-post--hovered' : ''}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
            onMouseEnter={() => setHoveredActivityIndex(index)}
            onMouseLeave={() => setHoveredActivityIndex(null)}
          >
            <div className="activity-post__date">
              {formatVietnameseDate(activity.start_date || activity.published_at || activity.created_at)}
            </div>
            <div className="home-category-badge home-category-badge--activity">
              <b className="home-category-badge__text">{activity.category_name || ''}</b>
            </div>
            <b className="activity-post__title">{activity.title}</b>
          </Link>
        ))}
        <div className="activity-section__subtitle">{displayedActivity?.description || featuredActivity?.description || ''}</div>
      </div>

      {/* News Section */}
      <div className="news-section">
        <div className="section-header">
          <b className="section-title section-title--news">TIN TỨC NỔI BẬT</b>
          <div className="section-divider section-divider--news" aria-hidden="true" />
        </div>
        <Link to="/news" className="btn-view-more" style={{ textDecoration: 'none', color: 'inherit' }}>
          <b className="btn-view-more__text">Xem thêm</b>
        </Link>
        {newsCards.map((card, index) => (
          <NewsCard
            key={card.id}
            to={`/news/${card.id}`}
            className={`news-card news-card--${index + 1}`}
            image={card.thumbnail || ''}
            category={card.category_name || ''}
            date={card.published_at || card.created_at}
            title={card.title || ''}
            summary={card.summary || ''}
          />
        ))}
      </div>

      {/* Achievement Section */}
      <div className="achievement-section">
        <div className="section-header">
          <b className="section-title section-title--achievement">THÀNH TÍCH NỔI BẬT</b>
          <div className="section-divider section-divider--achievement" aria-hidden="true" />
        </div>
        <div className="btn-view-more-wrapper">
          <Link to="/achievement" className="btn-view-more" style={{ textDecoration: 'none', color: 'inherit' }}>
            <b className="btn-view-more__text">Xem thêm</b>
          </Link>
        </div>
        {achievements.map((card, index) => (
          <AchievementCard
            key={card.id}
            achievement={card}
            to={`/achievement/${card.id}`}
            className={`achievement-card achievement-card--${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
