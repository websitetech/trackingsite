import React, { useState } from 'react';

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
  const [originZip, setOriginZip] = useState('');
  const [destinationZip, setDestinationZip] = useState('');
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

    if (!originZip || !destinationZip || !weight || !recipientName || !recipientAddress) {
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
      const response = await fetch('http://localhost:5000/api/ship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin_zip: originZip,
          destination_zip: destinationZip,
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
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Create Shipment</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-content">
            <p>Please login to create a shipment.</p>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Shipment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {!success ? (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="shipOriginZip">Origin Zip Code</label>
              <input
                type="text"
                id="shipOriginZip"
                value={originZip}
                onChange={(e) => setOriginZip(e.target.value)}
                placeholder="Enter origin zip code"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="shipDestinationZip">Destination Zip Code</label>
              <input
                type="text"
                id="shipDestinationZip"
                value={destinationZip}
                onChange={(e) => setDestinationZip(e.target.value)}
                placeholder="Enter destination zip code"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="shipWeight">Weight (lbs)</label>
              <input
                type="number"
                id="shipWeight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight in pounds"
                step="0.1"
                min="0.1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="shipServiceType">Service Type</label>
              <select
                id="shipServiceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              >
                <option value="standard">Standard (3-5 days)</option>
                <option value="express">Express (2-3 days)</option>
                <option value="overnight">Overnight (1 day)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="recipientName">Recipient Name</label>
              <input
                type="text"
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="recipientAddress">Recipient Address</label>
              <textarea
                id="recipientAddress"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter recipient address"
                rows={3}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Shipment'}
            </button>
          </form>
        ) : (
          <div className="shipment-result">
            <h3>Shipment Created Successfully!</h3>
            <div className="success-card">
              <div className="success-row">
                <span>Tracking Number:</span>
                <span className="tracking-number">{success.tracking_number}</span>
              </div>
              <div className="success-row">
                <span>Package ID:</span>
                <span>{success.package_id}</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSuccess(null)}>
                Create Another
              </button>
              <button className="btn btn-primary" onClick={onClose}>
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