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
                <Outlet />
            </main>
        </div>
    );
}
