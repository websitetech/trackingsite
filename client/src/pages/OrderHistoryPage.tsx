import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// User-specific mock data
const userOrdersData = {
  'john_doe': [
    {
      id: '1',
      trackingNumber: 'TRK123456789',
      status: 'Delivered',
      date: '2024-06-01',
      recipient: 'John Doe',
      address: '123 Main St, Toronto, ON',
      serviceType: 'Express',
      price: 49.99,
      history: [
        { date: '2024-05-30', status: 'Shipped', location: 'Toronto Hub' },
        { date: '2024-05-31', status: 'In Transit', location: 'Mississauga' },
        { date: '2024-06-01', status: 'Delivered', location: 'Toronto' },
      ],
    },
    {
      id: '2',
      trackingNumber: 'TRK987654321',
      status: 'In Transit',
      date: '2024-06-03',
      recipient: 'John Doe',
      address: '456 King St, Toronto, ON',
      serviceType: 'Standard',
      price: 29.99,
      history: [
        { date: '2024-06-02', status: 'Shipped', location: 'Toronto Hub' },
        { date: '2024-06-03', status: 'In Transit', location: 'Scarborough' },
      ],
    },
  ],
  'jane_smith': [
    {
      id: '3',
      trackingNumber: 'TRK555666777',
      status: 'Delivered',
      date: '2024-05-28',
      recipient: 'Jane Smith',
      address: '789 Queen St, Toronto, ON',
      serviceType: 'Premium',
      price: 79.99,
      history: [
        { date: '2024-05-25', status: 'Shipped', location: 'Toronto Hub' },
        { date: '2024-05-26', status: 'In Transit', location: 'Vancouver' },
        { date: '2024-05-28', status: 'Delivered', location: 'Toronto' },
      ],
    },
  ],
  'admin': [
    {
      id: '4',
      trackingNumber: 'TRK111222333',
      status: 'Pending',
      date: '2024-06-05',
      recipient: 'Admin User',
      address: '321 Admin Ave, Toronto, ON',
      serviceType: 'Express',
      price: 59.99,
      history: [
        { date: '2024-06-05', status: 'Order Created', location: 'Toronto Hub' },
      ],
    },
  ],
};

// Default empty orders for new users
const defaultOrders: typeof userOrdersData['john_doe'] = [];

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

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ user }) => {
  // Get user-specific orders or default to empty array
  const baseUserOrders = user ? (userOrdersData[user.username as keyof typeof userOrdersData] || defaultOrders) : defaultOrders;
  
  // Get newly created shipments from localStorage
  const getNewShipments = () => {
    if (!user) return [];
    const newShipments = localStorage.getItem(`newShipments_${user.username}`);
    return newShipments ? JSON.parse(newShipments) : [];
  };

  const [userOrders, setUserOrders] = useState([...baseUserOrders, ...getNewShipments()]);
  const [selectedOrder, setSelectedOrder] = useState<typeof userOrders[0] | null>(null);
  const navigate = useNavigate();

  // Update orders when user changes or component mounts
  useEffect(() => {
    const baseOrders = user ? (userOrdersData[user.username as keyof typeof userOrdersData] || defaultOrders) : defaultOrders;
    const newShipments = getNewShipments();
    console.log('User:', user?.username);
    console.log('Base orders:', baseOrders.length);
    console.log('New shipments:', newShipments.length);
    console.log('Total orders:', baseOrders.length + newShipments.length);
    setUserOrders([...baseOrders, ...newShipments]);
  }, [user]);

  // Add a refresh function that can be called manually
  const refreshOrders = () => {
    const baseOrders = user ? (userOrdersData[user.username as keyof typeof userOrdersData] || defaultOrders) : defaultOrders;
    const newShipments = getNewShipments();
    setUserOrders([...baseOrders, ...newShipments]);
  };

  return (
    <div style={{ minHeight: '80vh', background: '#f3f4f6', padding: '2rem 0' }}>
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
            {userOrders.map((order: any) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.75rem', color: '#1a1a1a' }}>{order.trackingNumber}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ color: order.status === 'Delivered' ? '#16a34a' : '#b91c1c', fontWeight: 600 }}>{order.status}</span>
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
        {userOrders.length === 0 && <div style={{ color: '#b91c1c', textAlign: 'center' }}>No orders found.</div>}
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