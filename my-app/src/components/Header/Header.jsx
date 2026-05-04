import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import Logo from '../../images/Logo.png';
import IconRightArrow from '../../images/icon-right-arrow.svg';
import { MenuIcon, CloseIcon } from '../../SvgIcons';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileEventOpen, setIsMobileEventOpen] = useState(false);

    const menuItems = [
        { id: 2, label: "Cơ cấu tổ chức", path: "/organization" },
        { id: 3, label: "Sự kiện", path: "/event", hasDropdown: true },
        { id: 4, label: "Tin tức", path: "/news" },
        { id: 5, label: "Thành tích", path: "/achievement" },
        { id: 6, label: "Liên hệ", path: "/contact" },
    ];

    const eventDropdownItems = [
        { label: "Sự kiện thường niên", path: "/event/annual" },
        { label: "Sự kiện không thường niên", path: "/event/non-annual" },
    ];

    const handleMenuItemClick = useCallback((item) => {
        console.log(`Navigating to: ${item.path}`);
    }, []);

    const handleSearch = useCallback(() => {
        if (searchValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            setIsMobileMenuOpen(false); // Close mobile menu if open
        }
    }, [searchValue, navigate]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsMobileEventOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMobileMenuOpen]);

    return (
        <header className="header">
            <div className="header__menu">
                {/* White Background */}
                <div className="header__background"></div>

                {/* Logo - Click to go home */}
                <Link to="/" className="header__logo-link">
                    <img className="header__logo" src={Logo} alt="LCD Logo" />
                </Link>

                {/* Organization Title Block */}
                <div className="header__org-title" aria-label="Thông tin đơn vị">
                    <a href="https://neu.edu.vn/" target="_blank" rel="noopener noreferrer" className="header__org-line header__org-line--medium">
                        ĐẠI HỌC KINH TẾ QUỐC DÂN
                    </a>
                    <a href="https://fit.neu.edu.vn/" target="_blank" rel="noopener noreferrer" className="header__org-line header__org-line--medium">
                        TRƯỜNG CÔNG NGHỆ
                    </a>
                    <a href="https://fit.neu.edu.vn/" target="_blank" rel="noopener noreferrer" className="header__org-line header__org-line--bold">
                        LIÊN CHI ĐOÀN KHOA CÔNG NGHỆ THÔNG TIN
                    </a>
                    </div>

                <button
                    type="button"
                    className="header__mobile-toggle"
                    aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                    aria-expanded={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                >
                    {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>

                {/* Menu Items */}
                <nav className="header__nav">
                    <Link
                        to="/"
                        className={`menu-item menu-item--home ${location.pathname === '/' ? 'menu-item--active' : ''}`}
                        aria-label="Trang chủ"
                    >
                        <div className="menu-item__state-layer">
                            <span className="menu-item__home-icon" aria-hidden="true">
                                <svg className="menu-item__home-icon-solid" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor" />
                                </svg>
                            </span>
                        </div>
                    </Link>

                    {menuItems.map((item, index) => {
                        if (item.hasDropdown) {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <div
                                    key={item.id}
                                    className={`menu-item menu-item--${index + 1} menu-item--has-dropdown ${isActive ? 'menu-item--active' : ''}`}
                                >
                                    <Link to={item.path} className="menu-item__state-layer" style={{ textDecoration: 'none' }}>
                                        <div className="menu-item__content">
                                            <b className="menu-item__label">{item.label}</b>
                                        </div>
                                        <div className="menu-item__trailing">
                                            <img className="menu-item__icon" src={IconRightArrow} alt="" />
                                        </div>
                                    </Link>
                                    <div className="event-dropdown">
                                        {eventDropdownItems.map((dropItem, i) => (
                                            <Link
                                                key={i}
                                                to={dropItem.path}
                                                className="event-dropdown__item"
                                            >
                                                {dropItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`menu-item menu-item--${index + 1} ${location.pathname === item.path ? 'menu-item--active' : ''}`}
                                onClick={() => handleMenuItemClick(item)}
                            >
                                <div className="menu-item__state-layer">
                                    <div className="menu-item__content">
                                        <b className="menu-item__label">{item.label}</b>
                                    </div>
                                    <div className="menu-item__trailing">
                                        <img className="menu-item__icon" src={IconRightArrow} alt="" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Search */}
                <div className="header__search">
                    <input
                        type="text"
                        className="header__search-input"
                        placeholder="Tìm kiếm nội dung..."
                        aria-label="Tìm kiếm"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="header__search-btn" onClick={handleSearch} aria-label="Thực hiện tìm kiếm">
                        <svg className="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div
                className={`header__mobile-backdrop ${isMobileMenuOpen ? 'header__mobile-backdrop--visible' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            <aside className={`header__mobile-drawer ${isMobileMenuOpen ? 'header__mobile-drawer--open' : ''}`}>
                <div className="header__mobile-search">
                    <input
                        type="text"
                        className="header__search-input"
                        placeholder="Tìm kiếm nội dung..."
                        aria-label="Tìm kiếm"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="header__search-btn" onClick={handleSearch} aria-label="Thực hiện tìm kiếm">
                        <svg className="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>

                <nav className="header__mobile-nav" aria-label="Menu di động">
                    <Link to="/" className="header__mobile-link">Trang chủ</Link>
                    <Link to="/organization" className="header__mobile-link">Cơ cấu tổ chức</Link>
                    <button
                        type="button"
                        className="header__mobile-link header__mobile-link--toggle"
                        onClick={() => setIsMobileEventOpen((prev) => !prev)}
                        aria-expanded={isMobileEventOpen}
                    >
                        <span>Sự kiện</span>
                        <span className="header__mobile-toggle-arrow">{isMobileEventOpen ? '−' : '+'}</span>
                    </button>
                    {isMobileEventOpen && (
                        <div className="header__mobile-submenu">
                            <Link to="/event" className="header__mobile-sublink" style={{ color: 'var(--color-primary)' }}>
                                Tất cả sự kiện
                            </Link>
                            {eventDropdownItems.map((dropItem, i) => (
                                <Link key={i} to={dropItem.path} className="header__mobile-sublink">
                                    {dropItem.label}
                                </Link>
                            ))}
                        </div>
                    )}
                    <Link to="/news" className="header__mobile-link">Tin tức</Link>
                    <Link to="/achievement" className="header__mobile-link">Thành tích</Link>
                    <Link to="/contact" className="header__mobile-link">Liên hệ</Link>
                </nav>
            </aside>

            {/* Bottom Bar */}
            <div className="header__bottom-bar"></div>

            {/* Title on Bottom Bar */}
            <div className="header__title">LIÊN CHI ĐOÀN KHOA CÔNG NGHỆ THÔNG TIN</div>
        </header>
    );
};

export default Header;

