import { useState } from 'react';
import logo from '../assets/logo.jpg';

interface User {
  id: number;
  username: string;
  email: string;
}

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onRegister, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Noble SpeedyTrac. inc logo" style={{ height: 48, width: 'auto', marginRight: 0 }} />
        </div>
        <nav className="nav">
          {user ? (
            <div className="user-section" style={{ position: 'relative' }}>
              {/* Burger icon after logo */}
              <button
                className="burger-menu"
                aria-label="Open menu"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  marginLeft: '0.75rem',
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
              {/* Dropdown menu with animation */}
              <div
                className="dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '2.5rem',
                  right: 0,
                  background: 'white',
                  color: '#1a1a1a',
                  borderRadius: '0.75rem',
                  boxShadow: '0 8px 32px rgba(185,28,28,0.12)',
                  minWidth: 170,
                  zIndex: 2000,
                  padding: '0.5rem 0',
                  opacity: menuOpen ? 1 : 0,
                  pointerEvents: menuOpen ? 'auto' : 'none',
                  transform: menuOpen ? 'translateY(0)' : 'translateY(-16px)',
                  transition: 'opacity 0.25s, transform 0.25s',
                }}
              >
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
                    // Profile action (could navigate to profile page)
                  }}
                  onMouseDown={e => e.preventDefault()}
                >
                  Profile
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
                    onLogout();
                  }}
                  onMouseDown={e => e.preventDefault()}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-login" onClick={onLogin}>
                Login
              </button>
              <button className="btn btn-register" onClick={onRegister}>
                Register
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 