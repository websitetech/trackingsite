import { useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [phone, setPhone] = useState('');

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
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, postalCode, stateProvince, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
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
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Register</h2>
          <button 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.5rem',
              borderRadius: '0.5rem'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="registerUsername" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Username</label>
            <input
              type="text"
              id="registerUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                background: '#fff'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="registerEmail" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Email</label>
            <input
              type="email"
              id="registerEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              style={{
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                background: '#fff'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="registerPassword" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Password</label>
            <input
              type="password"
              id="registerPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                background: '#fff'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="confirmPassword" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              style={{
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                background: '#fff'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="registerPhone" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Phone Number</label>
            <input
              type="tel"
              id="registerPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              required
              style={{
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                background: '#fff'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="registerPostalCode" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Postal Code</label>
            <input
              type="text"
              id="registerPostalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter postal code"
              required
              style={{
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                background: '#fff'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="registerStateProvince" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>State/Province</label>
            <input
              type="text"
              id="registerStateProvince"
              value={stateProvince}
              onChange={(e) => setStateProvince(e.target.value)}
              placeholder="Enter state or province"
              required
              style={{
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                background: '#fff'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              color: '#dc2626',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '2px solid #fecaca',
              fontSize: '0.95rem',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <button 
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontWeight: 500
              }}
              onClick={onSwitchToLogin}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 