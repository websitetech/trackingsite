import React, { useState } from 'react';

interface TrackingFormProps {
  onTrackingResult: (result: any) => void;
}

const TrackingForm: React.FC<TrackingFormProps> = ({ onTrackingResult }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber || !zipCode) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          zip_code: zipCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to track package');
      }

      onTrackingResult(data);
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
          <label htmlFor="zipCode">Zip Code</label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter zip code"
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