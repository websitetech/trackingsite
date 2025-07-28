import { useState } from 'react';
import { authAPI } from '../services/api';
import PhoneInput from './PhoneInput';
import type { CountryCode } from '../utils/phoneValidation';

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
  const [phoneCountry, setPhoneCountry] = useState<CountryCode | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'password' || name === 'confirmPassword') setError('');
  };

  const handlePhoneChange = (value: string, country: CountryCode, isValid: boolean) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setPhoneCountry(country);
    setIsPhoneValid(isValid);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.stateProvince || !formData.postalCode || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isPhoneValid) {
      setError('Please enter a valid phone number');
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
    const fullPhoneNumber = phoneCountry ? `${phoneCountry.dialCode} ${formData.phone}` : formData.phone;
    try {
      const data = await authAPI.register({
        username,
        email: formData.email,
        password: formData.password,
        phone: fullPhoneNumber,
        stateProvince: formData.stateProvince,
        postalCode: formData.postalCode
      });
      
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
      await authAPI.verifyEmail({ email: registeredEmail, code: verificationCode });
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
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Thank you for registering with Noble SpeedyTrac. inc. We'll be in touch soon!</p>
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        maxWidth: '800px',
        width: '95%',
        maxHeight: '95vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #f1f5f9'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>New Customer Registration</h2>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>📜 Scroll down to see all form sections</p>
          </div>
          <button 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>
        
        {/* Form Progress Indicator */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          border: '2px solid #f59e0b',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Form Progress</span>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>5 sections</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '20%',
              height: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <form className="new-customer-form" onSubmit={handleSubmit} style={{ gap: '1.5rem' }}>
          {/* Personal Information Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
            padding: '1.5rem', 
            borderRadius: '1rem', 
            border: '2px solid #f59e0b',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#1e293b', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              👤 Personal Information
            </h3>
            <div className="new-customer-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="firstName" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>First Name *</label>
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="lastName" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Last Name *</label>
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
            </div>
          </div>
          {/* Contact Information Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)', 
            padding: '1.5rem', 
            borderRadius: '1rem', 
            border: '2px solid #fb923c',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#1e293b', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📧 Contact Information
            </h3>
            <div className="new-customer-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="email" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Email Address *</label>
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="phone" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Phone Number *</label>
                <PhoneInput
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  required={true}
                />
              </div>
            </div>
          </div>
          {/* Address Information Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
            padding: '1.5rem', 
            borderRadius: '1rem', 
            border: '2px solid #d97706',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#1e293b', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🏠 Address Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <label htmlFor="address" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Street Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete street address"
                rows={3}
                style={{
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  background: '#fff',
                  resize: 'vertical',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
            <div className="new-customer-row-3">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="city" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  style={{
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="stateProvince" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>State/Province *</label>
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="postalCode" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Postal Code *</label>
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>
          </div>
          {/* Business Information Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)', 
            padding: '1.5rem', 
            borderRadius: '1rem', 
            border: '2px solid #f87171',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(248, 113, 113, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#1e293b', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🏢 Business Information
            </h3>
            <div className="new-customer-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="company" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Company Name</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company name (optional)"
                  style={{
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="website" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Website URL</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Enter website URL (optional)"
                  style={{
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>
          </div>
          {/* Account Security Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
            padding: '1.5rem', 
            borderRadius: '1rem', 
            border: '2px solid #6ee7b7',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(110, 231, 183, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#1e293b', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🔒 Account Security
            </h3>
            <div className="new-customer-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="password" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password (min 6 characters)"
                  required
                  style={{
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="confirmPassword" style={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}>Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  style={{
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
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

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginTop: '2rem',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '1rem',
            border: '2px solid #f59e0b',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
          }}>
            <button 
              type="submit" 
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: 'white',
                border: 'none',
                padding: '1.25rem 3rem',
                borderRadius: '1rem',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(217,119,6,0.3)',
                minWidth: '200px'
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(217,119,6,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(217,119,6,0.3)';
                }
              }}
            >
              {loading ? '🔄 Registering...' : '✅ Register Customer'}
            </button>
            <button 
              type="button"
              style={{
                background: 'white',
                color: '#6b7280',
                border: '2px solid #d1d5db',
                padding: '1.25rem 3rem',
                borderRadius: '1rem',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: '150px'
              }}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCustomerModal; 