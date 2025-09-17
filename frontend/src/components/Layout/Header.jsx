import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SearchBar from '../Products/SearchBar';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h2>esag</h2>
          </Link>

          <SearchBar />

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="cart-link" onClick={() => setIsMenuOpen(false)}>
                  Cart ({cart.total_items || 0})
                </Link>
                <Link to="/orders" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                <div className="user-menu">
                  <span>Hi, {user?.name}</span>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </nav>

          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
