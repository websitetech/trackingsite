import React, { useState } from 'react';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Shipping Cost Estimate</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {!estimate ? (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="originZip">Origin Zip Code</label>
              <input
                type="text"
                id="originZip"
                value={originZip}
                onChange={(e) => setOriginZip(e.target.value)}
                placeholder="Enter origin zip code"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="destinationZip">Destination Zip Code</label>
              <input
                type="text"
                id="destinationZip"
                value={destinationZip}
                onChange={(e) => setDestinationZip(e.target.value)}
                placeholder="Enter destination zip code"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="weight">Weight (lbs)</label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight in pounds"
                step="0.1"
                min="0.1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="serviceType">Service Type</label>
              <select
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              >
                <option value="standard">Standard (3-5 days)</option>
                <option value="express">Express (2-3 days)</option>
                <option value="overnight">Overnight (1 day)</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Calculating...' : 'Get Estimate'}
            </button>
          </form>
        ) : (
          <div className="estimate-result">
            <h3>Shipping Estimate</h3>
            <div className="estimate-card">
              <div className="estimate-row">
                <span>Service Type:</span>
                <span>{estimate.service_type.charAt(0).toUpperCase() + estimate.service_type.slice(1)}</span>
              </div>
              <div className="estimate-row">
                <span>Estimated Cost:</span>
                <span className="cost">${estimate.estimated_cost}</span>
              </div>
              <div className="estimate-row">
                <span>Delivery Time:</span>
                <span>{estimate.estimated_days} day{estimate.estimated_days !== 1 ? 's' : ''}</span>
              </div>
              <div className="estimate-row">
                <span>Origin:</span>
                <span>{estimate.origin_zip}</span>
              </div>
              <div className="estimate-row">
                <span>Destination:</span>
                <span>{estimate.destination_zip}</span>
              </div>
              <div className="estimate-row">
                <span>Weight:</span>
                <span>{estimate.weight} lbs</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEstimate(null)}>
                New Estimate
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

export default EstimateModal; 