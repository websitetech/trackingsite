import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackingDisplay from './TrackingDisplay';

const TrackingPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const [searchTrackingNumber, setSearchTrackingNumber] = useState(trackingNumber || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTrackingNumber.trim()) {
      navigate(`/track/${searchTrackingNumber.trim()}`);
    }
  };

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Package Tracking</h1>
              <p className="text-gray-600">Track your shipments and view real-time updates</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter tracking number..."
              value={searchTrackingNumber}
              onChange={(e) => setSearchTrackingNumber(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Track Package
            </button>
          </form>
        </div>

        {/* Tracking Display */}
        {trackingNumber && (
          <TrackingDisplay trackingNumber={trackingNumber} />
        )}

        {/* Help Section */}
        {!trackingNumber && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Need Help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">📋 How to Track</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Enter your tracking number in the search box above</li>
                  <li>• Click "Track Package" to view details</li>
                  <li>• View real-time status updates and location</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🔍 Finding Your Tracking Number</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Check your order confirmation email</li>
                  <li>• Look for the tracking number on your receipt</li>
                  <li>• Contact customer service if you need help</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage; 