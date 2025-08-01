import { useState } from 'react';
import { authAPI } from '../services/api';
import EmailVerificationModal from './EmailVerificationModal';

interface User {
  id: number;
  username: string;
  email: string;
}

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    user: User;
    email: string;
    verificationCode: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword || !postalCode || !stateProvince || !phone) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authAPI.register({
        username,
        email,
        password,
        postalCode,
        stateProvince,
        phone
      });

      // Check if email verification is required
      if (data.emailVerification) {
        setVerificationData({
          user: data.user,
          email: data.user.email,
          verificationCode: data.verificationCode
        });
        setShowVerification(true);
      } else {
        onSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    if (verificationData) {
      onSuccess(verificationData.user, '');
    }
    setShowVerification(false);
    setVerificationData(null);
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
    setVerificationData(null);
  };

  if (showVerification && verificationData) {
    return (
      <EmailVerificationModal
        onClose={handleVerificationClose}
        onSuccess={handleVerificationSuccess}
        email={verificationData.email}
        verificationCode={verificationData.verificationCode}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
        borderRadius: '2rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 15px 35px rgba(220,38,38,0.1)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(220,38,38,0.1)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            color: '#111', 
            fontSize: '2rem', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Create Account
          </h2>
          <button
            onClick={onClose}
            style={{
              color: '#9ca3af',
              fontSize: '2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="username" style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: '#374151', 
              marginBottom: '0.5rem' 
            }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid rgba(220,38,38,0.1)',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                color: '#111',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#dc2626';
                e.target.style.boxShadow = '0 0 0 4px rgba(220,38,38,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(220,38,38,0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="email" style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: '#374151', 
              marginBottom: '0.5rem' 
            }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid rgba(220,38,38,0.1)',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                color: '#111',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#dc2626';
                e.target.style.boxShadow = '0 0 0 4px rgba(220,38,38,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(220,38,38,0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: '#374151', 
              marginBottom: '0.5rem' 
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid rgba(220,38,38,0.1)',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                color: '#111',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#dc2626';
                e.target.style.boxShadow = '0 0 0 4px rgba(220,38,38,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(220,38,38,0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="stateProvince" style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                State/Province
              </label>
              <input
                type="text"
                id="stateProvince"
                value={stateProvince}
                onChange={(e) => setStateProvince(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid rgba(220,38,38,0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  color: '#111',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#dc2626';
                  e.target.style.boxShadow = '0 0 0 4px rgba(220,38,38,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(220,38,38,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="postalCode" style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid rgba(220,38,38,0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  color: '#111',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#dc2626';
                  e.target.style.boxShadow = '0 0 0 4px rgba(220,38,38,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(220,38,38,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: '#374151', 
              marginBottom: '0.5rem' 
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid rgba(220,38,38,0.1)',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                color: '#111',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#dc2626';
                e.target.style.boxShadow = '0 0 0 4px rgba(220,38,38,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(220,38,38,0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: '#374151', 
              marginBottom: '0.5rem' 
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid rgba(220,38,38,0.1)',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                color: '#111',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#dc2626';
                e.target.style.boxShadow = '0 0 0 4px rgba(220,38,38,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(220,38,38,0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading 
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              padding: '1.2rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(220,38,38,0.25)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(220,38,38,0.35)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.25)';
              }
            }}
          >
            {loading ? '🔄 Creating Account...' : '✨ Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            style={{
              color: '#dc2626',
              fontWeight: 600,
              fontSize: '0.95rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'underline'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#b91c1c';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 