import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

interface OrderHistoryPageProps {
  user: User | null;
  showToast?: (msg: string) => void;
}

interface Shipment {
  id: number;
  shipment_number: string;
  status: string;
  created_at: string;
  recipient_name: string;
  recipient_address: string;
  service_type: string;
  service_type_label?: string;
  price: number;
  tracking_number?: string;
}

interface Order {
  id: string;
  trackingNumber: string;
  status: string;
  date: string;
  recipient: string;
  address: string;
  serviceType: string;
  price: number;
  history: Array<{
    date: string;
    status: string;
    location: string;
  }>;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ user }) => {
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Transform shipment data from API to UI format
  const transformShipmentToOrder = (shipment: Shipment): Order => {
    return {
      id: shipment.id.toString(),
      trackingNumber: shipment.tracking_number || shipment.shipment_number,
      status: shipment.status === 'pending' ? 'Processing' : 
              shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1),
      date: new Date(shipment.created_at).toLocaleDateString(),
      recipient: shipment.recipient_name,
      address: shipment.recipient_address,
      serviceType: shipment.service_type_label || shipment.service_type,
      price: shipment.price,
      history: [
        {
          date: new Date(shipment.created_at).toLocaleDateString(),
          status: 'Order Created',
          location: 'Toronto Hub'
        }
      ]
    };
  };

  // Fetch shipments from API
  const fetchShipments = async () => {
    if (!user) {
      setUserOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching shipments for user:', user.username);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to view your order history');
      }
      
      const shipments = await shipmentAPI.getShipments();
      console.log('Shipments received:', shipments);
      
      const transformedOrders = shipments.map(transformShipmentToOrder);
      setUserOrders(transformedOrders);
      
    } catch (err) {
      console.error('Error fetching shipments:', err);
      if (err instanceof Error) {
        if (err.message.includes('Authentication required') || err.message.includes('log in')) {
          setError('Please log in to view your order history.');
        } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
          setError('Unable to connect to server. Please make sure the server is running and try again.');
        } else if (err.message.includes('500') || err.message.includes('Server error')) {
          setError('Server error occurred. Please try again later or contact support.');
        } else {
          setError(`${err.message}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setUserOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load shipments when component mounts or user changes
  useEffect(() => {
    fetchShipments();
  }, [user]);

  // Refresh function
  const refreshOrders = () => {
    fetchShipments();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', background: '#f3f4f6', padding: '6rem 2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '1.1rem' }}>Loading order history...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', background: '#f3f4f6', padding: '6rem 2rem 2rem', paddingTop: '6rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: '2px solid #dc2626',
                color: '#dc2626',
                borderRadius: 8,
                padding: '0.25rem 0.75rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.color = '#b91c1c';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#dc2626';
              }}
            >
              ← Back
            </button>
            <h2 style={{ color: '#b91c1c', fontWeight: 700, margin: 0 }}>Order History</h2>
          </div>
          <button
            onClick={refreshOrders}
            style={{
              background: '#b91c1c',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem 1rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#dc2626';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#b91c1c';
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div style={{ 
            color: '#dc2626', 
            background: '#fef2f2', 
            padding: '1rem', 
            borderRadius: 8, 
            marginBottom: '1rem',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Unable to load order history</div>
            <div style={{ fontSize: '0.9rem' }}>{error}</div>
            <button
              onClick={refreshOrders}
              style={{
                marginTop: '0.5rem',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#fef2f2' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#b91c1c' }}>Tracking #</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#b91c1c' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#b91c1c' }}>Date</th>
              <th style={{ padding: '0.75rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {userOrders.map((order: Order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.75rem', color: '#1a1a1a' }}>{order.trackingNumber}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ 
                    color: order.status === 'Delivered' ? '#16a34a' : 
                           order.status === 'Processing' ? '#f59e0b' : '#b91c1c', 
                    fontWeight: 600 
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', color: '#374151' }}>{order.date}</td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    style={{ background: '#b91c1c', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {userOrders.length === 0 && !loading && (
          <div style={{ color: '#b91c1c', textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No orders found.</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Create a shipment to see it appear in your order history.
            </p>
          </div>
        )}
      </div>
      
      {/* Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', position: 'relative' }}>
            <button
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, color: '#b91c1c', cursor: 'pointer' }}
              aria-label="Close"
            >×</button>
            <h3 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: 12 }}>Shipment Details</h3>
            <div style={{ marginBottom: 8 }}><strong>Tracking #:</strong> {selectedOrder.trackingNumber}</div>
            <div style={{ marginBottom: 8 }}><strong>Status:</strong> <span style={{ color: selectedOrder.status === 'Delivered' ? '#16a34a' : '#b91c1c' }}>{selectedOrder.status}</span></div>
            <div style={{ marginBottom: 8 }}><strong>Date:</strong> {selectedOrder.date}</div>
            <div style={{ marginBottom: 8 }}><strong>Recipient:</strong> {selectedOrder.recipient}</div>
            <div style={{ marginBottom: 8 }}><strong>Address:</strong> {selectedOrder.address}</div>
            <div style={{ marginBottom: 8 }}><strong>Service Type:</strong> {selectedOrder.serviceType}</div>
            <div style={{ marginBottom: 8 }}><strong>Price:</strong> ${selectedOrder.price.toFixed(2)}</div>
            <div style={{ marginTop: 16 }}>
              <strong>History:</strong>
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {selectedOrder.history.map((h: any, i: number) => (
                  <li key={i} style={{ color: '#374151', marginBottom: 2 }}>
                    <span>{h.date} - {h.status} at {h.location}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage; 