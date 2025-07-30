import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions for database operations
export const dbHelpers = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserVerification(email, verified) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        email_verified: verified,
        verification_code: verified ? null : undefined
      })
      .eq('email', email)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Cart operations
  async addToCart(cartItem) {
    const { data, error } = await supabase
      .from('cart')
      .insert([cartItem])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCartByUserId(userId) {
    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async removeFromCart(itemId, userId) {
    const { data, error } = await supabase
      .from('cart')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async clearCart(userId) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true };
  },

  // Shipment operations
  async createShipment(shipmentData) {
    const { data, error } = await supabase
      .from('shipments')
      .insert([shipmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getShipmentsByUserId(userId) {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        packages(tracking_number)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Flatten the data to include tracking_number at the root level
    return data.map(shipment => ({
      ...shipment,
      tracking_number: shipment.packages?.[0]?.tracking_number || shipment.shipment_number
    }));
  },

  async updateShipmentStatus(shipmentId, status) {
    const { data, error } = await supabase
      .from('shipments')
      .update({ status })
      .eq('id', shipmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Package operations (enhanced)
  async createPackage(packageData) {
    const { data, error } = await supabase
      .from('packages')
      .insert([packageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPackagesByUserId(userId) {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        shipments (
          shipment_number,
          customer,
          service_type,
          service_type_label,
          status,
          payment_status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getPackageByTrackingNumber(trackingNumber) {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        shipments (
          shipment_number,
          customer,
          service_type,
          service_type_label,
          status,
          payment_status
        ),
        package_tracking_history (
          status,
          location,
          description,
          timestamp
        )
      `)
      .eq('tracking_number', trackingNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async addTrackingHistory(packageId, trackingData) {
    const { data, error } = await supabase
      .from('package_tracking_history')
      .insert([{
        package_id: packageId,
        ...trackingData
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPackageTrackingHistory(packageId) {
    const { data, error } = await supabase
      .from('package_tracking_history')
      .select('*')
      .eq('package_id', packageId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Payment transaction operations
  async createPaymentTransaction(transactionData) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert([transactionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPaymentTransactionsByUserId(userId) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        shipments (
          shipment_number,
          customer,
          service_type_label
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(transactionId, status) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .update({ payment_status: status })
      .eq('transaction_id', transactionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Customer tariffs operations
  async getCustomerTariffs() {
    const { data, error } = await supabase
      .from('customer_tariffs')
      .select('*')
      .eq('is_active', true)
      .order('customer_name');
    
    if (error) throw error;
    return data;
  },

  async getCustomerTariff(customerName) {
    const { data, error } = await supabase
      .from('customer_tariffs')
      .select('*')
      .eq('customer_name', customerName)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Shipping estimates operations
  async createShippingEstimate(estimateData) {
    const { data, error } = await supabase
      .from('shipping_estimates')
      .insert([estimateData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRecentEstimates(limit = 10) {
    const { data, error } = await supabase
      .from('shipping_estimates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Utility functions
  generateTrackingNumber() {
    return 'TRK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  },

  generateShipmentNumber() {
    return 'SHP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  },

  generateTransactionId() {
    return 'TXN' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  },

  // Admin operations
  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateUser(userId, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllShipments() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        users!inner(username, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateShipment(shipmentId, updateData) {
    const { data, error } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', shipmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllPackages() {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        shipments!inner(shipment_number, customer),
        users!inner(username, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updatePackage(packageId, updateData) {
    const { data, error } = await supabase
      .from('packages')
      .update(updateData)
      .eq('id', packageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAdminStats() {
    // Get counts for different entities
    const [usersResult, shipmentsResult, packagesResult, paymentsResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('shipments').select('*', { count: 'exact', head: true }),
      supabase.from('packages').select('*', { count: 'exact', head: true }),
      supabase.from('payment_transactions').select('*', { count: 'exact', head: true })
    ]);

    // Get recent activity
    const recentShipments = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const recentPackages = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      counts: {
        users: usersResult.count || 0,
        shipments: shipmentsResult.count || 0,
        packages: packagesResult.count || 0,
        payments: paymentsResult.count || 0
      },
      recentActivity: {
        shipments: recentShipments.data || [],
        packages: recentPackages.data || []
      }
    };
  }
};

export default supabase; 