import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SecondaryNavbar from './SecondaryNavbar';
import SearchBar from '../Products/SearchBar';
import SmartSearchPopup from './SmartSearchPopup';
import './Header.css';

// Tooltip component
const Tooltip = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="tooltip-container">
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && <div className="tooltip">{text}</div>}
    </div>
  );
};

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <img src="/esag-black.png" alt="ESAG" className="logo-img" />
            </Link>

            <div className="search-container">
              <SearchBar 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                placeholder="Search products..."
              />
              <button 
                onClick={() => setIsSmartSearchOpen(true)} 
                className="smart-search-btn" 
                title="Smart Search"
                aria-label="Smart Search"
              >
                <img src="/smartsearch.png" alt="Smart Search" className="smart-search-icon" />
              </button>
            </div>

            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`} ref={menuRef}>
              <Tooltip text="Home">
                <Link to="/" className="nav-icon">
                  <img src="/home.svg" alt="Home" />
                </Link>
              </Tooltip>

              <Tooltip text="Products">
                <Link to="/products" className="nav-icon">
                  <img src="/products.svg" alt="Products" />
                </Link>
              </Tooltip>
              
              {isAuthenticated ? (
                <>
                  <Tooltip text={`Cart (${cart?.total_items || 0})`}>
                    <Link to="/cart" className="nav-icon cart-icon">
                      <img src="/cart.svg" alt="Cart" />
                      {cart?.total_items > 0 && (
                        <span className="cart-count">{cart.total_items}</span>
                      )}
                    </Link>
                  </Tooltip>

                  <Tooltip text="Orders">
                    <Link to="/orders" className="nav-icon">
                      <img src="/orders.svg" alt="Orders" />
                    </Link>
                  </Tooltip>

                  <div className="user-menu">
                    <Tooltip text={user?.name || 'User'}>
                      <div className="user-avatar">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </Tooltip>
                    
                    <Tooltip text="Logout">
                      <button onClick={handleLogout} className="logout-btn">
                        <img src="/logout.svg" alt="Logout" />
                      </button>
                    </Tooltip>
                  </div>
                </>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="login-btn">
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="register-btn">
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </nav>

            <button 
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <SecondaryNavbar />
      
      {/* Smart Search Popup */}
      {isSmartSearchOpen && (
        <SmartSearchPopup 
          onClose={() => setIsSmartSearchOpen(false)}
          onSelect={(query) => {
            setSearchQuery(query);
            handleSearch(query);
            setIsSmartSearchOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Header;