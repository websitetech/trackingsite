import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackingAPI } from '../services/api';
import TrackingDisplay from '../components/TrackingDisplay';
import CustomPopup from '../components/CustomPopup';

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
  price?: number;
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
    current_location?: string;
  };
  package_tracking_history: TrackingHistory[];
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<PackageData | null>(null);
  const navigate = useNavigate();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Handle clipboard error silently
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/login');
          return;
        }

        const response = await trackingAPI.getUserPackagesWithHistory();
        setOrders(response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Rest of the component methods...

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '✅';
      case 'in_transit':
        return '🚚';
      case 'out_for_delivery':
        return '📦';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'returned':
        return '↩️';
      default:
        return '📋';
    }
  };



  const handleActionClick = (action: string, order: PackageData) => {
    setSelectedAction(action);
    setSelectedOrderForAction(order);
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedAction('');
    setSelectedOrderForAction(null);
  };

  const renderModalContent = () => {
    if (!selectedOrderForAction) return null;

    if (selectedAction === 'track') {
      return (
        <div style={{ minHeight: '400px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Tracking Information
            </h3>
          </div>
          <TrackingDisplay trackingNumber={selectedOrderForAction.tracking_number} />
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
        <section className="hero-bg">
          <div className="hero-section">
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderRadius: '2rem',
              boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 8px 24px rgba(220,38,38,0.06), 0 0 0 1px rgba(220,38,38,0.08)',
              padding: '3rem',
              margin: '2rem auto',
              maxWidth: 600,
              width: '100%',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(220,38,38,0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'center'
            }}>
              <h1 style={{ color: '#111', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem' }}>
                📋 Order History
              </h1>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(220, 38, 38, 0.3)',
                  borderTop: '3px solid #dc2626',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ color: '#666', fontSize: '1.1rem' }}>Loading your orders...</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
        <section className="hero-bg">
          <div className="hero-section">
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderRadius: '2rem',
              boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 8px 24px rgba(220,38,38,0.06), 0 0 0 1px rgba(220,38,38,0.08)',
              padding: '3rem',
              margin: '2rem auto',
              maxWidth: 800,
              width: '100%',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(220,38,38,0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <h1 style={{ color: '#111', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                📋 Order History
              </h1>
              <div style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h3 style={{ color: '#dc2626', fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Error Loading Orders
                </h3>
                <p style={{ color: '#b91c1c', fontSize: '1rem', marginBottom: '1.5rem' }}>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
      <section className="hero-bg">
        <div className="hero-section">
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderRadius: '2rem',
            boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 8px 24px rgba(220,38,38,0.06), 0 0 0 1px rgba(220,38,38,0.08)',
            padding: '2.5rem',
            margin: '2rem auto',
            maxWidth: 1400,
            width: '100%',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(220,38,38,0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ 
                  color: '#111', 
                  fontWeight: 700, 
                  fontSize: '2.2rem', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📋 Order History
                </h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                  {orders.length} order{orders.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button
                onClick={() => navigate('/user')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                }}
              >
                ← Back to Dashboard
              </button>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
              <div style={{
                background: 'rgba(248, 250, 252, 0.8)',
                borderRadius: '1.5rem',
                padding: '3rem',
                textAlign: 'center',
                border: '1px solid rgba(220, 38, 38, 0.1)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                <h3 style={{ 
                  color: '#111', 
                  fontWeight: 600, 
                  fontSize: '1.4rem', 
                  marginBottom: '0.5rem' 
                }}>
                  No Orders Yet
                </h3>
                <p style={{ color: '#666', fontSize: '1rem', marginBottom: '2rem' }}>
                  Start by creating your first shipment!
                </p>
                <button
                  onClick={() => navigate('/user')}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '1rem 2rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }}
                >
                  Create Your First Shipment
                </button>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '1.5rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(220,38,38,0.06)',
                padding: '0',
                border: '1px solid rgba(220, 38, 38, 0.1)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(220, 38, 38, 0.1)' }}>
                  <h3 style={{ color: '#111', fontSize: '1.2rem', fontWeight: 600 }}>
                    📋 Orders ({orders.length})
                  </h3>
                </div>

                <div style={{ padding: '1rem' }}>
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: 'rgba(248, 250, 252, 0.5)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        border: '1px solid rgba(220, 38, 38, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ color: '#111', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getStatusIcon(order.status)} 
                            <span style={{ fontFamily: 'monospace' }}>{order.tracking_number}</span>
                            <button
                              onClick={() => copyToClipboard(order.tracking_number)}
                              style={{
                                background: '#1e40af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#1d4ed8';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = '#1e40af';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              title="Copy tracking number"
                            >
                              📋
                            </button>
                          </h4>
                          <p style={{ color: '#666', fontSize: '0.9rem' }}>
                            {order.recipient_name} • {order.shipments?.customer || 'Unknown Customer'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleActionClick('track', order)}
                            style={{
                              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              padding: '0.5rem 1rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Track
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedOrderForAction && (
        <CustomPopup
          isOpen={showActionModal}
          onClose={handleCloseActionModal}
          title={selectedAction === 'track' ? 'Track Package' : 'View Details'}
          width="800px"
          renderContent={renderModalContent}
        />
      )}
    </div>
  );
};

export default OrderHistoryPage;