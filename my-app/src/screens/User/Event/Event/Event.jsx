import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Event.css';
import { postsAPI } from '../../../../services/api';
import { SearchBar, PostCard } from '../../../../components';
import { SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../../SvgIcons';

const Event = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const typeParam = searchParams.get('type');

    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Tất cả');
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const filterOptions = ['Tất cả', 'Sự kiện không thường niên', 'Sự kiện thường niên'];

    useEffect(() => {
        if (typeParam === 'annual') setSelectedFilter('Sự kiện thường niên');
        else if (typeParam === 'non-annual') setSelectedFilter('Sự kiện không thường niên');
        else setSelectedFilter('Tất cả');
    }, [typeParam]);

    useEffect(() => {
        // Lấy cả sự kiện thường niên và không thường niên
        Promise.all([
            postsAPI.getAll({ page_type: 'event_annual', limit: 100 }),
            postsAPI.getAll({ page_type: 'event_non_annual', limit: 100 })
        ])
            .then(([annual, nonAnnual]) => {
                const merged = [...(Array.isArray(annual) ? annual : []), ...(Array.isArray(nonAnnual) ? nonAnnual : [])];
                setEvents(merged);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = events.filter(e => {
        if (selectedFilter === 'Tất cả') return true;
        if (selectedFilter === 'Sự kiện thường niên') return e.page_type === 'event_annual';
        if (selectedFilter === 'Sự kiện không thường niên') return e.page_type === 'event_non_annual';
        return true;
    }).filter(e =>
        !searchQuery || (e.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="event-page">
            {/* Nội dung chính */}
            <div className="event-content">
                <div className="content-wrapper">
                    {/* Phần Tìm kiếm và Lọc */}
                    <div className="search-section">
                        <SearchBar
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onClear={() => setSearchQuery('')}
                            placeholder="Tìm kiếm"
                            variant="event"
                        />
                        <div className="news-filter-wrapper">
                            <button
                                className="btn btn-secondary news-filter-btn"
                                onClick={() => setFilterOpen(!filterOpen)}
                                style={{ width: 'auto', whiteSpace: 'nowrap' }}
                            >
                                {selectedFilter === 'Tất cả' ? 'Lọc' : selectedFilter}
                            </button>

                            {/* Menu Lọc */}
                            {filterOpen && (
                                <div className="filter-menu">
                                    {filterOptions.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`filter-option ${selectedFilter === option ? 'filter-option--active' : ''}`}
                                            onClick={() => {
                                                setSelectedFilter(option);
                                                setFilterOpen(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tiêu đề Sự kiện */}
                    <div className="section-header" style={{ marginBottom: '2.5rem', textAlign: 'center', justifyContent: 'center' }}>
                        <b className="section-title section-title--event" style={{ fontSize: '1.75rem' }}>CÁC SỰ KIỆN NỔI BẬT</b>
                        <div className="section-divider section-divider--event" aria-hidden="true" style={{ width: '100px', margin: '0.5rem auto 0' }} />
                    </div>

                    {/* Lưới Sự kiện */}
                    <div className="events-grid">
                        {loading && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-soft)' }}>Đang tải...</p>}
                        {!loading && filtered.length === 0 && (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-soft)' }}>Không có sự kiện nào</p>
                        )}
                        {filtered.map(event => {
                            const toPath = event.page_type === 'event_annual'
                                ? `/event/${event.category_slug}/post/${event.id}`
                                : `/event/non-annual/${event.id}`;

                            return (
                                <PostCard
                                    key={event.id}
                                    title={event.title}
                                    description={event.summary}
                                    image={event.thumbnail}
                                    variant="horizontal"
                                    date={event.published_at || event.created_at}
                                    category={event.category_name}
                                    to={toPath}
                                />
                            );
                        })}
                    </div>

                    {/* Phân trang */}
                    <div className="pagination">
                        <button className="pagination-btn pagination-prev" disabled>
                            <span className="arrow-icon" aria-hidden="true"><ChevronLeftIcon /></span>
                            Trước
                        </button>
                        <div className="pagination-list">
                            <button className="pagination-page pagination-current">1</button>
                            <button className="pagination-page">2</button>
                            <button className="pagination-page pagination-hover">3</button>
                            <span className="pagination-gap">...</span>
                            <button className="pagination-page">6</button>
                            <button className="pagination-page">7</button>
                        </div>
                        <button className="pagination-btn pagination-next">
                            Sau
                            <span className="arrow-icon" aria-hidden="true"><ChevronRightIcon /></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Event;

