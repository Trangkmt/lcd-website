import React from 'react';
import './Footer.css';
import Logo from '../../images/Logo.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <img className="footer-logo" src={Logo} alt="Logo" />
                    <div className="social-icons">
                        <a href="#" className="social-icon">𝕏</a>
                        <a href="#" className="social-icon">📷</a>
                        <a href="#" className="social-icon">▶</a>
                        <a href="#" className="social-icon">in</a>
                    </div>
                </div>

                <div className="footer-columns">
                    <div className="footer-column">
                        <h3>Use cases</h3>
                        <a href="#">UI design</a>
                        <a href="#">UX design</a>
                        <a href="#">Wireframing</a>
                        <a href="#">Diagramming</a>
                        <a href="#">Brainstorming</a>
                        <a href="#">Online whiteboard</a>
                        <a href="#">Team collaboration</a>
                    </div>

                    <div className="footer-column">
                        <h3>Explore</h3>
                        <a href="#">Design</a>
                        <a href="#">Prototyping</a>
                        <a href="#">Development features</a>
                        <a href="#">Design systems</a>
                        <a href="#">Collaboration features</a>
                        <a href="#">Design process</a>
                        <a href="#">FigJam</a>
                    </div>

                    <div className="footer-column">
                        <h3>Resources</h3>
                        <a href="#">Blog</a>
                        <a href="#">Best practices</a>
                        <a href="#">Colors</a>
                        <a href="#">Color wheel</a>
                        <a href="#">Support</a>
                        <a href="#">Developers</a>
                        <a href="#">Resource library</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
