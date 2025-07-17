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
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h2>Noble SpeedyTrac. inc</h2>
        </div>
        <nav className="nav">
          {user ? (
            <div className="user-section">
              <span style={{ fontSize: '1.7rem', marginRight: '0.5rem', verticalAlign: 'middle' }} title="Profile">👤</span>
              <span className="welcome">Welcome, {user.username}!</span>
              <button className="btn btn-secondary" onClick={onLogout}>
                Logout
              </button>
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