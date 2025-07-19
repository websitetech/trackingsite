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

  // Package operations
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
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getPackageByTrackingNumber(trackingNumber) {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('tracking_number', trackingNumber)
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
  }
};

export default supabase; 