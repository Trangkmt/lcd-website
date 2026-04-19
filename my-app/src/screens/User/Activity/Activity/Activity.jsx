import React, { useState, useEffect } from 'react';
import './Activity.css';
import { activitiesAPI } from '../../../../services/api';
import { SearchBar } from '../../../../components';
import ActivityCard from '../../../../components/ActivityCard/ActivityCard';
import { SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../../SvgIcons';

const Activity = () => {
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Tất cả');
    const [searchQuery, setSearchQuery] = useState('');
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const filterOptions = ['Tất cả', 'Sự kiện không thường niên', 'Sự kiện thường niên'];

    useEffect(() => {
        activitiesAPI.getAll({ limit: 100 })
            .then(data => setActivities(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = activities.filter(a =>
        selectedFilter === 'Tất cả' || a.category_name === selectedFilter
    ).filter(a =>
        !searchQuery || (a.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="activity-page">
            {/* Main Content */}
            <div className="activity-content">
                <div className="content-wrapper">
                    {/* Search and Filter Section */}
                    <div className="search-section">
                        <SearchBar
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onClear={() => setSearchQuery('')}
                            placeholder="Tìm kiếm"
                            variant="activity"
                        />
                        <div className="filter-wrapper">
                            <div className="filter-icon" aria-hidden="true"><SettingsIcon /></div>
                            <button
                                className="filter-button"
                                onClick={() => setFilterOpen(!filterOpen)}
                            >
                                Lọc
                            </button>
                        </div>
                    </div>

                    {/* Filter Menu */}
                    {filterOpen && (
                        <div className="filter-menu">
                            {filterOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className="filter-option"
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

                    {/* Activities Title */}
                    <h1 className="activities-title">CÁC HOẠT ĐỘNG NỔI BẬT CỦA LIÊN CHI ĐOÀN</h1>

                    {/* Activities Grid */}
                    <div className="activities-grid">
                        {loading && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Đang tải...</p>}
                        {!loading && filtered.length === 0 && (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Không có hoạt động nào</p>
                        )}
                        {filtered.map(activity => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                to={`/activity/${activity.slug}`}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <button className="pagination-btn pagination-prev" disabled>
                            <span className="arrow-icon" aria-hidden="true"><ChevronLeftIcon /></span>
                            Previous
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
                            Next
                            <span className="arrow-icon" aria-hidden="true"><ChevronRightIcon /></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Activity;
