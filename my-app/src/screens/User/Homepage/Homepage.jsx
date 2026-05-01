import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Homepage.css';
import { postsAPI, timelineAPI } from '../../../services/api';
import { PostCard, Timeline } from '../../../components';
import { formatVietnameseDate } from '../../../utils/date';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../SvgIcons';

const getSlideRoute = (item) => {
  if (item.page_type === 'event_annual' && item.category_slug) {
    return `/event/${item.category_slug}/post/${item.id}`;
  }
  if (item.page_type === 'event_non_annual') {
    return `/event/non-annual/${item.id}`;
  }
  return `/news/${item.id}`;
};

const getSlideCategoryLabel = (item) => {
  if (item.page_type === 'event_annual') return 'Sự kiện thường niên';
  if (item.page_type === 'event_non_annual') return 'Sự kiện không thường niên';
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
  const [eventPosts, setEventPosts] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [hoveredEventIndex, setHoveredEventIndex] = useState(null);
  const [eventImageIndex, setEventImageIndex] = useState(0);

  useEffect(() => {
    const eventTypes = ['event_annual', 'event_non_annual'];
    const allSectionTypes = ['news', 'achievement', ...eventTypes];

    Promise.all([
      ...allSectionTypes.map((pageType) =>
        postsAPI.getAll({ page_type: pageType, is_featured: true, limit: 4 })
      ),
      ...allSectionTypes.map((pageType) =>
        postsAPI.getAll({ page_type: pageType, limit: 4 })
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
    postsAPI.getAll({ page_type: 'news', is_featured: true, limit: 4 })
      .then(data => {
        const featuredNews = asArray(data).filter(isFeaturedPost).slice(0, 4);
        setNewsCards(featuredNews);
      })
      .catch(() => { });

    // Sự kiện nổi bật: gom featured từ thường niên + không thường niên
    Promise.all([
      postsAPI.getAll({ page_type: 'event_annual', is_featured: true, limit: 4 }),
      postsAPI.getAll({ page_type: 'event_non_annual', is_featured: true, limit: 4 }),
    ])
      .then(([annual, nonAnnual]) => {
        const merged = [...asArray(annual), ...asArray(nonAnnual)]
          .filter(isFeaturedPost)
          .sort((a, b) => asTimestamp(b) - asTimestamp(a));
        setEventPosts(merged.slice(0, 4));
        setFeaturedEvent(merged[0] || null);
      })
      .catch(() => { });

    // Thành tích nổi bật từ trang Admin (page_type=achievement, is_featured=true)
    postsAPI.getAll({ page_type: 'achievement', is_featured: true, limit: 4 })
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

  // Auto-rotate event images
  useEffect(() => {
    if (hoveredEventIndex !== null || eventPosts.length === 0) return;

    const timer = setInterval(() => {
      setEventImageIndex((prev) => (prev + 1) % eventPosts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [eventPosts.length, hoveredEventIndex]);

  // Get the image to display for featured event
  const displayedEvent = hoveredEventIndex !== null
    ? eventPosts[hoveredEventIndex]
    : eventPosts[eventImageIndex];

  const activeHero = heroSlides[heroIndex] || {
    title: 'TIN NỔI BẬT MỚI NHẤT',
    image: '',
    summary: 'Theo dõi các thông tin nổi bật mới nhất từ Tin tức, Sự kiện thường niên và Sự kiện không thường niên.',
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

      {/* Event Section */}
      <div className="event-section">
        <div className="event-section__featured-box">
          <img
            className="event-section__featured-image"
            src={displayedEvent?.thumbnail}
            alt={displayedEvent?.title || 'Featured Event'}
          />
        </div>
        <div className="section-header">
          <b className="section-title section-title--event">SỰ KIỆN NỔI BẬT</b>
          <div className="section-divider section-divider--event" aria-hidden="true" />
        </div>
        <Link to="/event" className="btn-view-more" style={{ textDecoration: 'none', color: 'inherit' }}>
          <b className="btn-view-more__text">Xem thêm</b>
        </Link>
        {eventPosts.map((event, index) => (
          <Link
            key={event.id}
            to={getSlideRoute(event)}
            className={`event-post event-post--${index + 1}${hoveredEventIndex === index ? ' event-post--hovered' : ''}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
            onMouseEnter={() => setHoveredEventIndex(index)}
            onMouseLeave={() => setHoveredEventIndex(null)}
          >
            <div className="event-post__date">
              {formatVietnameseDate(event.start_date || event.published_at || event.created_at)}
            </div>
            <div className="home-category-badge home-category-badge--event">
              <b className="home-category-badge__text">{event.category_name || ''}</b>
            </div>
            <b className="event-post__title">{event.title}</b>
          </Link>
        ))}
        <div className="event-section__subtitle">{displayedEvent?.description || featuredEvent?.description || ''}</div>
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
          <PostCard
            key={card.id}
            to={`/news/${card.id}`}
            className={`post-card post-card--${index + 1}`}
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
          <PostCard
            key={card.id}
            to={`/achievement/${card.id}`}
            image={card.thumbnail || ''}
            category={card.category_name || ''}
            date={card.published_at || card.created_at}
            title={card.title || ''}
            summary={card.summary || ''}
            className={`post-card post-card--${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
