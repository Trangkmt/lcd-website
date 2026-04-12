import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ADMIN_AUTH_KEY,
    ADMIN_TOKEN_KEY,
    getStoredAdminUser,
    isAdminFull,
    isPostAuthor,
    isUtilityOnly,
} from '../../../utils/adminPermissions';
import './AdminLayout.css';

export default function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = getStoredAdminUser();
    const showAdminTabs = isAdminFull(currentUser);
    const showPostTabs = isAdminFull(currentUser) || isPostAuthor(currentUser);
    const showUtilityTab = isAdminFull(currentUser) || isUtilityOnly(currentUser);
    const isActive = (path) => location.pathname.startsWith(path);
    const isUtilitiesActive = isActive('/admin/utilities');
    const pageLabel = (() => {
        if (location.pathname.startsWith('/admin/posts')) return 'Quản lý bài viết';
        if (location.pathname.startsWith('/admin/categories')) return 'Quản lý danh mục';
        if (location.pathname.startsWith('/admin/members')) return 'Quản lý thành viên';
        if (location.pathname.startsWith('/admin/contacts')) return 'Quản lý liên hệ';
        if (location.pathname.startsWith('/admin/timeline')) return 'Quản lý sự kiện thường niên';
        if (location.pathname.startsWith('/admin/utilities')) return 'Tiện ích khác';
        return 'Tổng quan quản trị';
    })();
    const activeRoleLabel = isAdminFull(currentUser)
        ? 'Admin toàn quyền'
        : isPostAuthor(currentUser)
            ? 'Biên tập nội dung'
            : 'Quản trị tiện ích';
    const displayName = currentUser?.full_name || currentUser?.username || 'Quản trị viên';

    function handleLogout() {
        localStorage.removeItem(ADMIN_AUTH_KEY);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        navigate('/admin/login', { replace: true });
    }

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
                    {showAdminTabs && (
                        <Link
                            to="/admin"
                            className={`nav-item ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}
                        >
                            <span className="nav-icon">📊</span>
                            {!sidebarCollapsed && <span className="nav-label">Dashboard</span>}
                        </Link>
                    )}

                    {showPostTabs && (
                        <Link
                            to="/admin/posts"
                            className={`nav-item ${isActive('/admin/posts') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">📝</span>
                            {!sidebarCollapsed && <span className="nav-label">Quản lý bài viết</span>}
                        </Link>
                    )}

                    {showAdminTabs && (
                        <Link
                            to="/admin/categories"
                            className={`nav-item ${isActive('/admin/categories') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">📁</span>
                            {!sidebarCollapsed && <span className="nav-label">Quản lý danh mục</span>}
                        </Link>
                    )}

                    {showAdminTabs && (
                        <Link
                            to="/admin/members"
                            className={`nav-item ${isActive('/admin/members') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">👥</span>
                            {!sidebarCollapsed && <span className="nav-label">Quản lý thành viên</span>}
                        </Link>
                    )}

                    {showAdminTabs && (
                        <Link
                            to="/admin/timeline"
                            className={`nav-item ${isActive('/admin/timeline') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">🗓️</span>
                            {!sidebarCollapsed && <span className="nav-label">Sự kiện thường niên</span>}
                        </Link>
                    )}

                    {showAdminTabs && (
                        <Link
                            to="/admin/contacts"
                            className={`nav-item ${isActive('/admin/contacts') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">✉️</span>
                            {!sidebarCollapsed && <span className="nav-label">Quản lý liên hệ</span>}
                        </Link>
                    )}

                    {showUtilityTab && (
                        <>
                            <Link
                                to="/admin/utilities"
                                className={`nav-item ${isUtilitiesActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">🛠️</span>
                                {!sidebarCollapsed && <span className="nav-label">Tiện ích khác</span>}
                            </Link>

                            {!sidebarCollapsed && isUtilitiesActive && (
                                <div className="nav-submenu" role="group" aria-label="Subtab tiện ích khác">
                                    <Link
                                        to="/admin/utilities?tab=bulk-export"
                                        className={`nav-subitem ${location.search.includes('tab=bulk-export') || !location.search ? 'active' : ''}`}
                                    >
                                        Xuất giấy mời/ chứng chỉ hàng loạt
                                    </Link>
                                    <Link
                                        to="/admin/utilities?tab=shared-docs"
                                        className={`nav-subitem ${location.search.includes('tab=shared-docs') ? 'active' : ''}`}
                                    >
                                        Tài liệu chung
                                    </Link>
                                </div>
                            )}
                        </>
                    )}

                    <div className="nav-divider"></div>

                    <Link to="/" className="nav-item">
                        <span className="nav-icon">🏠</span>
                        {!sidebarCollapsed && <span className="nav-label">Về trang chủ</span>}
                    </Link>

                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        {!sidebarCollapsed && <span className="nav-label">Đăng xuất</span>}
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar-heading">
                        <p className="admin-topbar-breadcrumb">Admin Panel / {pageLabel}</p>
                        <p className="admin-topbar-title">{pageLabel}</p>
                    </div>
                    <div className="admin-topbar-user">
                        <span className="admin-user-name">{displayName}</span>
                        <span className="admin-user-role">{activeRoleLabel}</span>
                    </div>
                </header>
                <section className="admin-content-wrap">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
