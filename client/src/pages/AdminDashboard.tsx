import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import SkeletonLoader, { TableSkeleton } from '../components/SkeletonLoader';
import ErrorBoundary from '../components/ErrorBoundary';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

interface Shipment {
  id: number;
  shipment_number: string;
  status: string;
  customer: string;
  driver?: string;
  origin_postal?: string;
  destination_postal?: string;
  created_at: string;
  users: {
    username: string;
    email: string;
  };
}

interface Package {
  id: number;
  tracking_number: string;
  status: string;
  current_location?: string;
  created_at: string;
  shipments: {
    shipment_number: string;
    customer: string;
  };
  users: {
    username: string;
    email: string;
  };
}

interface AdminStats {
  counts: {
    users: number;
    shipments: number;
    packages: number;
    payments: number;
  };
  recentActivity: {
    shipments: Shipment[];
    packages: Package[];
  };
}

const AdminDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') as 'overview' | 'users' | 'shipments' | 'packages' | 'tracking' || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'shipments' | 'packages' | 'tracking'>(defaultTab);
  const [users, setUsers] = useState<User[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Load data based on active tab
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when changing tabs
    loadData();
  }, [activeTab]);

  // Load data when page changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      loadData();
    }
  }, [currentPage, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 'overview':
          const statsData = await api.admin.getStats();
          setStats(statsData);
          break;
        case 'users':
          const usersData = await api.admin.getAllUsers();
          setUsers(usersData);
          setTotalItems(usersData.length);
          break;
        case 'shipments':
          const shipmentsData = await api.admin.getAllShipments();
          setShipments(shipmentsData);
          setTotalItems(shipmentsData.length);
          break;
        case 'packages':
          const packagesData = await api.admin.getAllPackages();
          setPackages(packagesData);
          setTotalItems(packagesData.length);
          break;
        case 'tracking':
          // For tracking tab, we'll load packages data as well
          const trackingData = await api.admin.getAllPackages();
          setPackages(trackingData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.email_verified ? 'inactive' : 'active';
      await api.admin.updateUser(userId, { status: newStatus });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, email_verified: !u.email_verified }
          : u
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const handleUserEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleUserSave = async () => {
    if (!editingUser) return;
    
    try {
      await api.admin.updateUser(editingUser.id, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role
      });
      
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleShipmentStatusUpdate = async (shipmentId: number, newStatus: string) => {
    try {
      await api.admin.updateShipment(shipmentId, { status: newStatus });
      setShipments(shipments.map(shipment => 
        shipment.id === shipmentId 
          ? { ...shipment, status: newStatus }
          : shipment
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shipment status');
    }
  };

  const handlePackageStatusUpdate = async (packageId: number, newStatus: string) => {
    try {
      await api.admin.updatePackage(packageId, { status: newStatus });
      setPackages(packages.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, status: newStatus }
          : pkg
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update package status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination helpers
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    switch (activeTab) {
      case 'users':
        return users.slice(startIndex, endIndex);
      case 'shipments':
        return shipments.slice(startIndex, endIndex);
      case 'packages':
        return packages.slice(startIndex, endIndex);
      default:
        return [];
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        ← Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Next →
      </button>
    );

    return (
      <div className="pagination">
        <div className="pagination-info">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
        <div className="pagination-controls">
          {pages}
        </div>
      </div>
    );
  };

  if (loading && !stats && !users.length && !shipments.length && !packages.length) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <SkeletonLoader type="text" width="300px" height="2rem" className="mx-auto mb-8" />
          <TableSkeleton rows={8} columns={4} />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem 0' }} className="admin-dashboard">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{ color: '#d97706', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Admin Dashboard</h1>
        
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #fecaca', 
            color: '#dc2626', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            {error}
            <button 
              onClick={() => setError(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#dc2626', 
                marginLeft: '1rem', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              background: activeTab === 'overview' ? '#b91c1c' : 'white',
              color: activeTab === 'overview' ? 'white' : '#b91c1c',
              border: '2px solid #b91c1c',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Overview
          </button>
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
          <button
            onClick={() => setActiveTab('packages')}
            style={{
              background: activeTab === 'packages' ? '#b91c1c' : 'white',
              color: activeTab === 'packages' ? 'white' : '#b91c1c',
              border: '2px solid #b91c1c',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Package Management
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            style={{
              background: activeTab === 'tracking' ? '#b91c1c' : 'white',
              color: activeTab === 'tracking' ? 'white' : '#b91c1c',
              border: '2px solid #b91c1c',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Tracking Management
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem' }}>
            <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b91c1c' }}>{stats.counts.users}</div>
                <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Total Users</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b91c1c' }}>{stats.counts.shipments}</div>
                <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Total Shipments</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b91c1c' }}>{stats.counts.packages}</div>
                <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Total Packages</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b91c1c' }}>{stats.counts.payments}</div>
                <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Total Payments</div>
              </div>
            </div>

            {/* Status Distribution */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#b91c1c', fontWeight: 600, marginBottom: '1rem' }}>System Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0369a1' }}>🟢</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>System Online</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>📦</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active Packages</div>
                </div>
                <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>🚚</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Transit</div>
                </div>
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>⏳</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ color: '#b91c1c', fontWeight: 600, marginBottom: '1rem' }}>Recent Shipments</h3>
                <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {stats.recentActivity.shipments.length > 0 ? (
                    stats.recentActivity.shipments.map(shipment => (
                      <div key={shipment.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: 500 }}>{shipment.shipment_number}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {shipment.customer} • {shipment.status} • {formatDate(shipment.created_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No recent shipments</div>
                  )}
                </div>
              </div>
              <div>
                <h3 style={{ color: '#b91c1c', fontWeight: 600, marginBottom: '1rem' }}>Recent Packages</h3>
                <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {stats.recentActivity.packages.length > 0 ? (
                    stats.recentActivity.packages.map(pkg => (
                      <div key={pkg.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: 500 }}>{pkg.tracking_number}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {pkg.status} • {formatDate(pkg.created_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No recent packages</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem' }}>
            <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>User Management</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading users...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fef2f2' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Username</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Role</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, minWidth: '180px' }}>Status</th>
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
                            background: user.email_verified ? '#16a34a' : '#dc2626', 
                            color: 'white', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '0.5rem', 
                            fontSize: '0.875rem' 
                          }}>
                            {user.email_verified ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{formatDate(user.created_at)}</td>
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
                                background: user.email_verified ? '#dc2626' : '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                              }}
                            >
                              {user.email_verified ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Shipment Management Tab */}
        {activeTab === 'shipments' && (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem' }}>
            <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>Shipment Management</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading shipments...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fef2f2' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Shipment #</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Customer</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>User</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, minWidth: '180px' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Route</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Created</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map(shipment => (
                      <tr key={shipment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem', color: '#374151' }}>{shipment.id}</td>
                        <td style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 500 }}>{shipment.shipment_number}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{shipment.customer}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{shipment.users.username}</td>
                        <td style={{ padding: '1rem', minWidth: '180px' }}>
                          <select
                            value={shipment.status}
                            onChange={(e) => handleShipmentStatusUpdate(shipment.id, e.target.value)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem',
                              background: 'white',
                              color: '#374151',
                              fontSize: '0.875rem',
                              minWidth: '160px',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_transit">In Transit</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem', color: '#374151' }}>
                          {shipment.origin_postal} → {shipment.destination_postal}
                        </td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{formatDate(shipment.created_at)}</td>
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
            )}
          </div>
        )}

        {/* Package Management Tab */}
        {activeTab === 'packages' && (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem' }}>
            <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>Package Management</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading packages...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fef2f2' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Tracking #</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Customer</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>User</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, minWidth: '180px' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Location</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Created</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(pkg => (
                      <tr key={pkg.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.id}</td>
                        <td style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 500 }}>{pkg.tracking_number}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.shipments.customer}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.users.username}</td>
                        <td style={{ padding: '1rem', minWidth: '180px' }}>
                          <select
                            value={pkg.status}
                            onChange={(e) => handlePackageStatusUpdate(pkg.id, e.target.value)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem',
                              background: 'white',
                              color: '#374151',
                              fontSize: '0.875rem',
                              minWidth: '160px',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_transit">In Transit</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.current_location || 'N/A'}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{formatDate(pkg.created_at)}</td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => setEditingPackage(pkg)}
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
            )}
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

        {/* Tracking Management Tab */}
        {activeTab === 'tracking' && (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem' }}>
            <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1.5rem' }}>Tracking Management</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading tracking data...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fef2f2' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Tracking #</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Customer</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>User</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, minWidth: '180px' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Current Location</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Created</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(pkg => (
                      <tr key={pkg.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 500 }}>{pkg.tracking_number}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.shipments.customer}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.users.username}</td>
                        <td style={{ padding: '1rem', minWidth: '180px' }}>
                          <span style={{ 
                            background: pkg.status === 'delivered' ? '#16a34a' : 
                                       pkg.status === 'in_transit' ? '#3b82f6' : 
                                       pkg.status === 'out_for_delivery' ? '#f59e0b' : '#dc2626', 
                            color: 'white', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.5rem', 
                            fontSize: '0.875rem',
                            display: 'inline-block',
                            minWidth: '140px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {pkg.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.current_location || 'N/A'}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{formatDate(pkg.created_at)}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setEditingPackage(pkg)}
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
                              Update Tracking
                            </button>
                            <button
                              onClick={() => window.open(`/track/${pkg.tracking_number}`, '_blank')}
                              style={{
                                background: '#3b82f6',
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard; 