import React from 'react';
import PageContainer from './PageContainer';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <PageContainer>
        <div className="footer-content">
          <div className="footer-brand">HotelFinder</div>
          <p className="footer-desc">Hotel listing management interface.</p>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} HotelFinder
          </div>
        </div>
      </PageContainer>
    </footer>
  );
};

export default Footer;
