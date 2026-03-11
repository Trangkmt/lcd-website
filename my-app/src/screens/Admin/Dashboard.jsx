import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { newsAPI, usersAPI, contactAPI } from '../../services/api';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({ totalPosts: 0, pendingPosts: 0, totalMembers: 0, newContacts: 0 });
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const [posts, users, contacts] = await Promise.all([
                    newsAPI.getAll({ limit: 100, include_unpublished: true }),
                    usersAPI.getAll(),
                    contactAPI.getAll({ limit: 100 }),
                ]);
                const allPosts = Array.isArray(posts) ? posts : [];
                const allUsers = Array.isArray(users) ? users : [];
                const allContacts = Array.isArray(contacts) ? contacts : [];
                setStatsData({
                    totalPosts: allPosts.length,
                    pendingPosts: allPosts.filter(p => !p.is_published).length,
                    totalMembers: allUsers.length,
                    newContacts: allContacts.filter(c => !c.is_read).length,
                });
                setRecentPosts(
                    allPosts.slice(0, 5).map(p => ({
                        id: p.id,
                        title: p.title,
                        category: p.category_name || '',
                        status: p.is_published ? 'Đã duyệt' : 'Chờ duyệt',
                        date: p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : '',
                    }))
                );
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    const statCards = [
        { label: 'Tổng bài viết', value: statsData.totalPosts, icon: '📝', color: '#667eea' },
        { label: 'Bài viết chờ duyệt', value: statsData.pendingPosts, icon: '⏳', color: '#f59e0b' },
        { label: 'Thành viên', value: statsData.totalMembers, icon: '👥', color: '#10b981' },
        { label: 'Liên hệ mới', value: statsData.newContacts, icon: '✉️', color: '#ef4444' },
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-subtitle">Chào mừng quay trở lại! Đây là tổng quan hệ thống của bạn.</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon" style={{ background: stat.color + '20', color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">{stat.label}</p>
                            <h3 className="stat-value">{loading ? '...' : stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Recent Posts */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2 className="card-title">Bài viết gần đây</h2>
                        <a href="/admin/posts" className="card-link">Xem tất cả →</a>
                    </div>
                    <div className="posts-table">
                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Đang tải...</p>
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
                                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>Chưa có bài viết</td></tr>
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

                {/* Quick Links */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2 className="card-title">Truy cập nhanh</h2>
                    </div>
                    <div className="activities-list">
                        {[
                            { icon: '📝', label: 'Quản lý bài viết', href: '/admin/posts' },
                            { icon: '👥', label: 'Quản lý thành viên', href: '/admin/members' },
                            { icon: '🏷️', label: 'Quản lý danh mục', href: '/admin/categories' },
                            { icon: '✉️', label: 'Quản lý liên hệ', href: '/admin/contacts' },
                            { icon: '🏆', label: 'Thành tích nổi bật', href: '/admin/achievements' },
                        ].map((item, idx) => (
                            <a key={idx} href={item.href} className="activity-item" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                                <div className="activity-dot"></div>
                                <div className="activity-info">
                                    <p className="activity-action">{item.icon} {item.label}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2 className="section-title">Thao tác nhanh</h2>
                <div className="actions-grid">
                    <button className="action-btn" onClick={() => window.location.href = '/admin/posts'}>
                        <span className="action-icon">➕</span>
                        <span className="action-label">Tạo bài viết mới</span>
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/posts'}>
                        <span className="action-icon">📋</span>
                        <span className="action-label">Duyệt bài viết</span>
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/achievements'}>
                        <span className="action-icon">🏆</span>
                        <span className="action-label">Thêm thành tích</span>
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/members'}>
                        <span className="action-icon">👤</span>
                        <span className="action-label">Thêm thành viên</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
