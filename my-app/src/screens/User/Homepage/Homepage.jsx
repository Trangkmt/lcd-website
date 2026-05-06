import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Homepage.css';
import { postsAPI, timelineAPI } from '../../../services/api';
import { PostCard, Timeline, LazyImage, HeroSection } from '../../../components';
import { formatVietnameseDate } from '../../../utils/date';

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

  // Lấy hình ảnh để hiển thị cho sự kiện nổi bật (đang di chuột hoặc mới nhất)
  const displayedEvent = hoveredEventIndex !== null
    ? eventPosts[hoveredEventIndex]
    : eventPosts[0];


  return (
    <div className="homepage">
      <HeroSection
        slides={heroSlides}
        currentIndex={heroIndex}
        onPrev={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
        onNext={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
        onDotClick={(idx) => setHeroIndex(idx)}
      />

      <Timeline events={timelineEvents} />

      {/* Event Section */}
      <div className="event-section">
        <div className="event-section__featured-box">
          <LazyImage
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
          <div
            key={event.id}
            className={`event-post event-post--${index + 1}${hoveredEventIndex === index ? ' event-post--hovered' : ''}`}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredEventIndex(index)}
            onMouseLeave={() => setHoveredEventIndex(null)}
          >
            {/* Link phủ toàn bộ khối sự kiện */}
            <Link 
              to={getSlideRoute(event)} 
              className="event-post__cover-link"
              style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            />

            <div className="event-post__date" style={{ position: 'relative', zIndex: 2 }}>
              {formatVietnameseDate(event.start_date || event.published_at || event.created_at)}
            </div>
            
            {/* Badge Link dẫn đến trang lọc phù hợp */}
            <Link 
              to={event.page_type === 'event_annual' 
                ? `/event/${event.category_slug}` 
                : `/event/non-annual?category=${encodeURIComponent(event.category_name || '')}`}
              className="home-category-badge home-category-badge--event"
              style={{ position: 'relative', zIndex: 3, textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              <b className="home-category-badge__text">{event.category_name || ''}</b>
            </Link>
            
            <b className="event-post__title" style={{ position: 'relative', zIndex: 2 }}>
                {event.title}
            </b>
          </div>
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
            categorySlug={card.category_slug || ''}
            pageType="news"
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
            categorySlug={card.category_slug || ''}
            pageType="achievement"
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

