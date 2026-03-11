import React, { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import Logo from '../../images/Logo.png';
import IconRightArrow from '../../images/icon-right-arrow.svg';

const Header = () => {
    const location = useLocation();
    const [searchValue, setSearchValue] = useState('');

    const menuItems = [
        { id: 1, label: "Giới thiệu", path: "/about" },
        { id: 2, label: "Cơ cấu tổ chức", path: "/organization" },
        { id: 3, label: "Liên hệ", path: "/contact" },
        { id: 4, label: "Hoạt động", path: "/activity" }
    ];

    const handleMenuItemClick = useCallback((item) => {
        console.log(`Navigating to: ${item.path}`);
    }, []);

    const handleSearch = useCallback(() => {
        console.log(`Searching for: ${searchValue}`);
    }, [searchValue]);

    return (
        <header className="header">
            <div className="header__menu">
                {/* White Background */}
                <div className="header__background"></div>

                {/* Logo - Click to go home */}
                <Link to="/" className="header__logo-link">
                    <img className="header__logo" src={Logo} alt="LCD Logo" />
                </Link>

                {/* Menu Items */}
                {menuItems.map((item, index) => (
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
                ))}

                {/* Search */}
                <div className="header__search">
                    <input
                        type="text"
                        className="header__search-input"
                        placeholder="..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="header__search-btn" onClick={handleSearch}>
                        <svg className="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="header__bottom-bar"></div>

            {/* Title on Bottom Bar */}
            <div className="header__title">LIÊN CHI ĐOÀN KHOA CÔNG NGHỆ THÔNG TIN</div>
        </header>
    );
};

export default Header;
