// API Service for handling all backend communication
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Helper function to make authenticated requests
const authenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  return handleResponse(response);
};

// Helper function to make public requests
const publicRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return handleResponse(response);
};

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    phone: string;
    stateProvince: string;
    postalCode: string;
  }) => {
    return publicRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials: { username: string; password: string }) => {
    // Mock login for testing user-specific data
    const mockUsers = {
      'john_doe': { id: 1, username: 'john_doe', email: 'john@example.com', role: 'user' },
      'jane_smith': { id: 2, username: 'jane_smith', email: 'jane@example.com', role: 'user' },
      'admin': { id: 3, username: 'admin', email: 'admin@example.com', role: 'admin' },
    };

    const user = mockUsers[credentials.username as keyof typeof mockUsers];
    
    if (user && credentials.password === 'password') {
      return {
        user,
        token: 'mock-token-' + user.id
      };
    }
    
    throw new Error('Invalid credentials');
  },

  // Verify email
  verifyEmail: async (data: { email: string; code: string }) => {
    return publicRequest('/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Auto-verify user (development only)
  autoVerify: async (email: string) => {
    return publicRequest('/dev/auto-verify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// Cart API
export const cartAPI = {
  // Add item to cart
  addToCart: async (cartItem: {
    item_id: string;
    customer: string;
    service_type: string;
    service_type_label: string;
    recipient_name: string;
    recipient_address: string;
    contact_number: string;
    origin_postal?: string;
    destination_postal?: string;
    weight?: number;
    price: number;
  }) => {
    return authenticatedRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify(cartItem),
    });
  },

  // Get user's cart
  getCart: async () => {
    return authenticatedRequest('/cart');
  },

  // Remove item from cart
  removeFromCart: async (itemId: string) => {
    return authenticatedRequest(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Clear entire cart
  clearCart: async () => {
    return authenticatedRequest('/cart', {
      method: 'DELETE',
    });
  },
};

// Shipment API
export const shipmentAPI = {
  // Create single shipment
  createShipment: async (shipmentData: {
    customer: string;
    service_type: string;
    service_type_label: string;
    recipient_name: string;
    recipient_address: string;
    contact_number: string;
    origin_postal?: string;
    destination_postal?: string;
    weight?: number;
    price: number;
  }) => {
    return authenticatedRequest('/ship', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  },

  // Create multiple shipments from cart
  createBulkShipments: async (shipments: Array<{
    customer: string;
    service_type: string;
    service_type_label: string;
    recipient_name: string;
    recipient_address: string;
    contact_number: string;
    origin_postal?: string;
    destination_postal?: string;
    weight?: number;
    price: number;
  }>) => {
    return authenticatedRequest('/ship/bulk', {
      method: 'POST',
      body: JSON.stringify({ shipments }),
    });
  },

  // Get user's shipments
  getShipments: async () => {
    return authenticatedRequest('/shipments');
  },
};

// Package API
export const packageAPI = {
  // Get user's packages
  getPackages: async () => {
    return authenticatedRequest('/packages');
  },

  // Add tracking history
  addTrackingHistory: async (packageId: number, trackingData: {
    status: string;
    location: string;
    description: string;
  }) => {
    return authenticatedRequest(`/packages/${packageId}/tracking`, {
      method: 'POST',
      body: JSON.stringify(trackingData),
    });
  },
};

// Payment API
export const paymentAPI = {
  // Create payment transaction
  createPayment: async (paymentData: {
    shipment_id: number;
    amount: number;
    payment_method: string;
    stripe_payment_intent_id?: string;
    stripe_charge_id?: string;
    billing_address?: any;
  }) => {
    return authenticatedRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Get payment transactions
  getPayments: async () => {
    return authenticatedRequest('/payments');
  },

  // Update payment status
  updatePaymentStatus: async (transactionId: string, status: string) => {
    return authenticatedRequest(`/payments/${transactionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Create Stripe payment intent
  createPaymentIntent: async (amount: number, currency: string = 'usd') => {
    return publicRequest('/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  },
};

// Customer Tariffs API
export const tariffsAPI = {
  // Get all customer tariffs
  getTariffs: async () => {
    return publicRequest('/tariffs');
  },
};

// Shipping Estimates API
export const estimatesAPI = {
  // Create shipping estimate
  createEstimate: async (estimateData: {
    origin_zip: string;
    destination_zip: string;
    weight: number;
    service_type?: string;
  }) => {
    return publicRequest('/estimate', {
      method: 'POST',
      body: JSON.stringify(estimateData),
    });
  },

  // Get recent estimates
  getEstimates: async () => {
    return publicRequest('/estimates');
  },
};

// Tracking API
export const trackingAPI = {
  // Track package
  trackPackage: async (trackingData: {
    tracking_number: string;
    zip_code: string;
  }) => {
    return publicRequest('/track', {
      method: 'POST',
      body: JSON.stringify(trackingData),
    });
  },
};

// Health check API
export const healthAPI = {
  // Check server health
  checkHealth: async () => {
    return publicRequest('/health');
  },
};

// Export all APIs
export const api = {
  auth: authAPI,
  cart: cartAPI,
  shipment: shipmentAPI,
  package: packageAPI,
  payment: paymentAPI,
  tariffs: tariffsAPI,
  estimates: estimatesAPI,
  tracking: trackingAPI,
  health: healthAPI,
};

export default api; 