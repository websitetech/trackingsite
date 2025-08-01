import { useState } from 'react';
import CustomPopup from './CustomPopup';
import TrackingDisplay from './TrackingDisplay';

const TrackingForm: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  console.log('🎯 TrackingForm component rendered');

  const handleTrackClick = () => {
    console.log('🚀 Track button clicked!');
    console.log('📦 Tracking number:', trackingNumber);
    console.log('📮 Postal code:', postalCode);
    
    if (!trackingNumber || !postalCode) {
      console.log('❌ Missing fields');
      alert('Please fill in both tracking number and postal code');
      return;
    }

    console.log('✅ All fields filled, showing modal');
    setShowTrackingModal(true);
  };

  const handleCloseTrackingModal = () => {
    console.log('🔒 Closing modal...');
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

  console.log('🔄 Current modal state:', showTrackingModal);

  return (
    <div className="tracking-form-container">
      <div className="tracking-form">
        <div className="form-group">
          <label htmlFor="trackingNumber">Enter Tracking Number</label>
          <input
            type="text"
            id="trackingNumber"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter your tracking number"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="postalCode">Postal Code</label>
          <input
            type="text"
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Enter postal code"
            required
          />
        </div>

        <div className="button-group">
          <button 
            type="button" 
            className="btn btn-primary track-btn"
            onClick={handleTrackClick}
            disabled={!trackingNumber.trim()}
            style={{
              opacity: trackingNumber.trim() ? 1 : 0.5,
              cursor: trackingNumber.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Track Package
          </button>
          
          {/* Inline-styled track button to bypass CSS issues */}
          <button 
            type="button" 
            onClick={handleTrackClick}
            disabled={!trackingNumber.trim()}
            style={{
              marginTop: '10px',
              padding: '12px 24px',
              backgroundColor: trackingNumber.trim() ? '#d97706' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: trackingNumber.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              width: '100%',
              maxWidth: '220px',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              boxShadow: trackingNumber.trim() ? '0 4px 15px rgba(217, 119, 6, 0.2)' : 'none',
              transition: 'all 0.3s ease',
              opacity: trackingNumber.trim() ? 1 : 0.6
            }}
            onMouseOver={(e) => {
              if (trackingNumber.trim()) {
                e.currentTarget.style.backgroundColor = '#b45309';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (trackingNumber.trim()) {
                e.currentTarget.style.backgroundColor = '#d97706';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            Track Package (Inline Styled)
          </button>
          
          {/* Simple test button with inline styles */}
          <button 
            type="button" 
            onClick={() => {
              console.log('🧪 Simple test button clicked');
              setShowTrackingModal(true);
            }}
            style={{
              marginTop: '10px',
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%',
              maxWidth: '220px',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            Simple Test Button
          </button>
          
          {/* Test button to verify modal works */}
          <button 
            type="button" 
            onClick={() => {
              console.log('🧪 Test button clicked');
              setShowTrackingModal(true);
            }}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Modal
          </button>
        </div>
      </div>

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

export default TrackingForm; 