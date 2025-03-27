import React from 'react';
import './signup.css';
import { Bus } from 'lucide-react';

const Footer = () => {
  const quickLinks = ['Home', 'About', 'Contact', 'Features', 'Privacy Policy'];
  const socialLinks = ['Facebook', 'Twitter', 'LinkedIn', 'Instagram'];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-brand">
            <Bus className="footer-icon" />
            <span className="footer-title">SafeRide</span>
          </div>
          <p className="footer-description">
            Revolutionizing school transportation with cutting-edge technology and unparalleled safety.
          </p>
        </div>
        <div className="footer-section">
          <h4 className="footer-section-title">Quick Links</h4>
          <div className="footer-links">
            {quickLinks.map((link, index) => (
              <a key={index} href="#" className="footer-link">{link}</a>
            ))}
          </div>
        </div>
        <div className="footer-section">
          <h4 className="footer-section-title">Connect With Us</h4>
          <div className="footer-social">
            {socialLinks.map((social, index) => (
              <a key={index} href="#" className="footer-social-link">{social}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 SafeRide. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;