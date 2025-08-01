import { useState } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'client' | 'admin'>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login({ username, password });
      
      console.log('Login response:', data);
      console.log('User type selected:', userType);
      console.log('User role from server:', data.user.role);
      
      // Check if user type matches the logged-in user's role
      if (userType === 'admin' && data.user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      
      if (userType === 'client' && data.user.role === 'admin') {
        setError('Please select "Admin" user type for admin login.');
        setLoading(false);
        return;
      }
      
      onSuccess(data.user, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      zIndex: 9999,
      animation: 'fadeIn 0.4s',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      width: '100vw',
      minWidth: 0,
      overflow: 'auto',
    }}>
      <div style={{
        maxWidth: 450,
        width: '100%',
        margin: '0 auto',
        background: 'white',
        borderRadius: 20,
        padding: 48,
        boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
        animation: 'slideDown 0.5s',
        overflowY: 'auto',
        position: 'relative',
        marginTop: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'max-content'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', margin: 0, marginRight: 12 }}>Login</h2>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: 28,
              cursor: 'pointer',
              color: '#d97706',
              padding: '0.2rem 0.7rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              transition: 'background 0.2s, color 0.2s',
              alignSelf: 'flex-start',
            }}
            onClick={onClose}
            aria-label="Close"
            onMouseOver={e => {
              e.currentTarget.style.background = '#fef3c7';
              e.currentTarget.style.color = '#b45309';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#d97706';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* User Type Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
              Login as:
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'client' | 'admin')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#374151',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Username Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#374151',
                fontSize: '1rem',
              }}
              placeholder="Enter your username"
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#374151',
                fontSize: '1rem',
              }}
              placeholder="Enter your password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              color: '#d97706',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : '#d97706',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#b45309';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 119, 6, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#d97706';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.2)';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Register Link */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
            </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#d97706',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#b45309';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#d97706';
              }}
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal; 