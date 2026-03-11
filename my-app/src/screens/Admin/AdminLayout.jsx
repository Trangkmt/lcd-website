import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">
                        {!sidebarCollapsed && 'FIT Admin'}
                    </h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? '☰' : '×'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/admin"
                        className={`nav-item ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}
                    >
                        <span className="nav-icon">📊</span>
                        {!sidebarCollapsed && <span className="nav-label">Dashboard</span>}
                    </Link>

                    <Link
                        to="/admin/posts"
                        className={`nav-item ${isActive('/admin/posts') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">📝</span>
                        {!sidebarCollapsed && <span className="nav-label">Quản lý bài viết</span>}
                    </Link>

                    <Link
                        to="/admin/categories"
                        className={`nav-item ${isActive('/admin/categories') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">📁</span>
                        {!sidebarCollapsed && <span className="nav-label">Quản lý danh mục</span>}
                    </Link>

                    <Link
                        to="/admin/achievements"
                        className={`nav-item ${isActive('/admin/achievements') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🏆</span>
                        {!sidebarCollapsed && <span className="nav-label">Thành tích nổi bật</span>}
                    </Link>

                    <Link
                        to="/admin/members"
                        className={`nav-item ${isActive('/admin/members') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">👥</span>
                        {!sidebarCollapsed && <span className="nav-label">Quản lý thành viên</span>}
                    </Link>

                    <Link
                        to="/admin/contacts"
                        className={`nav-item ${isActive('/admin/contacts') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">✉️</span>
                        {!sidebarCollapsed && <span className="nav-label">Quản lý liên hệ</span>}
                    </Link>

                    <div className="nav-divider"></div>

                    <Link to="/" className="nav-item">
                        <span className="nav-icon">🏠</span>
                        {!sidebarCollapsed && <span className="nav-label">Về trang chủ</span>}
                    </Link>

                    <button className="nav-item logout-btn">
                        <span className="nav-icon">🚪</span>
                        {!sidebarCollapsed && <span className="nav-label">Đăng xuất</span>}
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
