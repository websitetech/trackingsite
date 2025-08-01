import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackingAPI } from '../services/api';

const TrackingForm: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await trackingAPI.trackPackage({
        tracking_number: trackingNumber,
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

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary track-btn"
          disabled={loading}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%' }}></div>
              Tracking...
            </div>
          ) : (
            'Track Package'
          )}
        </button>
      </form>
    </div>
  );
};

export default TrackingForm; 