import { useState } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
              color: '#dc2626',
              padding: '0.2rem 0.7rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              transition: 'background 0.2s, color 0.2s',
              alignSelf: 'flex-start',
            }}
            onClick={onClose}
            aria-label="Close"
            onMouseOver={e => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.color = '#b91c1c';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="username" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1a1a1a'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#dc2626';
                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1a1a1a'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#dc2626';
                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {error && (
            <div style={{ color: '#dc2626', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              padding: '0.875rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)'
            }}
            onMouseOver={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(220, 38, 38, 0.3)';
              }
            }}
            onMouseOut={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(220, 38, 38, 0.2)';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Don't have an account? </span>
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'color 0.2s'
            }}
            onMouseOver={e => {
              e.currentTarget.style.color = '#b91c1c';
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 