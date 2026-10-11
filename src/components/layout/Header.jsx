import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../common/Button';
import PageContainer from './PageContainer';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddHotel = () => {
    navigate('/hotels/new');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <PageContainer>
        <div className="header-content">
          <Link to="/hotels" className="header-brand" onClick={closeMobileMenu}>
            HotelFinder
          </Link>

          <nav className="header-nav-desktop">
            <Link to="/hotels" className="header-link">Hotels</Link>
            <Button onClick={handleAddHotel}>+ Add Hotel</Button>
          </nav>

          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </PageContainer>

      {isMobileMenuOpen && (
        <nav className="header-nav-mobile">
          <PageContainer>
            <div className="mobile-nav-content">
              <Link to="/hotels" className="header-link" onClick={closeMobileMenu}>Hotels</Link>
              <Button onClick={handleAddHotel} className="mobile-add-btn">+ Add Hotel</Button>
            </div>
          </PageContainer>
        </nav>
      )}
    </header>
  );
};

export default Header;
