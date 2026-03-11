import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';
import { newsAPI, activitiesAPI } from '../../services/api';

// Static fallback images for intro sections
const introSection1Images = [
  { id: 1, position: 1, image: 'https://picsum.photos/251/197?random=14' },
  { id: 2, position: 2, image: 'https://picsum.photos/251/197?random=15' },
  { id: 3, position: 3, image: 'https://picsum.photos/251/197?random=16' },
  { id: 4, position: 4, image: 'https://picsum.photos/251/197?random=17' },
];

const introSection2Circles = [
  { id: 1, position: 1, image: 'https://picsum.photos/288/285?random=11' },
  { id: 2, position: 2, image: 'https://picsum.photos/288/285?random=12' },
  { id: 3, position: 3, image: 'https://picsum.photos/288/285?random=13' },
];

const Homepage = () => {
  const [newsCards, setNewsCards] = useState([]);
  const [activityPosts, setActivityPosts] = useState([]);
  const [featuredActivity, setFeaturedActivity] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Tin tức mới nhất
    newsAPI.getAll({ limit: 4 })
      .then(data => setNewsCards(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Hoạt động nổi bật: lấy featured activity + 4 bài gần nhất
    activitiesAPI.getAll({ is_featured: true, limit: 1 })
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) setFeaturedActivity(list[0]);
      })
      .catch(() => {});

    activitiesAPI.getAll({ limit: 4 })
      .then(data => setActivityPosts(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Thành tích nổi bật
    newsAPI.getAll({ category_slug: 'thanh-tich-noi-bat', limit: 4 })
      .then(data => setAchievements(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section">
        <img className="hero-section__image" src="https://picsum.photos/1440/600?random=20" alt="Hero" />
        <div className="hero-section__overlay" />
        <div className="hero-section__title">TIÊU ĐỀ HERO SECTION</div>
      </div>

      {/* Intro Section 2 (with circles) */}
      <div className="intro-section-2">
        <div className="intro-section-2__background" />
        <div className="intro-section-2__text">3 câu giới thiệu về liên chi đoàn</div>
        {introSection2Circles.map((item) => (
          <img
            key={item.id}
            className={`intro-section-2__circle intro-section-2__circle--${item.position}`}
            src={item.image}
            alt={`Intro ${item.id}`}
          />
        ))}
      </div>

      {/* Intro Section 1 (with rectangles) */}
      <div className="intro-section-1">
        <div className="intro-section-1__background" />
        {introSection1Images.map((item) => (
          <img
            key={item.id}
            className={`intro-section-1__image intro-section-1__image--${item.position}`}
            src={item.image}
            alt={`LCD ${item.id}`}
          />
        ))}
        <div className="intro-section-1__text">Số thành viên liên chi đoàn</div>
      </div>

      {/* Activity Section */}
      <div className="activity-section">
        <div className="activity-section__featured-box">
          <img
            className="activity-section__featured-image"
            src={featuredActivity?.thumbnail || 'https://picsum.photos/652/367?random=10'}
            alt={featuredActivity?.title || 'Featured Activity'}
          />
        </div>
        <b className="section-title section-title--activity">HOẠT ĐỘNG NỔI BẬT</b>
        <img className="section-divider section-divider--activity" alt="" />
        {activityPosts.map((activity, index) => (
          <Link
            key={activity.id}
            to={`/activity/${activity.slug}`}
            className={`activity-post activity-post--${index + 1}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="activity-post__date">
              {activity.start_date ? new Date(activity.start_date).toLocaleDateString('vi-VN') : ''}
            </div>
            <b className="activity-post__title">{activity.title}</b>
            <div className="category-badge category-badge--activity">
              <b className="category-badge__text">{activity.category_name || ''}</b>
            </div>
          </Link>
        ))}
        <div className="activity-section__subtitle">{featuredActivity?.description || ''}</div>
      </div>

      {/* News Section */}
      <div className="news-section">
        <img className="section-divider section-divider--news" alt="" />
        <b className="section-title section-title--news">TIN TỨC</b>
        <Link to="/news" className="btn-view-more" style={{ textDecoration: 'none', color: 'inherit' }}>
          <b className="btn-view-more__text">Xem thêm</b>
        </Link>
        {newsCards.map((card, index) => (
          <div key={card.id} className={`news-card news-card--${index + 1}`}>
            <div className="news-card__background" />
            <b className="news-card__title">{card.title}</b>
            <img
              className="news-card__image"
              src={card.thumbnail || `https://picsum.photos/300/200?random=${card.id}`}
              alt={card.title}
            />
            <div className="category-badge category-badge--news">
              <b className="category-badge__text">{card.category_name || ''}</b>
            </div>
            <div className="news-card__date">
              {card.published_at ? new Date(card.published_at).toLocaleDateString('vi-VN') : ''}
            </div>
            <div className="news-card__description">{card.summary || ''}</div>
          </div>
        ))}
      </div>

      {/* Achievement Section */}
      <div className="achievement-section">
        <div className="btn-view-more-wrapper">
          <Link to="/achievement" className="btn-view-more" style={{ textDecoration: 'none', color: 'inherit' }}>
            <b className="btn-view-more__text">Xem thêm</b>
          </Link>
        </div>
        <img className="section-divider section-divider--achievement" alt="" />
        <b className="section-title section-title--achievement">THÀNH TÍCH NỔI BẬT</b>
        {achievements.map((card, index) => (
          <div key={card.id} className={`achievement-card achievement-card--${index + 1}`}>
            <div className="achievement-card__background" />
            <b className="achievement-card__title">{card.title}</b>
            <img
              className="achievement-card__image"
              src={card.thumbnail || `https://picsum.photos/300/200?random=${50 + card.id}`}
              alt={card.title}
            />
            <div className="achievement-card__date">
              {card.published_at ? new Date(card.published_at).toLocaleDateString('vi-VN') : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
