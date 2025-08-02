import React, { useState, useEffect } from 'react';
import { trackingAPI } from '../services/api';

interface TrackingHistory {
  id: number;
  status: string;
  location?: string;
  description?: string;
  timestamp: string;
}

interface PackageData {
  id: number;
  tracking_number: string;
  status: string;
  current_location?: string;
  recipient_name: string;
  recipient_address: string;
  service_type: string;
  weight: number;
  created_at: string;
  shipments: {
    id: number;
    shipment_number: string;
    customer: string;
    service_type: string;
    service_type_label?: string;
    status: string;
    payment_status: string;
    created_at: string;
  };
}

interface TrackingDisplayProps {
  trackingNumber: string;
}

const TrackingDisplay: React.FC<TrackingDisplayProps> = ({ trackingNumber }) => {
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await trackingAPI.trackPackage(trackingNumber);
        setPackageData(response.package);
        setTrackingHistory(response.tracking_history || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tracking information');
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchTrackingData();
    }
  }, [trackingNumber]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 0'
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '32px',
          width: '32px',
          border: '2px solid transparent',
          borderBottom: '2px solid #dc2626'
        }}></div>
        <span style={{ marginLeft: '8px' }}>Loading tracking information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex' }}>
          <div style={{ marginLeft: '12px' }}>
            <h3 style={{ color: '#991b1b', fontWeight: '500' }}>Tracking Error</h3>
            <p style={{ color: '#b91c1c', fontSize: '14px' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex' }}>
          <div style={{ marginLeft: '12px' }}>
            <h3 style={{ color: '#92400e', fontWeight: '500' }}>Package Not Found</h3>
            <p style={{ color: '#b45309', fontSize: '14px' }}>No package found with tracking number: {trackingNumber}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '400px' }}>
      {/* Package Header Card */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              {packageData.tracking_number}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
              <span style={{ fontWeight: '500' }}>Recipient:</span> {packageData.recipient_name}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
              <span style={{ fontWeight: '500' }}>Service:</span> {packageData.shipments.service_type_label || packageData.service_type}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
              <span style={{ fontWeight: '500' }}>Weight:</span> {packageData.weight} kg
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: packageData.status === 'delivered' ? '#dcfce7' : 
                             packageData.status === 'in_transit' || packageData.status === 'out_for_delivery' ? '#dbeafe' :
                             packageData.status === 'pending' ? '#fef3c7' :
                             packageData.status === 'failed' || packageData.status === 'returned' ? '#fee2e2' : '#f3f4f6',
              color: packageData.status === 'delivered' ? '#166534' :
                     packageData.status === 'in_transit' || packageData.status === 'out_for_delivery' ? '#1e40af' :
                     packageData.status === 'pending' ? '#92400e' :
                     packageData.status === 'failed' || packageData.status === 'returned' ? '#991b1b' : '#374151'
            }}>
              {packageData.status.replace('_', ' ').toUpperCase()}
            </span>
            {packageData.current_location && (
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {packageData.current_location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Shipment Information Card */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '12px'
        }}>
          Shipment Details
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
              <span style={{ fontWeight: '500' }}>Shipment Number:</span> {packageData.shipments.shipment_number}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
              <span style={{ fontWeight: '500' }}>Customer:</span> {packageData.shipments.customer}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
              <span style={{ fontWeight: '500' }}>Payment Status:</span> {packageData.shipments.payment_status}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
              <span style={{ fontWeight: '500' }}>Created:</span> {new Date(packageData.created_at).toLocaleDateString()}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
              <span style={{ fontWeight: '500' }}>Address:</span> {packageData.recipient_address}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking History Card */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '16px'
        }}>
          Tracking History
        </h3>
        {(() => {
          if (trackingHistory.length === 0) {
            return (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: '#6b7280'
              }}>
                <p>No tracking history available yet.</p>
                <p style={{ fontSize: '14px' }}>Updates will appear here as your package moves.</p>
              </div>
            );
          } else {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {trackingHistory.map((entry, index) => {
                  // Determine status color based on status
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'delivered': return '#16a34a';
                      case 'in_transit': return '#3b82f6';
                      case 'out_for_delivery': return '#f59e0b';
                      case 'cancelled': return '#dc2626';
                      case 'pending': return '#6b7280';
                      default: return '#dc2626';
                    }
                  };
                  
                  return (
                    <div key={entry.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}>
                      <div style={{ flexShrink: 0 }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: getStatusColor(entry.status),
                          borderRadius: '50%'
                        }}></div>
                        {index < trackingHistory.length - 1 && (
                          <div style={{
                            width: '2px',
                            height: '32px',
                            backgroundColor: '#d1d5db',
                            margin: '4px auto 0'
                          }}></div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <div>
                            <p style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {entry.status.replace('_', ' ').toUpperCase()}
                            </p>
                            {entry.location && (
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>{entry.location}</p>
                            )}
                            {entry.description && (
                              <p style={{ 
                                fontSize: '14px', 
                                color: '#6b7280'
                              }}>{entry.description}</p>
                            )}
                          </div>
                          <p style={{
                            fontSize: '12px',
                            color: '#9ca3af'
                          }}>
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
};

export default TrackingDisplay; 