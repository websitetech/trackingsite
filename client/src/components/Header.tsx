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

// User-specific notifications
const userNotifications = {
  'john_doe': [
    { id: 1, message: 'Your shipment TRK123456789 has been delivered.', read: false, date: '2024-06-01' },
    { id: 2, message: 'Shipment TRK987654321 is now in transit.', read: false, date: '2024-06-03' },
    { id: 3, message: 'Welcome to NobleSpeedytrac!', read: true, date: '2024-05-30' },
  ],
  'jane_smith': [
    { id: 4, message: 'Your shipment TRK555666777 has been delivered.', read: false, date: '2024-05-28' },
    { id: 5, message: 'Welcome to NobleSpeedytrac!', read: true, date: '2024-05-25' },
  ],
  'admin': [
    { id: 6, message: 'New shipment TRK111222333 has been created.', read: false, date: '2024-06-05' },
    { id: 7, message: 'Welcome to NobleSpeedytrac!', read: true, date: '2024-06-01' },
  ],
};

// Default empty notifications for new users
const defaultNotifications: typeof userNotifications['john_doe'] = [];

const Header: React.FC<HeaderProps> = ({ user, onLogin, onRegister, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { state: cartState } = useCart();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  // Get user-specific notifications or default to empty array
  const userNotificationsList = user ? (userNotifications[user.username as keyof typeof userNotifications] || defaultNotifications) : defaultNotifications;
  const [notifications, setNotifications] = useState(userNotificationsList);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleLogoClick2 = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  };

  const handleBellClick = () => {
    setNotifOpen((open) => !open);
    // Mark all as read when opening
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
  };

  return (
    <header className="header" style={{ pointerEvents: 'auto', zIndex: 9999 }}>
      <div className="header-content" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo - Left side */}
        <Link 
          to="/"
          className="logo" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer', 
            pointerEvents: 'auto',
            textDecoration: 'none',
            color: 'inherit',
            position: 'relative',
            zIndex: 10000
          }}
          onClick={handleLogoClick2}
          title="Click to go to home page"
        >
          <img 
            src={logo} 
            alt="NobleSpeedytrac logo" 
            style={{ 
              height: 80, 
              width: 'auto', 
              marginRight: 0, 
              cursor: 'pointer', 
              pointerEvents: 'auto',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
            }}
          />
        </Link>

        {/* Center and Right side content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Navigation - Center */}
          <nav className="nav">
            {user ? (
              <div className="user-section" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* User section - no dropdown here anymore */}
              </div>
            ) : (
              <div className="auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="btn btn-login" 
                  onClick={onLogin}
                  style={{
                    background: 'none',
                    border: '2px solid #b91c1c',
                    color: '#b91c1c',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Login
                </button>
                <button 
                  className="btn btn-register" 
                  onClick={onRegister}
                  style={{
                    background: '#b91c1c',
                    border: '2px solid #b91c1c',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Register
                </button>
              </div>
            )}
          </nav>

          {/* User Icons - Right side (only for logged in users) */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Notification Bell */}
              <div style={{ position: 'relative', display: 'inline-block', marginRight: 8 }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#b91c1c',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    position: 'relative',
                  }}
                  aria-label="Notifications"
                  onClick={handleBellClick}
                >
                  <span role="img" aria-label="bell">🔔</span>
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      background: '#dc2626',
                      color: 'white',
                      borderRadius: '50%',
                      width: 16,
                      height: 16,
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}>{unreadCount}</span>
                  )}
                </button>
                {/* Dropdown */}
                {notifOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '2.5rem',
                    right: 0,
                    background: 'white',
                    color: '#1a1a1a',
                    borderRadius: '0.75rem',
                    boxShadow: '0 8px 32px rgba(185,28,28,0.12)',
                    minWidth: 260,
                    zIndex: 3000,
                    padding: '0.5rem 0',
                    maxHeight: 260,
                    overflowY: 'auto',
                  }}>
                    <div style={{ fontWeight: 700, color: '#b91c1c', padding: '0.5rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>Notifications</div>
                    {notifications.length === 0 && <div style={{ padding: '1rem', color: '#6b7280' }}>No notifications.</div>}
                                      {notifications.map((n: any) => (
                    <div key={n.id} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #f3f4f6', background: n.read ? 'white' : '#fef2f2', color: n.read ? '#374151' : '#b91c1c', fontWeight: n.read ? 400 : 600 }}>
                      {n.message}
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{n.date}</div>
                    </div>
                  ))}
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#b91c1c',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    position: 'relative'
                  }}
                >
                  🛒
                  {cartState.items.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: '#dc2626',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {cartState.items.length}
                    </span>
                  )}
                </button>
              </Link>

              {/* Burger icon - Last */}
              <div style={{ position: 'relative' }}>
                <button
                  className="burger-menu"
                  aria-label="Open menu"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: '#b91c1c',
                    verticalAlign: 'middle',
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onClick={() => setMenuOpen((open) => !open)}
                  onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1, transition: 'transform 0.3s', transform: menuOpen ? 'rotate(90deg)' : 'none' }}>☰</span>
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '2.5rem',
                    right: 0,
                    background: 'white',
                    color: '#1a1a1a',
                    borderRadius: '0.75rem',
                    boxShadow: '0 8px 32px rgba(185,28,28,0.12)',
                    minWidth: 200,
                    zIndex: 3000,
                    padding: '0.5rem 0',
                  }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/orders');
                      }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      Order History
                    </button>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/profile');
                      }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      Profile
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1.5rem',
                          fontSize: '1rem',
                          color: '#b91c1c',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onClick={() => {
                          setMenuOpen(false);
                          navigate('/admin');
                        }}
                        onMouseDown={e => e.preventDefault()}
                      >
                        Admin
                      </button>
                    )}
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        color: '#b91c1c',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      Logout
                    </button>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        color: '#b91c1c',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/faq');
                      }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      Help
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 