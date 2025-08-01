import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackingDisplay from './TrackingDisplay';

const TrackingPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const [searchTrackingNumber, setSearchTrackingNumber] = useState(trackingNumber || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTrackingNumber.trim()) {
      navigate(`/track/${searchTrackingNumber.trim()}`);
    }
  };

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
      <section className="hero-bg">
        <div className="hero-section">
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
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ 
                  color: '#111', 
                  fontWeight: 700, 
                  fontSize: '2.2rem', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📦 Package Tracking
                </h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Track your shipments and view real-time updates</p>
              </div>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                }}
              >
                ← Back to Home
              </button>
            </div>

            {/* Search Form */}
            <div style={{
              background: 'rgba(248, 250, 252, 0.8)',
              borderRadius: '1.5rem',
              padding: '2rem',
              marginBottom: '2rem',
              border: '1px solid rgba(220, 38, 38, 0.1)'
            }}>
              <h2 style={{ 
                color: '#111', 
                fontWeight: 700, 
                fontSize: '1.4rem', 
                marginBottom: '1.5rem' 
              }}>
                Enter Tracking Number
              </h2>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={searchTrackingNumber}
                    onChange={(e) => setSearchTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number..."
                    style={{
                      width: '100%',
                      padding: '1rem 1.2rem',
                      border: '1.5px solid rgba(220, 38, 38, 0.2)',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      color: '#111',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#dc2626';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '1rem 2rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }}
                >
                  Track Package
                </button>
              </form>
            </div>

            {/* Tracking Display */}
            {trackingNumber && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '1.5rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(220,38,38,0.06)',
                padding: '2rem',
                border: '1px solid rgba(220, 38, 38, 0.1)',
                backdropFilter: 'blur(10px)',
                marginBottom: '2rem'
              }}>
                <TrackingDisplay trackingNumber={trackingNumber} />
              </div>
            )}

            {/* Help Section */}
            {!trackingNumber && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '1.5rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(220,38,38,0.06)',
                padding: '2rem',
                border: '1px solid rgba(220, 38, 38, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <h2 style={{ 
                  color: '#111', 
                  fontWeight: 700, 
                  fontSize: '1.4rem', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  💡 Need Help?
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '2rem' 
                }}>
                  <div>
                    <h3 style={{ 
                      color: '#111', 
                      fontWeight: 600, 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📋 How to Track
                    </h3>
                    <ul style={{ 
                      color: '#666', 
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      listStyle: 'none',
                      padding: 0
                    }}>
                      <li style={{ marginBottom: '0.5rem' }}>• Enter your tracking number in the search box above</li>
                      <li style={{ marginBottom: '0.5rem' }}>• Click "Track Package" to view details</li>
                      <li style={{ marginBottom: '0.5rem' }}>• View real-time status updates and location</li>
                    </ul>
                  </div>
                  <div>
                    <h3 style={{ 
                      color: '#111', 
                      fontWeight: 600, 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔍 Finding Your Tracking Number
                    </h3>
                    <ul style={{ 
                      color: '#666', 
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      listStyle: 'none',
                      padding: 0
                    }}>
                      <li style={{ marginBottom: '0.5rem' }}>• Check your order confirmation email</li>
                      <li style={{ marginBottom: '0.5rem' }}>• Look for the tracking number on your receipt</li>
                      <li style={{ marginBottom: '0.5rem' }}>• Contact customer service if you need help</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrackingPage;