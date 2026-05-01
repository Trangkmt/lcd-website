import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import Logo from '../../images/Logo.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">

                    <div className="footer-column">
                        <h3>Địa chỉ liên hệ</h3>
                        <p>Liên Chi đoàn khoa Công nghệ thông tin</p>
                        <a href="tel:023456788">023456788</a>
                        <a href="mailto:lcd@neu.edu.vn">lcd@neu.edu.vn</a>
                        <img className="footer-logo" src={Logo} alt="Logo" />
                        <div className="social-icons">
                            <a href="https://x.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="X">X</a>
                            <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>                    </div>
                    </div>
                </div>

                <div className="footer-columns">
                    <div className="footer-column">
                        <h3>Thông tin chung</h3>
                        <Link to="/">Trang chủ</Link>
                        <Link to="/news">Tin tức</Link>
                        <Link to="/event/annual">Sự kiện thường niên</Link>
                        <Link to="/event/non-annual">Sự kiện không thường niên</Link>
                        <Link to="/achievement">Thành tích</Link>
                        <Link to="/contact">Liên hệ</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
