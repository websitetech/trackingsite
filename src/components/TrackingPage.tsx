import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface TrackingData {
  tracking_number: string;
  status: string;
  location: string;
  estimated_delivery: string;
  history?: Array<{ date: string; status: string; location: string }>;
}

const TrackingPage = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Optionally, allow entering zip code for security
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: trackingNumber, zip_code: zipCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to track package');
      setTrackingData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracking-result" style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 0' }}>
      <h3>Tracking Information</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div className="form-group">
          <label htmlFor="zipCode">Enter Zip Code for Tracking</label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={e => setZipCode(e.target.value)}
            placeholder="Enter zip code"
            required
            className="input"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginLeft: 0 }} disabled={loading}>
          {loading ? 'Loading...' : 'Track'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {trackingData && (
        <div className="result-card">
          <p><strong>Tracking Number:</strong> {trackingData.tracking_number}</p>
          <p><strong>Status:</strong> {trackingData.status}</p>
          <p><strong>Location:</strong> {trackingData.location}</p>
          <p><strong>Estimated Delivery:</strong> {new Date(trackingData.estimated_delivery).toLocaleDateString()}</p>
          {trackingData.history && (
            <div style={{ marginTop: 16 }}>
              <strong>Delivery Stages:</strong>
              <ul style={{ marginTop: 8 }}>
                {trackingData.history.map((h, i) => (
                  <li key={i}>
                    <span>{new Date(h.date).toLocaleString()} - </span>
                    <span>{h.status} at {h.location}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackingPage; 