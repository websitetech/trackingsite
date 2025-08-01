import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { trackingNumbers, totalAmount } = location.state || {};
  const fromCart = location.state?.fromCart || false;
  const shipmentCount = location.state?.shipmentCount || 1;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Tracking number copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy tracking number:', err);
    }
  };

  const handleGoToUser = () => {
    navigate('/user');
  };

  const handleCreateNewShipment = () => {
    navigate('/user');
  };

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        padding: '3rem',
        margin: '2rem auto',
        maxWidth: 600,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ color: '#111', fontWeight: 700, fontSize: '2rem', marginBottom: '1rem' }}>
          Payment Successful!
        </h1>
        
        {fromCart ? (
          <div>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Your payment of <strong>C${Number(totalAmount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</strong> has been processed successfully.
            </p>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              <strong>{shipmentCount} shipment{shipmentCount > 1 ? 's' : ''}</strong> have been created and are being processed.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Your payment of <strong>C${Number(totalAmount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</strong> has been processed successfully.
            </p>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Your shipment has been created and is being processed.
            </p>
          </div>
        )}

        {/* Tracking Numbers Section */}
        {trackingNumbers && trackingNumbers.length > 0 && (
          <div style={{ 
            background: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '0.75rem', 
            padding: '1.5rem', 
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#0c4a6e', fontWeight: 600, marginBottom: '1rem' }}>
              📦 Your Tracking Numbers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {trackingNumbers.map((trackingNumber: string, index: number) => (
                <div key={index} style={{ 
                  background: 'white', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid #e0e7ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>
                    Shipment {index + 1}:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      color: '#1e40af', 
                      fontWeight: 600, 
                      fontFamily: 'monospace',
                      fontSize: '1.1rem',
                      background: '#f3f4f6',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}>
                      {trackingNumber}
                    </span>
                                         <button
                       onClick={() => copyToClipboard(trackingNumber)}
                       style={{
                         background: '#1e40af',
                         color: 'white',
                         border: 'none',
                         borderRadius: '0.25rem',
                         padding: '0.25rem 0.5rem',
                         fontSize: '0.8rem',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         transition: 'all 0.2s ease'
                       }}
                       onMouseOver={(e) => {
                         e.currentTarget.style.background = '#1d4ed8';
                         e.currentTarget.style.transform = 'scale(1.05)';
                       }}
                       onMouseOut={(e) => {
                         e.currentTarget.style.background = '#1e40af';
                         e.currentTarget.style.transform = 'scale(1)';
                       }}
                       title="Copy tracking number"
                     >
                       📋
                     </button>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ 
              color: '#0c4a6e', 
              fontSize: '0.9rem', 
              marginTop: '1rem', 
              marginBottom: 0,
              fontStyle: 'italic'
            }}>
              💡 You can use these tracking numbers to monitor your shipments in your dashboard.
            </p>
          </div>
        )}

        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '0.75rem', 
          padding: '1rem', 
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#0c4a6e', fontWeight: 600, marginBottom: '0.5rem' }}>
            What happens next?
          </h3>
          <ul style={{ color: '#0c4a6e', fontSize: '0.9rem', margin: 0, paddingLeft: '1.5rem' }}>
            <li>You will receive tracking numbers via email</li>
            <li>Our team will pick up your shipments within 24 hours</li>
            <li>You can track your shipments in your dashboard</li>
            <li>Delivery updates will be sent to your contact number</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGoToUser}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleCreateNewShipment}
            style={{
              background: 'white',
              border: '2px solid #dc2626',
              color: '#dc2626',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Create New Shipment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 