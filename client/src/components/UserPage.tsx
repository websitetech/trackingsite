import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import PhoneInput from './PhoneInput';
import type { CountryCode } from '../utils/phoneValidation';
import CustomPopup from './CustomPopup';
import TrackingDisplay from './TrackingDisplay';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

interface Tariff {
  customer: string;
  exclusive: number;
  direct: number;
  rush: number;
  sameday: number;
}

interface UserPageProps {
  user: User;
}

const TARIFFS: Tariff[] = [
  { customer: 'APS', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'AMD', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'CTI', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'StenTech', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'FedEx depot / UPS', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'ECT', exclusive: 87.5, direct: 75.5, rush: 53.5, sameday: 27.5 },
  { customer: 'ATF', exclusive: 87.5, direct: 75.5, rush: 53.5, sameday: 27.5 },
  { customer: 'Tenstorrent', exclusive: 52.5, direct: 44.5, rush: 29.5, sameday: 21.5 },
  { customer: 'MACKIE', exclusive: 160.5, direct: 131.5, rush: 109.5, sameday: 89.5 },
  { customer: 'Bldg. A to B', exclusive: 160.5, direct: 131.5, rush: 109.5, sameday: 89.5 },
];

const SERVICE_TYPES = [
  { key: 'exclusive', label: 'Exclusive (Any time)' },
  { key: 'direct', label: 'Direct (Before 3pm)' },
  { key: 'rush', label: 'Rush 3-4 Hours (Before 1pm)' },
  { key: 'sameday', label: 'Same day (Before 12 Noon)' },
];

const REQUIRED_FIELDS = ['customer', 'serviceType', 'recipientName', 'recipientAddress', 'contactNumber'] as const;

type FormFields = {
  customer: string;
  serviceType: keyof Omit<Tariff, 'customer'> | '';
  recipientName: string;
  recipientAddress: string;
  contactNumber: string;
};

const UserPage: React.FC<UserPageProps> = ({ user }) => {
  const [form, setForm] = useState<FormFields>({
    customer: '',
    serviceType: '',
    recipientName: '',
    recipientAddress: '',
    contactNumber: '',
  });
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setAddedToCart(false);
  };

  const handlePhoneChange = (value: string, country: CountryCode, isValid: boolean) => {
    setForm({ ...form, contactNumber: value });
    setPhoneCountry(country);
    setIsPhoneValid(isValid);
    setError('');
    setAddedToCart(false);
  };

  const getPrice = () => {
    const tariff = TARIFFS.find(t => t.customer === form.customer);
    if (!tariff || !form.serviceType) return '';
    return tariff[form.serviceType as keyof Omit<Tariff, 'customer'>]
      ? `$${tariff[form.serviceType as keyof Omit<Tariff, 'customer'>].toFixed(2)}`
      : '';
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    for (let field of REQUIRED_FIELDS) {
      if (!form[field]) {
        setError('Please fill in all required fields.');
        return;
      }
    }

    if (!isPhoneValid) {
      setError('Please enter a valid phone number.');
      return;
    }

    const price = getPrice();
    if (!price) {
      setError('Please select a valid customer and service type.');
      return;
    }

    const serviceTypeLabel = SERVICE_TYPES.find(s => s.key === form.serviceType)?.label || form.serviceType;
    const priceValue = parseFloat(price.replace('$', ''));
    const fullPhoneNumber = phoneCountry ? `${phoneCountry.dialCode} ${form.contactNumber}` : form.contactNumber;

          const cartItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        customer: form.customer,
        serviceType: form.serviceType,
        serviceTypeLabel,
        recipientName: form.recipientName,
        recipientAddress: form.recipientAddress,
        contactNumber: fullPhoneNumber,
        price: priceValue,
      };

    addItem(cartItem);
    setAddedToCart(true);
    setForm({
      customer: '',
      serviceType: '',
      recipientName: '',
      recipientAddress: '',
      contactNumber: '',
    });
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleTrackClick = () => {
    console.log('🚀 Track button clicked!');
    console.log('📦 Tracking number:', trackingNumber);
    
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }

    console.log('✅ Showing tracking modal');
    setShowTrackingModal(true);
  };

  const handleCloseTrackingModal = () => {
    console.log('🔒 Closing tracking modal');
    setShowTrackingModal(false);
  };

  const renderTrackingContent = () => {
    console.log('🎨 Rendering tracking content for:', trackingNumber);
    return (
      <div style={{ minHeight: '400px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Tracking Information
          </h3>
        </div>
        <TrackingDisplay trackingNumber={trackingNumber} />
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
      <section className="hero-bg">
        <div className="hero-section">
          {/* Welcome Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            color: 'black',
            borderRadius: '2rem',
            boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 8px 24px rgba(220,38,38,0.06), 0 0 0 1px rgba(220,38,38,0.08)',
            padding: '2.5rem',
            margin: '32px auto 24px auto',
            maxWidth: 600,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(220,38,38,0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <h1 style={{ color: '#111', fontWeight: 700, fontSize: '1.8rem', marginBottom: 8 }}>Welcome back, {user.username}! 👋</h1>
            <p style={{ color: '#666', fontSize: '1rem', marginBottom: 24, textAlign: 'center' }}>Manage your shipments and track your packages</p>
            
            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/orders')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>📋</span>
                <span>View Order History</span>
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>👤</span>
                <span>Profile Settings</span>
              </button>
            </div>
          </div>

          {/* Admin Quick Actions - Only for admin users */}
          {user.role === 'admin' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderRadius: '2rem',
              boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 8px 24px rgba(220,38,38,0.06), 0 0 0 1px rgba(220,38,38,0.08)',
              padding: '2.5rem',
              margin: '2rem auto',
              maxWidth: 800,
              width: '100%',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(220,38,38,0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <h2 style={{ color: '#b91c1c', fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.5rem', textAlign: 'center' }}>Admin Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <button
                  onClick={() => window.location.href = '/admin'}
                  style={{
                    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1rem',
                    padding: '1.2rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 8px 24px rgba(220,38,38,0.25), 0 4px 12px rgba(220,38,38,0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(220,38,38,0.35), 0 6px 16px rgba(220,38,38,0.25)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.25), 0 4px 12px rgba(220,38,38,0.15)';
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>📊</span>
                  <span>Admin Dashboard</span>
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin?tab=users'}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '2rem' }}>👥</span>
                  <span>User Management</span>
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin?tab=shipments'}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '2rem' }}>📦</span>
                  <span>Shipment Management</span>
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin?tab=tracking'}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '2rem' }}>🚚</span>
                  <span>Tracking Management</span>
                </button>
              </div>
            </div>
          )}


          {/* Compact Modern Tracking Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
            borderRadius: '1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06), 0 4px 12px rgba(220,38,38,0.04)',
            padding: '2rem',
            margin: '1.5rem auto',
            maxWidth: 550,
            width: '100%',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(220,38,38,0.08)',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}>
            {/* Subtle decorative element */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(220,38,38,0.03) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            {/* Compact Header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              position: 'relative',
              zIndex: 1 
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                borderRadius: '50%',
                fontSize: '1.8rem',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(220,38,38,0.2)'
              }}>
                📦
              </div>
              <h2 style={{ 
                color: '#111', 
                fontWeight: 700, 
                fontSize: '1.8rem', 
                marginBottom: '0.5rem'
              }}>
                Track Package
              </h2>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                Enter your tracking number for real-time updates
              </p>
            </div>
            {/* Compact Tracking Form */}
            <form style={{ 
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Enter Tracking Number (e.g., TRK123456789)" 
                  value={trackingNumber}
                  onChange={(e) => {
                    console.log('📝 Tracking number changed:', e.target.value);
                    setTrackingNumber(e.target.value);
                  }}
                  style={{ 
                    width: '100%',
                    padding: '1rem 1.5rem', 
                    borderRadius: '0.75rem', 
                    border: '1px solid rgba(220,38,38,0.15)', 
                    fontSize: '1rem', 
                    color: '#111', 
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#dc2626';
                    e.target.style.boxShadow = '0 4px 12px rgba(220,38,38,0.12), 0 0 0 3px rgba(220,38,38,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(220,38,38,0.15)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                />
                {trackingNumber && (
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#dc2626',
                    fontSize: '1rem'
                  }}>
                    ✓
                  </div>
                )}
              </div>

              <button 
                type="button" 
                onClick={handleTrackClick}
                disabled={!trackingNumber.trim()}
                style={{ 
                  background: trackingNumber.trim() 
                    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
                    : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '1rem 2rem', 
                  borderRadius: '0.75rem', 
                  fontWeight: 600, 
                  fontSize: '1rem', 
                  cursor: trackingNumber.trim() ? 'pointer' : 'not-allowed', 
                  boxShadow: trackingNumber.trim() 
                    ? '0 6px 16px rgba(220,38,38,0.25)' 
                    : 'none',
                  transition: 'all 0.3s ease',
                  opacity: trackingNumber.trim() ? 1 : 0.7
                }}
                onMouseOver={(e) => {
                  if (trackingNumber.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(220,38,38,0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (trackingNumber.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(220,38,38,0.25)';
                  }
                }}
              >
                🔍 Track Now
              </button>
            </form>

            {/* Compact Quick Info */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(248,250,252,0.6)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(220,38,38,0.06)',
              position: 'relative',
              zIndex: 1
            }}>
              <h4 style={{ 
                color: '#374151', 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: 0
              }}>
                💡 Quick Tips
              </h4>
              <ul style={{ 
                color: '#6b7280', 
                fontSize: '0.85rem', 
                lineHeight: '1.6',
                margin: 0,
                padding: 0,
                listStyle: 'none'
              }}>
                <li style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  marginBottom: '0.5rem',
                  paddingLeft: '1.2rem',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '0.1rem',
                    color: '#dc2626',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>•</span>
                  Tracking numbers start with "TRK" followed by 9 digits
                </li>
                <li style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  marginBottom: '0.5rem',
                  paddingLeft: '1.2rem',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '0.1rem',
                    color: '#dc2626',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>•</span>
                  New shipments may take up to 24 hours to appear
                </li>
                <li style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  paddingLeft: '1.2rem',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '0.1rem',
                    color: '#dc2626',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>•</span>
                  Contact support if you need assistance
                </li>
              </ul>
            </div>
          </div>
          
          {/* Create New Shipment - Only for non-admin users */}
          {user.role !== 'admin' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              color: 'black',
              borderRadius: '2rem',
              boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 8px 24px rgba(220,38,38,0.06), 0 0 0 1px rgba(220,38,38,0.08)',
              padding: '2.5rem',
              margin: '0 auto',
              maxWidth: 600,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 32,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(220,38,38,0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>Create New Shipment</div>
              {!addedToCart ? (
                <form className="tracking-form" onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label style={{ color: '#111', fontWeight: 600 }}>Customer *</label>
                    <select name="customer" value={form.customer} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }}>
                      <option value="">Select customer</option>
                      {TARIFFS.map(t => <option key={t.customer} value={t.customer}>{t.customer}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#111', fontWeight: 600 }}>Service Type *</label>
                    <select name="serviceType" value={form.serviceType} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }}>
                      <option value="">Select service type</option>
                      {SERVICE_TYPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#111', fontWeight: 600 }}>Recipient Name *</label>
                    <input name="recipientName" value={form.recipientName} onChange={handleChange} required placeholder="Enter recipient name" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#111', fontWeight: 600 }}>Recipient Address *</label>
                    <input name="recipientAddress" value={form.recipientAddress} onChange={handleChange} required placeholder="Enter recipient address" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }} />
                  </div>
                  <div className="form-group">
                                      <label style={{ color: '#111', fontWeight: 600 }}>Contact Number *</label>
                  <PhoneInput
                    value={form.contactNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter contact number"
                    required={true}
                  />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#111', fontWeight: 600 }}>Calculated Price</label>
                    <div className="cost" style={{ fontSize: '1.3rem', color: '#dc2626', fontWeight: 700 }}>{getPrice()}</div>
                  </div>
                  {error && <div className="error-message" style={{ marginBottom: 8, color: '#dc2626' }}>{error}</div>}
                  <button type="submit" className="btn btn-primary track-btn" style={{ marginTop: 8, background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Add to Cart</button>
                </form>
              ) : (
                <div className="success-message" style={{ animation: 'fadeInUp 0.7s', color: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3>Added to Cart!</h3>
                  <p>Your shipment for <b>{form.customer}</b> has been added to your cart.</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setAddedToCart(false)} style={{ background: '#fff', color: '#dc2626', border: '2px solid #dc2626', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Add Another</button>
                    <button className="btn btn-primary" onClick={handleViewCart} style={{ background: 'linear-gradient(135deg, #facc15 0%, #fde047 100%)', color: '#1a1a1a', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(185,28,28,0.08)' }}>View Cart</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tracking Modal */}
      {showTrackingModal && (
        <CustomPopup
          isOpen={showTrackingModal}
          onClose={handleCloseTrackingModal}
          title="Track Package"
          width="800px"
          renderContent={renderTrackingContent}
        />
      )}
    </div>
  );
};

export default UserPage; 