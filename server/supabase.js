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
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
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
  }
};

export default supabase; 