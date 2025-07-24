import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const fromCart = location.state?.fromCart || false;
  const shipmentCount = location.state?.shipmentCount || 1;
  const totalAmount = location.state?.totalAmount || 0;

  const handleGoToUser = () => {
    navigate('/user');
  };

  const handleCreateNewShipment = () => {
    navigate('/user');
  };

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
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
              Your payment of <strong>${totalAmount.toFixed(2)}</strong> has been processed successfully.
            </p>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              <strong>{shipmentCount} shipment{shipmentCount > 1 ? 's' : ''}</strong> have been created and are being processed.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Your payment of <strong>${totalAmount.toFixed(2)}</strong> has been processed successfully.
            </p>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Your shipment has been created and is being processed.
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