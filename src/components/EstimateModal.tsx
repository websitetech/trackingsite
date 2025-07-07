import { useState } from 'react';

interface EstimateModalProps {
  onClose: () => void;
}

const EstimateModal: React.FC<EstimateModalProps> = ({ onClose }) => {
  const [originZip, setOriginZip] = useState('');
  const [destinationZip, setDestinationZip] = useState('');
  const [weight, setWeight] = useState('');
  const [serviceType, setServiceType] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originZip || !destinationZip || !weight) {
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
      const response = await fetch('http://localhost:5000/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_zip: originZip,
          destination_zip: destinationZip,
          weight: weightNum,
          service_type: serviceType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get estimate');
      }

      setEstimate(data);
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
        
        {!estimate ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Shipping Cost Estimate</h2>
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
                <label htmlFor="originZip" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Origin Zip Code</label>
                <input
                  type="text"
                  id="originZip"
                  value={originZip}
                  onChange={(e) => setOriginZip(e.target.value)}
                  placeholder="Enter origin zip code"
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
                <label htmlFor="destinationZip" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Destination Zip Code</label>
                <input
                  type="text"
                  id="destinationZip"
                  value={destinationZip}
                  onChange={(e) => setDestinationZip(e.target.value)}
                  placeholder="Enter destination zip code"
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
                <label htmlFor="weight" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Weight (lbs)</label>
                <input
                  type="number"
                  id="weight"
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
                <label htmlFor="serviceType" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Service Type</label>
                <select
                  id="serviceType"
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
                {loading ? 'Calculating...' : 'Get Estimate'}
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
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Shipping Estimate</h3>
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
                <span style={{ fontWeight: 600, color: '#374151' }}>Service Type:</span>
                <span>{estimate.service_type.charAt(0).toUpperCase() + estimate.service_type.slice(1)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(220, 38, 38, 0.1)' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Estimated Cost:</span>
                <span style={{ fontWeight: 800, color: '#059669', fontSize: '1.4rem' }}>${estimate.estimated_cost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(220, 38, 38, 0.1)' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Delivery Time:</span>
                <span>{estimate.estimated_days} day{estimate.estimated_days !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(220, 38, 38, 0.1)' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Origin:</span>
                <span>{estimate.origin_zip}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(220, 38, 38, 0.1)' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Destination:</span>
                <span>{estimate.destination_zip}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Weight:</span>
                <span>{estimate.weight} lbs</span>
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
                onClick={() => setEstimate(null)}
              >
                New Estimate
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

export default EstimateModal; 