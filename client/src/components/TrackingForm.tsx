import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackingAPI } from '../services/api';

const TrackingForm: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber || !postalCode) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await trackingAPI.trackPackage({
        tracking_number: trackingNumber,
        zip_code: postalCode,
      });

      navigate(`/track/${trackingNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracking-form-container">
      <form className="tracking-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="trackingNumber">Tracking Number</label>
          <input
            type="text"
            id="trackingNumber"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
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

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary track-btn"
          disabled={loading}
        >
          {loading ? 'Tracking...' : 'Track Package'}
        </button>
      </form>
    </div>
  );
};

export default TrackingForm; 