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

interface Package {
  id: number;
  tracking_number: string;
  status: string;
  current_location?: string;
  created_at: string;
  shipments: {
    id: number;
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
    packages: number;
    payments: number;
  };
  recentActivity: {
    packages: Package[];
  };
}

const AdminDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') as 'overview' | 'users' | 'tracking' || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tracking'>(defaultTab);
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingPackages, setUpdatingPackages] = useState<Set<number>>(new Set());
  const [pendingStatusChanges, setPendingStatusChanges] = useState<Map<number, string>>(new Map());
  const [pendingLocationChanges, setPendingLocationChanges] = useState<Map<number, string>>(new Map());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
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
        case 'tracking':
          // For tracking tab, we'll load packages data
          const trackingData = await api.admin.getAllPackages();
          setPackages(trackingData);
          setTotalItems(trackingData.length);
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

  const handlePackageStatusUpdate = async (packageId: number, newStatus: string, currentLocation?: string) => {
    try {
      // Set loading state
      setUpdatingPackages(prev => new Set(prev).add(packageId));

      // Prepare update data
      const updateData: any = { status: newStatus };
      if (currentLocation && currentLocation.trim() !== '') {
        updateData.current_location = currentLocation.trim();
      }

      // Update package status and location
      const result = await api.admin.updatePackage(packageId, updateData);
      
      // Update local package state
      setPackages(packages.map(pkg => 
        pkg.id === packageId 
          ? { 
              ...pkg, 
              status: newStatus,
              ...(currentLocation && currentLocation.trim() !== '' && { current_location: currentLocation.trim() })
            }
          : pkg
      ));
      
      // Clear pending status change
      setPendingStatusChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(packageId);
        return newMap;
      });
      
      // Clear pending location change
      setPendingLocationChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(packageId);
        return newMap;
      });
      
      // Show success message if notification was sent
      if (result.notification_sent) {
        setError(null); // Clear any existing errors
        setSuccess(`✅ Package status updated to "${newStatus}" and notification sent to user`);
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setSuccess(`✅ Package status updated to "${newStatus}"`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      // Refresh overview stats to reflect changes
      if (activeTab === 'overview') {
        const statsData = await api.admin.getStats();
        setStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update package status');
      setSuccess(null); // Clear success message on error
    } finally {
      // Clear loading state
      setUpdatingPackages(prev => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
    }
  };

  const handleStatusChange = (packageId: number, newStatus: string) => {
    // Store the pending status change without updating the database
    setPendingStatusChanges(prev => new Map(prev).set(packageId, newStatus));
  };

  const handleLocationChange = (packageId: number, newLocation: string) => {
    // Store the pending location change without updating the database
    setPendingLocationChanges(prev => new Map(prev).set(packageId, newLocation));
  };

  const handleUpdateTracking = async (packageId: number, currentLocation: string) => {
    try {
      // Get pending status and location changes
      const pendingStatus = pendingStatusChanges.get(packageId);
      const pendingLocation = pendingLocationChanges.get(packageId);
      const currentPackage = packages.find(p => p.id === packageId);
      
      if (!currentPackage) {
        setError('Package not found');
        return;
      }

      // Use pending location if available, otherwise use current location
      const locationToUpdate = pendingLocation || currentLocation;
      
      if (!locationToUpdate || locationToUpdate.trim() === '') {
        setError('Please enter a current location before updating tracking');
        return;
      }

      // Use the status from pending changes or current status
      const statusToUpdate = pendingStatus || currentPackage.status;

      // Call the combined update function
      await handlePackageStatusUpdate(packageId, statusToUpdate, locationToUpdate);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tracking location');
      setSuccess(null); // Clear success message on error
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

  // Pagination helper functions
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Handle clipboard error silently
    }
  };

  // Pagination component
  const Pagination = () => {
    const totalPages = getTotalPages();
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: 'white',
        borderRadius: '0.5rem',
        padding: '0.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '0.25rem 0.5rem',
            border: '1px solid #d1d5db',
            background: currentPage === 1 ? '#f3f4f6' : 'white',
            color: currentPage === 1 ? '#9ca3af' : '#374151',
            borderRadius: '0.25rem',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            minWidth: '24px'
          }}
        >
          ←
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={{
              padding: '0.25rem 0.5rem',
              border: '1px solid #d1d5db',
              background: currentPage === page ? '#b91c1c' : 'white',
              color: currentPage === page ? 'white' : '#374151',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: currentPage === page ? '600' : '400',
              minWidth: '24px'
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.25rem 0.5rem',
            border: '1px solid #d1d5db',
            background: currentPage === totalPages ? '#f3f4f6' : 'white',
            color: currentPage === totalPages ? '#9ca3af' : '#374151',
            borderRadius: '0.25rem',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            minWidth: '24px'
          }}
        >
          →
        </button>
      </div>
    );
  };

  if (loading && !stats && !users.length && !packages.length) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem 0', paddingTop: '8rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <SkeletonLoader type="text" width="300px" height="2rem" className="mx-auto mb-8" />
          <TableSkeleton rows={8} columns={4} />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem 0', paddingTop: '8rem' }} className="admin-dashboard">
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 2rem' }}>
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
        
        {success && (
          <div style={{ 
            background: '#d1fae5', 
            border: '1px solid #a7f3d0', 
            color: '#065f46', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            {success}
            <button 
              onClick={() => setSuccess(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#065f46', 
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
            Tracking Package
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
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#b91c1c', fontWeight: 700 }}>User Management</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} users
                </div>
                <Pagination />
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading users...</div>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '1200px' }}>
                  <thead>
                    <tr style={{ background: '#fef2f2' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '8%' }}>ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '15%' }}>Username</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '25%' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '10%' }}>Role</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '12%' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '15%' }}>Created</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '15%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData(users).map(user => (
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

        {/* Tracking Package Tab */}
        {activeTab === 'tracking' && (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#b91c1c', fontWeight: 700 }}>Tracking Package Management</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} packages
                </div>
                <Pagination />
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading tracking data...</div>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '1400px' }}>
                  <thead>
                    <tr style={{ background: '#fef2f2' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '15%' }}>Tracking #</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '12%' }}>Customer</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '12%' }}>User</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '18%' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '18%' }}>Current Location</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '15%' }}>Created</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#b91c1c', fontWeight: 600, width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData(packages).map(pkg => (
                      <tr key={pkg.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontFamily: 'monospace' }}>{pkg.tracking_number}</span>
                            <button
                              onClick={() => copyToClipboard(pkg.tracking_number)}
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
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.shipments.customer}</td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{pkg.users.username}</td>
                        <td style={{ padding: '1rem', minWidth: '180px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: (() => {
                                const statusToShow = pendingStatusChanges.get(pkg.id) || pkg.status;
                                return statusToShow === 'delivered' ? '#16a34a' :
                                       statusToShow === 'in_transit' ? '#3b82f6' :
                                       statusToShow === 'out_for_delivery' ? '#f59e0b' :
                                       statusToShow === 'cancelled' ? '#dc2626' : '#6b7280';
                              })()
                            }} />
                            <select
                              value={pendingStatusChanges.get(pkg.id) || pkg.status}
                              onChange={(e) => handleStatusChange(pkg.id, e.target.value)}
                              disabled={updatingPackages.has(pkg.id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                border: pendingStatusChanges.has(pkg.id) ? '2px solid #f59e0b' : '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                background: updatingPackages.has(pkg.id) ? '#f3f4f6' : 'white',
                                color: updatingPackages.has(pkg.id) ? '#9ca3af' : '#374151',
                                fontSize: '0.875rem',
                                minWidth: '160px',
                                cursor: updatingPackages.has(pkg.id) ? 'not-allowed' : 'pointer',
                                opacity: updatingPackages.has(pkg.id) ? 0.6 : 1,
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_transit">In Transit</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {pendingStatusChanges.has(pkg.id) && (
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: '#f59e0b', 
                                fontWeight: 'bold',
                                marginLeft: '0.5rem'
                              }}>
                                ⚠️ Pending
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#374151' }}>
                          <input
                            type="text"
                            value={pendingLocationChanges.get(pkg.id) !== undefined ? pendingLocationChanges.get(pkg.id) || '' : (pkg.current_location || '')}
                            onChange={(e) => handleLocationChange(pkg.id, e.target.value)}
                            disabled={updatingPackages.has(pkg.id)}
                            placeholder={pkg.current_location ? "Update location..." : "Enter current location"}
                            style={{
                              padding: '0.5rem',
                              border: (() => {
                                const locationToShow = pendingLocationChanges.get(pkg.id) !== undefined ? pendingLocationChanges.get(pkg.id) : pkg.current_location;
                                return locationToShow && locationToShow.trim() !== '' ? '2px solid #16a34a' : '1px solid #d1d5db';
                              })(),
                              borderRadius: '0.25rem',
                              background: updatingPackages.has(pkg.id) ? '#f3f4f6' : 'white',
                              color: updatingPackages.has(pkg.id) ? '#9ca3af' : '#374151',
                              fontSize: '0.875rem',
                              width: '100%',
                              maxWidth: '200px',
                              transition: 'border-color 0.2s ease',
                              cursor: updatingPackages.has(pkg.id) ? 'not-allowed' : 'text',
                              opacity: updatingPackages.has(pkg.id) ? 0.6 : 1,
                            }}
                          />
                          {(() => {
                            const locationToShow = pendingLocationChanges.get(pkg.id) !== undefined ? pendingLocationChanges.get(pkg.id) : pkg.current_location;
                            return locationToShow && locationToShow.trim() !== '' && (
                              <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                                ✓ Location set
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '1rem', color: '#374151' }}>{formatDate(pkg.created_at)}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                const locationToUse = pendingLocationChanges.get(pkg.id) !== undefined ? pendingLocationChanges.get(pkg.id) || '' : (pkg.current_location || '');
                                handleUpdateTracking(pkg.id, locationToUse);
                              }}
                              style={{
                                background: (() => {
                                  if (updatingPackages.has(pkg.id)) return '#6b7280';
                                  const locationToShow = pendingLocationChanges.get(pkg.id) !== undefined ? pendingLocationChanges.get(pkg.id) : pkg.current_location;
                                  const hasLocation = locationToShow && locationToShow.trim() !== '';
                                  if (!hasLocation) return '#dc2626';
                                  return pendingStatusChanges.has(pkg.id) ? '#f59e0b' : '#16a34a';
                                })(),
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                opacity: updatingPackages.has(pkg.id) ? 0.6 : 1,
                                pointerEvents: updatingPackages.has(pkg.id) ? 'none' : 'auto',
                              }}
                              disabled={(() => {
                                if (updatingPackages.has(pkg.id)) return true;
                                const locationToShow = pendingLocationChanges.get(pkg.id) !== undefined ? pendingLocationChanges.get(pkg.id) : pkg.current_location;
                                return !locationToShow || locationToShow.trim() === '';
                              })()}
                            >
                              {updatingPackages.has(pkg.id) ? 'Updating...' : 
                               pendingStatusChanges.has(pkg.id) ? 'Update Status & Tracking' : 'Update Tracking'}
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