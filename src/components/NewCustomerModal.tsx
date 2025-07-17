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
    website: ''
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.stateProvince || !formData.postalCode) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call for new customer registration
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email, // using email as username for simplicity
          email: formData.email,
          password: formData.firstName + formData.lastName + '123', // temp password for demo
          phone: formData.phone,
          stateProvince: formData.stateProvince,
          postalCode: formData.postalCode
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      setRegisteredEmail(formData.email);
      setAwaitingVerification(true);
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
      const response = await fetch('http://localhost:5000/api/verify-email', {
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
              <p style={{ marginBottom: '0.75rem', fontWeight: 500 }}><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
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
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'hidden',
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
                border: '2px solid #e5e7eb',
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  background: '#fff'
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
              {loading ? 'Registering...' : 'Register Customer'}
            </button>
            <button 
              type="button"
              style={{
                background: 'white',
                color: '#dc2626',
                border: '2px solid #dc2626',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={onClose}
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