import { useState } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
}

interface ShipModalProps {
  onClose: () => void;
  user: User | null;
}

const ShipModal: React.FC<ShipModalProps> = ({ onClose, user }) => {
  const [originPostal, setOriginPostal] = useState('');
  const [destinationPostal, setDestinationPostal] = useState('');
  const [weight, setWeight] = useState('');
  const [serviceType, setServiceType] = useState('standard');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to create a shipment');
      return;
    }

    if (!originPostal || !destinationPostal || !weight || !recipientName || !recipientAddress) {
      setError('Please fill in all fields');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://trackingsite.onrender.com/api/ship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin_postal: originPostal,
          destination_postal: destinationPostal,
          weight: weightNum,
          service_type: serviceType,
          recipient_name: recipientName,
          recipient_address: recipientAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create shipment');
      }

      setSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Create Shipment</h2>
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
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Please login to create a shipment.</p>
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
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {!success ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Create New Shipment</h2>
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
                <label htmlFor="shipOriginPostal" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Origin Postal Code</label>
                <input
                  type="text"
                  id="shipOriginPostal"
                  value={originPostal}
                  onChange={(e) => setOriginPostal(e.target.value)}
                  placeholder="Enter origin postal code"
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
                <label htmlFor="shipDestinationPostal" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Destination Postal Code</label>
                <input
                  type="text"
                  id="shipDestinationPostal"
                  value={destinationPostal}
                  onChange={(e) => setDestinationPostal(e.target.value)}
                  placeholder="Enter destination postal code"
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
                <label htmlFor="shipWeight" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Weight (lbs)</label>
                <input
                  type="number"
                  id="shipWeight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight in pounds"
                  step="0.1"
                  min="0.1"
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
                <label htmlFor="shipServiceType" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Service Type</label>
                <select
                  id="shipServiceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    background: '#fff'
                  }}
                >
                  <option value="standard">Standard (3-5 days)</option>
                  <option value="express">Express (2-3 days)</option>
                  <option value="overnight">Overnight (1 day)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="recipientName" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Recipient Name</label>
                <input
                  type="text"
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient name"
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
                <label htmlFor="recipientAddress" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Recipient Address</label>
                <textarea
                  id="recipientAddress"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter recipient address"
                  rows={3}
                  required
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
                {loading ? 'Creating...' : 'Create Shipment'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ padding: '1rem 0' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Shipment Created Successfully!</h3>
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
            
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '2rem',
              borderRadius: '20px',
              margin: '1.5rem 0',
              border: '2px solid rgba(220, 38, 38, 0.1)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(220, 38, 38, 0.1)' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Tracking Number:</span>
                <span style={{ fontWeight: 800, color: '#dc2626', fontFamily: 'Courier New, monospace', fontSize: '1.2rem' }}>{success.tracking_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Package ID:</span>
                <span>{success.package_id}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                style={{
                  background: 'white',
                  color: '#dc2626',
                  border: '2px solid #dc2626',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSuccess(null)}
              >
                Create Another
              </button>
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
        )}
      </div>
    </div>
  );
};

export default ShipModal; 