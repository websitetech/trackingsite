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
  const [selectedTrackingNumber, setSelectedTrackingNumber] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PackageData | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<PackageData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'in_transit':
      case 'out_for_delivery':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'returned':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

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

  const handleTrackPackage = (trackingNumber: string) => {
    setSelectedTrackingNumber(trackingNumber);
  };

  const handleCloseTracking = () => {
    setSelectedTrackingNumber(null);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
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
    } else if (selectedAction === 'details') {
      return (
        <div style={{ minHeight: '400px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Order Details
            </h3>
            
            {/* Order Information Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Customer Information
                </h4>
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                    <span style={{ fontWeight: '500' }}>Customer:</span> {selectedOrderForAction.shipments?.customer || 'Unknown Customer'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                    <span style={{ fontWeight: '500' }}>Recipient:</span> {selectedOrderForAction.recipient_name || 'Unknown Recipient'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
                    <span style={{ fontWeight: '500' }}>Address:</span> {selectedOrderForAction.recipient_address || 'No address'}
                  </p>
                </div>
              </div>

              <div>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Service Details
                </h4>
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                    <span style={{ fontWeight: '500' }}>Service Type:</span> {selectedOrderForAction.shipments?.service_type_label || selectedOrderForAction.service_type || 'N/A'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                    <span style={{ fontWeight: '500' }}>Weight:</span> {(selectedOrderForAction.weight || 0).toFixed(2)} kg
                  </p>
                  <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                    <span style={{ fontWeight: '500' }}>Price:</span> <span style={{ fontWeight: '600', color: '#059669' }}>C${(selectedOrderForAction.price || 0).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Shipment Information */}
            <div>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Shipment Information
              </h4>
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                  <span style={{ fontWeight: '500' }}>Shipment Number:</span> {selectedOrderForAction.shipments?.shipment_number || 'N/A'}
                </p>
                <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                  <span style={{ fontWeight: '500' }}>Payment Status:</span> {selectedOrderForAction.shipments?.payment_status || 'N/A'}
                </p>
                {(selectedOrderForAction.current_location || selectedOrderForAction.shipments?.current_location) && (
                  <p style={{ fontSize: '14px', color: '#1f2937', margin: '4px 0' }}>
                    <span style={{ fontWeight: '500' }}>Current Location:</span> {selectedOrderForAction.current_location || selectedOrderForAction.shipments?.current_location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tracking History */}
          {selectedOrderForAction.package_tracking_history && selectedOrderForAction.package_tracking_history.length > 0 && (
            <div>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '12px'
              }}>
                Tracking History
              </h4>
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedOrderForAction.package_tracking_history.slice(0, 5).map((entry) => (
                    <div key={entry.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      borderBottom: '1px solid #f3f4f6',
                      paddingBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#9ca3af' }}>•</span>
                        <span style={{ fontWeight: '500' }}>{(entry.status || '').replace('_', ' ').toUpperCase()}</span>
                        {entry.location && (
                          <span style={{ color: '#6b7280' }}>📍 {entry.location}</span>
                        )}
                      </div>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <span className="ml-3 text-lg">Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="text-red-600 text-2xl">❌</div>
              <div className="ml-3">
                <h3 className="text-red-800 font-medium text-lg">Error Loading Orders</h3>
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', padding: '2rem', paddingTop: '8rem' }}>
      <div className="max-w-full mx-auto py-8 px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6" style={{ marginTop: '20px', marginBottom: '30px' }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Order History</h1>
              <p className="text-gray-600">
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={() => navigate('/user')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              style={{ marginTop: '10px', marginBottom: '10px' }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center" style={{ marginTop: '20px', marginBottom: '30px' }}>
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {orders.length === 0 ? 'No Orders Yet' : 'No Orders Match Your Search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? 'Start by creating your first shipment!' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {orders.length === 0 && (
              <button
                onClick={() => navigate('/user')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Create Your First Shipment
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ marginTop: '20px', marginBottom: '30px' }}>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  📋 Orders ({orders.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Showing {orders.length} of {orders.length} orders
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Tracking Number
                    </th>
                    <th 
                      className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40"
                      style={{ display: isMobile ? 'none' : 'table-cell' }}
                    >
                      Customer
                    </th>
                    <th 
                      className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48"
                      style={{ display: isMobile ? 'none' : 'table-cell' }}
                    >
                      Service
                    </th>
                    <th 
                      className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ 
                        display: isMobile ? 'none' : 'table-cell',
                        width: '200px' 
                      }}
                    >
                      Price
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '250px' }}>
                      Status
                    </th>
                    <th 
                      className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ 
                        display: isMobile ? 'none' : 'table-cell',
                        width: '200px' 
                      }}
                    >
                      Date
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Actions
                    </th>
            </tr>
          </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      {/* Tracking Number */}
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {order.tracking_number || 'N/A'}
                        </div>
                        {/* Mobile-only additional info */}
                        <div 
                          className="text-xs text-gray-500 mt-1"
                          style={{ display: isMobile ? 'block' : 'none' }}
                        >
                          <div>{order.shipments?.customer || 'Unknown Customer'}</div>
                          <div>C${(order.price || 0).toFixed(2)}</div>
                          <div>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </td>

                      {/* Customer - Hidden on mobile */}
                      <td 
                        className="px-8 py-6"
                        style={{ display: isMobile ? 'none' : 'table-cell' }}
                      >
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {order.shipments?.customer || 'Unknown Customer'}
                          </div>
                        </div>
                      </td>

                      {/* Service - Hidden on mobile */}
                      <td 
                        className="px-8 py-6 whitespace-nowrap"
                        style={{ display: isMobile ? 'none' : 'table-cell' }}
                      >
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {order.shipments?.service_type_label || order.service_type || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Price - Hidden on mobile */}
                      <td 
                        className="px-8 py-6 whitespace-nowrap"
                        style={{ display: isMobile ? 'none' : 'table-cell' }}
                      >
                        <div className="text-sm font-semibold text-green-600">
                          C${(order.price || 0).toFixed(2)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                        </div>
                      </td>

                      {/* Date - Hidden on mobile */}
                      <td 
                        className="px-8 py-6 whitespace-nowrap text-sm text-gray-500"
                        style={{ display: isMobile ? 'none' : 'table-cell' }}
                      >
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </td>

                      {/* Actions */}
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleActionClick('track', order)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                            style={{ margin: '4px 0' }}
                          >
                            Track
                          </button>
                  <button
                            onClick={() => handleActionClick('details', order)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            style={{ margin: '4px 0' }}
                  >
                            Details
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
      </div>

      {/* Tracking Modal */}
      {selectedTrackingNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  📦 Tracking Details
                </h2>
                <button
                  onClick={handleCloseTracking}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <TrackingDisplay trackingNumber={selectedTrackingNumber} />
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  📋 Order Details
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Header */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon(selectedOrder.status)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedOrder.tracking_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Created on {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Order Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Customer:</span> {selectedOrder.shipments?.customer || 'Unknown Customer'}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Recipient:</span> {selectedOrder.recipient_name || 'Unknown Recipient'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Address:</span> {selectedOrder.recipient_address || 'No address'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Service Details</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Service Type:</span> {selectedOrder.shipments?.service_type_label || selectedOrder.service_type || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Weight:</span> {(selectedOrder.weight || 0).toFixed(2)} kg
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Price:</span> <span className="font-semibold text-green-600">C${(selectedOrder.price || 0).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipment Information</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Shipment Number:</span> {selectedOrder.shipments?.shipment_number || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Payment Status:</span> {selectedOrder.shipments?.payment_status || 'N/A'}
                        </p>
                        {(selectedOrder.current_location || selectedOrder.shipments?.current_location) && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Current Location:</span> {selectedOrder.current_location || selectedOrder.shipments?.current_location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              handleCloseDetails();
                              handleTrackPackage(selectedOrder.tracking_number);
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            📊 Track Package
                          </button>
                          <button
                            onClick={handleCloseDetails}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking History */}
                {selectedOrder.package_tracking_history && selectedOrder.package_tracking_history.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Tracking History</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="space-y-3">
                        {selectedOrder.package_tracking_history.slice(0, 5).map((entry) => (
                          <div key={entry.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-b-0">
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-400">•</span>
                              <span className="font-medium">{(entry.status || '').replace('_', ' ').toUpperCase()}</span>
                              {entry.location && (
                                <span className="text-gray-600">📍 {entry.location}</span>
                              )}
                            </div>
                            <span className="text-gray-400 text-xs">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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