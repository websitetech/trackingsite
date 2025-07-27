import React, { useState } from 'react';

// Mock admin data
const mockUsers = [
  { id: 1, username: 'john_doe', email: 'john@example.com', status: 'active', role: 'user', createdAt: '2024-01-15' },
  { id: 2, username: 'jane_smith', email: 'jane@example.com', status: 'active', role: 'user', createdAt: '2024-02-20' },
  { id: 3, username: 'bob_wilson', email: 'bob@example.com', status: 'inactive', role: 'user', createdAt: '2024-03-10' },
  { id: 4, username: 'admin_user', email: 'admin@noblespeedytrac.com', status: 'active', role: 'admin', createdAt: '2024-01-01' },
];

const mockShipments = [
  { id: 1, trackingNumber: 'TRK123456789', status: 'In Transit', customer: 'john_doe', driver: 'Mike Johnson', origin: 'Toronto', destination: 'Mississauga', createdAt: '2024-06-01' },
  { id: 2, trackingNumber: 'TRK987654321', status: 'Delivered', customer: 'jane_smith', driver: 'Sarah Davis', origin: 'Toronto', destination: 'Scarborough', createdAt: '2024-06-02' },
  { id: 3, trackingNumber: 'TRK555666777', status: 'Pending', customer: 'bob_wilson', driver: null, origin: 'Toronto', destination: 'Brampton', createdAt: '2024-06-03' },
];

const mockDrivers = [
  { id: 1, name: 'Mike Johnson', status: 'available' },
  { id: 2, name: 'Sarah Davis', status: 'busy' },
  { id: 3, name: 'Tom Wilson', status: 'available' },
];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'shipments'>('users');
  const [users, setUsers] = useState(mockUsers);
  const [shipments, setShipments] = useState(mockShipments);
  const [editingUser, setEditingUser] = useState<typeof mockUsers[0] | null>(null);
  const [editingShipment, setEditingShipment] = useState<typeof mockShipments[0] | null>(null);

  const handleUserStatusToggle = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleUserEdit = (user: typeof mockUsers[0]) => {
    setEditingUser(user);
  };

  const handleUserSave = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setEditingUser(null);
    }
  };

  const handleShipmentStatusUpdate = (shipmentId: number, newStatus: string) => {
    setShipments(shipments.map(shipment => 
      shipment.id === shipmentId 
        ? { ...shipment, status: newStatus }
        : shipment
    ));
  };

  const handleDriverAssign = (shipmentId: number, driverName: string) => {
    setShipments(shipments.map(shipment => 
      shipment.id === shipmentId 
        ? { ...shipment, driver: driverName }
        : shipment
    ));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        <h1 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Admin Dashboard</h1>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              background: activeTab === 'users' ? '#b91c1c' : 'white',
              color: activeTab === 'users' ? 'white' : '#b91c1c',
              border: '2px solid #b91c1c',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('shipments')}
            style={{
              background: activeTab === 'shipments' ? '#b91c1c' : 'white',
              color: activeTab === 'shipments' ? 'white' : '#b91c1c',
              border: '2px solid #b91c1c',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Shipment Management
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem' }}>
            <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>User Management</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fef2f2' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Username</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Created</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem', color: '#374151' }}>{user.id}</td>
                      <td style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 500 }}>{user.username}</td>
                      <td style={{ padding: '1rem', color: '#374151' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: user.role === 'admin' ? '#dc2626' : '#6b7280', 
                          color: 'white', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.875rem' 
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: user.status === 'active' ? '#16a34a' : '#dc2626', 
                          color: 'white', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.875rem' 
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#374151' }}>{user.createdAt}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleUserEdit(user)}
                            style={{
                              background: '#b91c1c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleUserStatusToggle(user.id)}
                            style={{
                              background: user.status === 'active' ? '#dc2626' : '#16a34a',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                            }}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Shipment Management Tab */}
        {activeTab === 'shipments' && (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem' }}>
            <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>Shipment Management</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fef2f2' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Tracking #</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Driver</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Route</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Created</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(shipment => (
                    <tr key={shipment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem', color: '#374151' }}>{shipment.id}</td>
                      <td style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 500 }}>{shipment.trackingNumber}</td>
                      <td style={{ padding: '1rem', color: '#374151' }}>{shipment.customer}</td>
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={shipment.status}
                          onChange={(e) => handleShipmentStatusUpdate(shipment.id, e.target.value)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            background: 'white',
                            color: '#374151',
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={shipment.driver || ''}
                          onChange={(e) => handleDriverAssign(shipment.id, e.target.value)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            background: 'white',
                            color: '#374151',
                          }}
                        >
                          <option value="">No Driver</option>
                          {mockDrivers.map(driver => (
                            <option key={driver.id} value={driver.name}>
                              {driver.name} ({driver.status})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '1rem', color: '#374151' }}>
                        {shipment.origin} → {shipment.destination}
                      </td>
                      <td style={{ padding: '1rem', color: '#374151' }}>{shipment.createdAt}</td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => setEditingShipment(shipment)}
                          style={{
                            background: '#b91c1c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}>
            <div style={{
              background: 'white',
              borderRadius: 20,
              padding: '2rem',
              maxWidth: 500,
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}>
              <h3 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>Edit User</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 600 }}>Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      background: 'white',
                      color: '#374151',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 600 }}>Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      background: 'white',
                      color: '#374151',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 600 }}>Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      background: 'white',
                      color: '#374151',
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    onClick={handleUserSave}
                    style={{
                      background: '#b91c1c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    style={{
                      background: 'white',
                      color: '#b91c1c',
                      border: '1px solid #b91c1c',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 