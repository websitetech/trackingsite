import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import logo from '../assets/logo.png';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onRegister, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state: cartState } = useCart();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <header className="new-header">
      {/* Top Contact Bar */}
      <div className="header-top-bar">
        <div className="header-top-content">
          <div className="contact-info">
            <span className="address">612-7 Roanoke Rd, Toronto, ON M3A 1E3, Canada</span>
            <div className="social-links">
              <a href="#" className="social-link">FB</a>
              <a href="#" className="social-link">TW</a>
              <a href="#" className="social-link">LI</a>
              <a href="#" className="social-link">IG</a>
              <a href="#" className="social-link">PIN</a>
            </div>
          </div>
          <div className="contact-email">
            <span>Info@noblespeedytrac.com</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="header-content">
          {/* Logo - Left side */}
          <Link 
            to="/"
            className="logo-link" 
            onClick={handleLogoClick}
            title="Click to go to home page"
          >
            <img 
              src={logo} 
              alt="NobleSpeedytrac logo" 
              className="logo-image"
            />
          </Link>

          {/* Navigation Menu - Center (Profile only for logged-in users) */}
          <nav className="main-nav">
            {user && (
              <div className="nav-dropdown">
                <span className="nav-link dropdown-toggle">Profile ▾</span>
                <div className="dropdown-content">
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">Order History</Link>
                  <Link to="/faq">FAQ</Link>
                </div>
              </div>
            )}
          </nav>

          {/* Right Side - Track Order Button + Services + Contact */}
          <div className="header-right">
            <div 
              className="nav-link" 
              onClick={() => document.querySelector('.what-we-offer-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer' }}
            >
              Services
            </div>
            <div className="nav-link">Contact</div>
            <button 
              className="track-order-btn" 
              onClick={() => {
                const trackingSection = document.querySelector('.tracking-section');
                if (trackingSection) {
                  trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Track Package
            </button>

            {/* User Auth/Menu Section */}
            {user ? (
              <div className="user-menu">
                <button
                  className="user-menu-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  👤 {user.username} ▾
                </button>

                {menuOpen && (
                  <div className="user-dropdown" onMouseLeave={() => setMenuOpen(false)}>
                    <div className="dropdown-header">Welcome, {user.username}!</div>
                    <Link to="/user" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      📊 Dashboard
                    </Link>
                    <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      👤 Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      📦 Orders
                    </Link>
                    <Link to="/cart" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      🛒 Cart ({cartState.items.length})
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item admin-item" onClick={() => setMenuOpen(false)}>
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    <button
                      className="dropdown-item logout-btn"
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-section">
                <button className="login-btn" onClick={onLogin}>
                  Login
                </button>
                <button className="register-btn" onClick={onRegister}>
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-header">
                <span>Menu</span>
                <button 
                  className="mobile-menu-close"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ✕
                </button>
              </div>
              <nav className="mobile-nav">
                {user && (
                  <>
                    <a href="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</a>
                    <a href="/orders" onClick={() => setMobileMenuOpen(false)}>Order History</a>
                    <a href="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                  </>
                )}
                <span onClick={() => { 
                  document.querySelector('.what-we-offer-section')?.scrollIntoView({ behavior: 'smooth' }); 
                  setMobileMenuOpen(false); 
                }}>Services</span>
                <span>Contact</span>
                <span onClick={() => { 
                  document.querySelector('.tracking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
                  setMobileMenuOpen(false); 
                }}>Track Package</span>
              </nav>
              {!user && (
                <div className="mobile-auth">
                  <button className="mobile-login-btn" onClick={() => { onLogin(); setMobileMenuOpen(false); }}>
                    Login
                  </button>
                  <button className="mobile-register-btn" onClick={() => { onRegister(); setMobileMenuOpen(false); }}>
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;