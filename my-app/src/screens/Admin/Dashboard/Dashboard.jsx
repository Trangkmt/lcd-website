import React, { useEffect, useState, useMemo } from 'react';
import './Dashboard.css';
import { postsAPI, usersAPI, contactAPI, categoriesAPI, timelineAPI } from '../../../services/api';
import {
    PostIcon,
    HourglassIcon,
    UsersIcon,
    MailIcon,
    CloseIcon,
    FolderIcon,
    TrophyIcon,
    PlusIcon,
    TagIcon,
    TimelineIcon,
} from '../../../SvgIcons';
import { Timeline } from '../../../components';
import {
    getStoredAdminUser,
    isAdminFull,
    isContactManager,
    isPostAuthor,
    isUtilityOnly,
} from '../../../utils/adminPermissions';

export default function Dashboard() {
    const currentUser = getStoredAdminUser();
    const showAdminOverview = isAdminFull(currentUser);
    const showPostFunctions = isAdminFull(currentUser) || isPostAuthor(currentUser);
    const showUtilityFunctions = isAdminFull(currentUser) || isUtilityOnly(currentUser) || isContactManager(currentUser);
    const showContactFunctions = isAdminFull(currentUser) || isContactManager(currentUser);
    const [loading, setLoading] = useState(true);
    const [allPosts, setAllPosts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allContacts, setAllContacts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [filters, setFilters] = useState({ year: '', status: 'all', category_id: '' });

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const timelineData = await timelineAPI.getPublic({ limit: 100 });
                setTimelineEvents(Array.isArray(timelineData) ? timelineData : []);

                if (showAdminOverview) {
                    const [postsRes, usersRes, contactsRes, catsRes] = await Promise.allSettled([
                        postsAPI.getAll({ limit: 500, include_unpublished: true }),
                        usersAPI.getAll(),
                        contactAPI.getAll({ limit: 100 }),
                        categoriesAPI.getAll(),
                    ]);
                    setAllPosts(postsRes.status === 'fulfilled' && Array.isArray(postsRes.value) ? postsRes.value : []);
                    setAllUsers(usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : []);
                    setAllContacts(contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value) ? contactsRes.value : []);
                    setCategories(catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) ? catsRes.value : []);

                    if (contactsRes.status === 'rejected') {
                        console.warn('Không thể tải liên hệ:', contactsRes.reason?.message);
                    }
                } else {
                    setAllPosts([]);
                    setAllUsers([]);
                    setAllContacts([]);
                    setCategories([]);
                }
            } catch (err) {
                console.error('Dashboard load error:', err);
                setTimelineEvents([]);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    const filteredPosts = useMemo(() => {
        let list = [...allPosts];
        if (filters.year) {
            list = list.filter(p => p.created_at && new Date(p.created_at).getFullYear() === parseInt(filters.year));
        }
        if (filters.status === 'published') list = list.filter(p => p.is_published);
        else if (filters.status === 'pending') list = list.filter(p => !p.is_published);
        if (filters.category_id) list = list.filter(p => String(p.category_id) === String(filters.category_id));
        return list;
    }, [allPosts, filters]);

    const statsData = useMemo(() => ({
        totalPosts: filteredPosts.length,
        pendingPosts: filteredPosts.filter(p => !p.is_published).length,
        totalMembers: allUsers.length,
        newContacts: allContacts.filter(c => !c.is_read).length,
    }), [filteredPosts, allUsers, allContacts]);

    const recentPosts = useMemo(() =>
        filteredPosts.slice(0, 5).map(p => ({
            id: p.id,
            title: p.title,
            category: p.category_name || '',
            status: p.is_published ? 'Đã duyệt' : 'Chờ duyệt',
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : '',
        })), [filteredPosts]);

    const availableYears = useMemo(() =>
        [...new Set(allPosts.filter(p => p.created_at).map(p => new Date(p.created_at).getFullYear()))].sort((a, b) => b - a),
        [allPosts]);

    const hasActiveFilter = filters.year || filters.status !== 'all' || filters.category_id;
    const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    const resetFilters = () => setFilters({ year: '', status: 'all', category_id: '' });

    const adminQuickLinks = [
        { icon: PostIcon, label: 'Quản lý bài viết', href: '/admin/posts' },
        { icon: UsersIcon, label: 'Quản lý thành viên', href: '/admin/members' },
        { icon: FolderIcon, label: 'Quản lý danh mục', href: '/admin/categories' },
        { icon: MailIcon, label: 'Quản lý liên hệ', href: '/admin/contacts' },
        { icon: TrophyIcon, label: 'Thành tích nổi bật', href: '/admin/posts?page_type=achievement' },
        { icon: TimelineIcon, label: 'Quản lý timeline', href: '/admin/timeline' },
        { icon: PlusIcon, label: 'Tiện ích khác', href: '/admin/utilities' },
    ];

    const postQuickLinks = [
        { icon: PostIcon, label: 'Quản lý bài viết', href: '/admin/posts' },
        { icon: TrophyIcon, label: 'Thành tích nổi bật', href: '/admin/posts?page_type=achievement' },
    ];

    const utilityQuickLinks = [
        { icon: PlusIcon, label: 'Tiện ích khác', href: '/admin/utilities' },
    ];

    const contactQuickLinks = [
        { icon: MailIcon, label: 'Quản lý liên hệ', href: '/admin/contacts' },
        { icon: PlusIcon, label: 'Tiện ích khác', href: '/admin/utilities' },
    ];

    const quickLinks = showAdminOverview
        ? adminQuickLinks
        : showContactFunctions
            ? contactQuickLinks
            : showPostFunctions
                ? postQuickLinks
                : utilityQuickLinks;

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1 className="page-title">Tổng quan quản trị</h1>
                {!showAdminOverview && (
                    <p className="dashboard-subtitle">
                        {isPostAuthor(currentUser)
                            ? 'Bạn có thể xem timeline và các chức năng biên tập nội dung của mình.'
                            : isContactManager(currentUser)
                                ? 'Bạn có thể xem timeline, quản lý liên hệ và các tiện ích được phân quyền.'
                                : 'Bạn có thể xem timeline và các công cụ tiện ích được phân quyền.'}
                    </p>
                )}
            </div>

            {showAdminOverview && (
                <>
                    {/* Filter Bar */}
                    <div className="dashboard-filters">
                        <div className="filter-group">
                            <label className="filter-label">Năm</label>
                            <select className="filter-select" value={filters.year} onChange={e => setFilter('year', e.target.value)}>
                                <option value="">Tất cả các năm</option>
                                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Trạng thái</label>
                            <select className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                                <option value="all">Tất cả</option>
                                <option value="published">Đã đăng</option>
                                <option value="pending">Chờ duyệt</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Danh mục</label>
                            <select className="filter-select" value={filters.category_id} onChange={e => setFilter('category_id', e.target.value)}>
                                <option value="">Tất cả danh mục</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        {hasActiveFilter && (
                            <button className="filter-reset" onClick={resetFilters}>
                                <span className="filter-reset-icon" aria-hidden="true"><CloseIcon /></span>
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                    <div className="stats-grid">
                        {[
                            { label: 'Tổng bài viết', value: statsData.totalPosts, icon: PostIcon, color: 'var(--color-primary)' },
                            { label: 'Bài viết chờ duyệt', value: statsData.pendingPosts, icon: HourglassIcon, color: 'var(--color-info-tint-medium)' },
                            { label: 'Thành viên', value: statsData.totalMembers, icon: UsersIcon, color: 'var(--color-primary-dark)' },
                            { label: 'Liên hệ mới', value: statsData.newContacts, icon: MailIcon, color: 'var(--color-primary)' },
                        ].map((stat, index) => (
                            <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                                <div className="stat-icon" style={{ background: stat.color }}>
                                    <stat.icon />
                                </div>
                                <div className="stat-info">
                                    <p className="stat-label">{stat.label}</p>
                                    <h3 className="stat-value">{loading ? '...' : stat.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2 className="card-title">Bài viết gần đây</h2>
                                <a href="/admin/posts" className="card-link">Xem tất cả →</a>
                            </div>
                            <div className="posts-table">
                                {loading ? (
                                    <p style={{ textAlign: 'center', color: 'var(--color-text-soft)', padding: '20px' }}>Đang tải...</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Tiêu đề</th>
                                                <th>Danh mục</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày tạo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentPosts.length === 0 && (
                                                <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-soft)' }}>Chưa có bài viết</td></tr>
                                            )}
                                            {recentPosts.map(post => (
                                                <tr key={post.id}>
                                                    <td className="post-title-cell">{post.title}</td>
                                                    <td>
                                                        <span className="category-badge">{post.category}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${post.status === 'Đã duyệt' ? 'approved' : 'pending'}`}>
                                                            {post.status}
                                                        </span>
                                                    </td>
                                                    <td className="date-cell">{post.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2 className="card-title">Truy cập nhanh</h2>
                            </div>
                            <div className="events-list">
                                {quickLinks.map((item, idx) => (
                                    <a key={idx} href={item.href} className="event-item" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                                        <div className="event-dot"></div>
                                        <div className="event-info">
                                            <p className="event-action">
                                                <span className="event-icon" aria-hidden="true"><item.icon /></span>
                                                {item.label}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="dashboard-card dashboard-card--timeline">
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title__icon" aria-hidden="true"><TimelineIcon /></span>
                        Timeline sự kiện
                    </h2>
                    {showAdminOverview && (
                        <a href="/admin/timeline" className="card-link">Quản lý timeline →</a>
                    )}
                </div>

                <Timeline
                    events={timelineEvents}
                    layout="dashboard"
                    loading={loading}
                    maxItems={6}
                    emptyText="Chưa có dữ liệu timeline."
                    loadingText="Đang tải..."
                />
            </div>

            {(showAdminOverview || showPostFunctions || showUtilityFunctions) && (
                <div className="quick-actions">
                    <h2 className="section-title">Thao tác nhanh</h2>
                    <div className="actions-grid">
                        {showAdminOverview && (
                            <>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/posts'}>
                                    <span className="action-icon" aria-hidden="true"><PlusIcon /></span>
                                    <span className="action-label">Tạo bài viết mới</span>
                                </button>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/posts'}>
                                    <span className="action-icon" aria-hidden="true"><TagIcon /></span>
                                    <span className="action-label">Duyệt bài viết</span>
                                </button>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/posts?page_type=achievement'}>
                                    <span className="action-icon" aria-hidden="true"><TrophyIcon /></span>
                                    <span className="action-label">Thêm thành tích</span>
                                </button>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/members'}>
                                    <span className="action-icon" aria-hidden="true"><UsersIcon /></span>
                                    <span className="action-label">Thêm thành viên</span>
                                </button>
                            </>
                        )}

                        {!showAdminOverview && showPostFunctions && (
                            <>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/posts?tab=create'}>
                                    <span className="action-icon" aria-hidden="true"><PlusIcon /></span>
                                    <span className="action-label">Tạo bài viết mới</span>
                                </button>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/posts'}>
                                    <span className="action-icon" aria-hidden="true"><PostIcon /></span>
                                    <span className="action-label">Quản lý bài viết của tôi</span>
                                </button>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/posts?page_type=achievement'}>
                                    <span className="action-icon" aria-hidden="true"><TrophyIcon /></span>
                                    <span className="action-label">Thành tích nổi bật</span>
                                </button>
                            </>
                        )}

                        {!showAdminOverview && showContactFunctions && (
                            <>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/contacts'}>
                                    <span className="action-icon" aria-hidden="true"><MailIcon /></span>
                                    <span className="action-label">Quản lý liên hệ</span>
                                </button>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/utilities'}>
                                    <span className="action-icon" aria-hidden="true"><FolderIcon /></span>
                                    <span className="action-label">Mở tiện ích</span>
                                </button>
                            </>
                        )}

                        {!showAdminOverview && !showContactFunctions && showUtilityFunctions && (
                            <>
                                <button className="action-btn" onClick={() => window.location.href = '/admin/utilities'}>
                                    <span className="action-icon" aria-hidden="true"><FolderIcon /></span>
                                    <span className="action-label">Mở tiện ích</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


