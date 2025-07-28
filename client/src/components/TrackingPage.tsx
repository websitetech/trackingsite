import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackingAPI } from '../services/api';

interface TrackingData {
  tracking_number: string;
  status: string;
  location: string;
  estimated_delivery: string;
  history: Array<{
    date: string;
    status: string;
    location: string;
  }>;
}

const TrackingPage = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load tracking data automatically when component mounts
  useEffect(() => {
    const loadTrackingData = async () => {
      if (!trackingNumber) return;
      
      setLoading(true);
      setError('');
      try {
        const data = await trackingAPI.trackPackage({ 
          tracking_number: trackingNumber
        });
        setTrackingData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to track package');
        setTrackingData(null);
      } finally {
        setLoading(false);
      }
    };

    loadTrackingData();
  }, [trackingNumber]);

  if (loading) {
    return (
      <div className="tracking-result" style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 0', textAlign: 'center' }}>
        <h3>Loading tracking information...</h3>
      </div>
    );
  }

  return (
    <div className="tracking-result" style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 0' }}>
      <h3>Tracking Information</h3>
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