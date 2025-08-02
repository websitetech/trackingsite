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
            <span className="address">1570 Midland Ave, Scarborough, Ontario, M1P 3C2, Canada</span>
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
              alt="Noble-Speedytrac Inc. logo" 
              className="logo-image"
            />
          </Link>

          {/* Navigation Menu - Center */}
          <nav className="main-nav">
          </nav>

          {/* Right Side - Track Order Button + Services + Contact */}
          <div className="header-right">

            {/* Services - Only for non-logged-in users */}
            {!user && (
              <div 
                className="nav-link" 
                onClick={() => {
                  const whatWeOfferSection = document.querySelector('#what-we-offer');
                  if (whatWeOfferSection) {
                    // If we're on the landing page, just scroll to the section
                    whatWeOfferSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    // If we're on another page, navigate to home and then scroll
                    navigate('/');
                    // Use setTimeout to ensure navigation completes before scrolling
                    setTimeout(() => {
                      document.querySelector('#what-we-offer')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                Services
              </div>
            )}

            <div 
              className="nav-link" 
              onClick={() => document.querySelector('.footer-banner')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer' }}
            >
              Contact
            </div>

            {/* Order History and FAQ - Only for logged-in users */}
            {user && (
              <>
                <Link to="/orders" className="nav-link">
                  Order History
                </Link>
                <Link to="/faq" className="nav-link">
                  FAQ
                </Link>
              </>
            )}




            {/* Cart Button */}
            {user && (
              <Link 
                to="/cart" 
                className="nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  position: 'relative',
                  fontSize: '1.1rem'
                }}
              >
                🛒
                {cartState.items.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid white'
                  }}>
                    {cartState.items.length}
                  </span>
                )}
              </Link>
            )}

            {/* User Auth/Menu Section */}
            {user ? (
              <div className="user-menu">
                <button
                  className="user-menu-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(248,250,252,0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '2rem',
                    padding: '0.6rem 1.2rem',
                    color: '#374151',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(248,250,252,0.2) 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(248,250,252,0.1) 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    borderRadius: '50%',
                    fontSize: '1rem'
                  }}>
                    👤
                  </span>
                  <span style={{ color: '#1f2937', fontWeight: 700 }}>
                    {user.username}
                  </span>
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '0.8rem',
                    marginLeft: '0.2rem'
                  }}>
                    ▾
                  </span>
                </button>

                {menuOpen && (
                  <div className="user-dropdown" onMouseLeave={() => setMenuOpen(false)}>
                    <div className="dropdown-header">Welcome, {user.username}!</div>
                    <Link to="/user" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      📊 Dashboard
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
                {/* Services - Only for non-logged-in users */}
                {!user && (
                  <span onClick={() => { 
                    const whatWeOfferSection = document.querySelector('#what-we-offer');
                    if (whatWeOfferSection) {
                      // If we're on the landing page, just scroll to the section
                      whatWeOfferSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      // If we're on another page, navigate to home and then scroll
                      navigate('/');
                      // Use setTimeout to ensure navigation completes before scrolling
                      setTimeout(() => {
                        document.querySelector('#what-we-offer')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                    setMobileMenuOpen(false); 
                  }}>Services</span>
                )}
                
                <span onClick={() => { 
                  document.querySelector('.footer-banner')?.scrollIntoView({ behavior: 'smooth' }); 
                  setMobileMenuOpen(false); 
                }}>Contact</span>
                
                {user && (
                  <>
                    <a href="/orders" onClick={() => setMobileMenuOpen(false)}>Order History</a>
                    <a href="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                  </>
                )}
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