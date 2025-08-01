import { useState } from 'react';

interface NewCustomerModalProps {
  onClose: () => void;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    stateProvince: '', // rename from state
    postalCode: '', // rename from zipCode
    company: '',
    website: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'password' || name === 'confirmPassword') setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.stateProvince || !formData.postalCode || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    const username = (formData.firstName + formData.lastName).replace(/\s+/g, '').toLowerCase();
    try {
      const response = await fetch('https://trackingsite.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          stateProvince: formData.stateProvince,
          postalCode: formData.postalCode
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      if (data.emailVerification) {
        setRegisteredEmail(formData.email);
        setAwaitingVerification(true);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while registering the customer');
    } finally {
      setLoading(false);
    }
  };
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerificationError('');
    try {
      const response = await fetch('https://trackingsite.onrender.com/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, code: verificationCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed');
      setSuccess(true);
      setAwaitingVerification(false);
    } catch (err: any) {
      setVerificationError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    const username = (formData.firstName + formData.lastName).replace(/\s+/g, '').toLowerCase();
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>New Customer Registration</h2>
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
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <h3 style={{ color: '#059669', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Customer Registered Successfully!</h3>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Thank you for registering with Noble-Speedytrac Inc. We'll be in touch soon!</p>
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              margin: '1.5rem 0',
              textAlign: 'left',
              border: '2px solid #bae6fd',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
            }}>
              <p style={{ marginBottom: '0.75rem', fontWeight: 500 }}><strong>Username:</strong> {username}</p>
              <p style={{ marginBottom: '0.75rem', fontWeight: 500 }}><strong>Email:</strong> {formData.email}</p>
              {formData.phone && <p style={{ marginBottom: '0.75rem', fontWeight: 500 }}><strong>Phone:</strong> {formData.phone}</p>}
            </div>
            <button 
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (awaitingVerification) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={onClose}>
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Verify Your Email</h2>
            <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280', padding: '0.5rem', borderRadius: '0.5rem' }} onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="verificationCode" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Enter the code sent to your email"
                required
                style={{ padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.75rem', fontSize: '0.95rem', background: '#fff' }}
              />
            </div>
            {verificationError && <div className="error-message">{verificationError}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify Email'}</button>
          </form>
        </div>
      </div>
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
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
        borderRadius: '2rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 15px 35px rgba(220,38,38,0.1)',
        padding: '2.5rem',
        maxWidth: '650px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(220,38,38,0.1)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            color: '#111',
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Create Account
          </h2>
          <button 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#d97706',
              padding: '0.2rem 0.7rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              transition: 'background 0.2s, color 0.2s',
              alignSelf: 'flex-start'
            }}
            onClick={onClose}
            aria-label="Close"
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#fef3c7';
              e.currentTarget.style.color = '#b45309';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#d97706';
            }}
          >
            ×
          </button>
        </div>
        
        <form className="new-customer-form" onSubmit={handleSubmit}>
          <div className="new-customer-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="firstName" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
                style={{
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
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="lastName" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
                style={{
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
              />
            </div>
          </div>
          <div className="new-customer-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                style={{
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
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="phone" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                style={{
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
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="address" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter street address"
              rows={2}
              style={{
                padding: '0.75rem',
                                  border: '2px solid rgba(220,38,38,0.1)',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                background: '#fff',
                resize: 'vertical'
              }}
            />
          </div>
          <div className="new-customer-row-3">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="city" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                style={{
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
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="stateProvince" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>State/Province</label>
              <input
                type="text"
                id="stateProvince"
                name="stateProvince"
                value={formData.stateProvince}
                onChange={handleChange}
                placeholder="Enter state or province"
                required
                style={{
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
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="postalCode" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Postal Code</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
                required
                style={{
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
              />
            </div>
          </div>
          <div className="new-customer-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="company" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
                style={{
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
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="website" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Enter website URL"
                style={{
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
              />
            </div>
          </div>
          <div className="new-customer-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="password" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                style={{
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
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="confirmPassword" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                style={{
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
              />
            </div>
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              style={{
                flex: 1,
                background: loading 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                padding: '1.2rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(220,38,38,0.25)',
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading}
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
            <button 
              type="button"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.9)',
                color: '#dc2626',
                border: '2px solid rgba(220,38,38,0.3)',
                padding: '1.2rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onClick={onClose}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)';
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCustomerModal; 