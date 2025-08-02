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
      .select();
    
    if (error) throw error;
    return data;
  },

  async clearCart(userId) {
    const { data, error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Manual payment operations
  async createManualPayment(paymentData) {
    const { data, error } = await supabase
      .from('manual_payments')
      .insert([paymentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getManualPaymentByReference(referenceNumber) {
    const { data, error } = await supabase
      .from('manual_payments')
      .select('*')
      .eq('reference_number', referenceNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateManualPaymentStatus(referenceNumber, status, additionalData = {}) {
    const { data, error } = await supabase
      .from('manual_payments')
      .update({ 
        status,
        ...additionalData,
        updated_at: new Date().toISOString()
      })
      .eq('reference_number', referenceNumber)
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

  // Package tracking operations
  async getPackageByTrackingNumber(trackingNumber) {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        shipments (
          id,
          shipment_number,
          customer,
          service_type,
          service_type_label,
          status,
          payment_status,
          created_at
        )
      `)
      .eq('tracking_number', trackingNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
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

  async updatePackageStatus(packageId, status, location = null, description = null) {
    // Update package status
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .update({ 
        status,
        current_location: location,
        updated_at: new Date().toISOString()
      })
      .eq('id', packageId)
      .select()
      .single();
    
    if (packageError) throw packageError;

    // Add tracking history entry
    const { data: historyData, error: historyError } = await supabase
      .from('package_tracking_history')
      .insert([{
        package_id: packageId,
        status,
        location,
        description: description || `Status updated to: ${status}`,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (historyError) throw historyError;

    return { package: packageData, history: historyData };
  },

  async updatePackageLocation(packageId, location, description = null) {
    // Update package location
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .update({ 
        current_location: location,
        updated_at: new Date().toISOString()
      })
      .eq('id', packageId)
      .select()
      .single();
    
    if (packageError) throw packageError;

    // Add tracking history entry for location update
    const { data: historyData, error: historyError } = await supabase
      .from('package_tracking_history')
      .insert([{
        package_id: packageId,
        status: packageData.status, // Keep current status
        location,
        description: description || `Location updated to: ${location}`,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (historyError) throw historyError;

    return { package: packageData, history: historyData };
  },

  async getPackagesByUserId(userId) {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        shipments (
          id,
          shipment_number,
          customer,
          service_type,
          service_type_label,
          payment_status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getPackagesWithTrackingHistory(userId) {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        shipments (
          id,
          shipment_number,
          customer,
          service_type,
          service_type_label,
          payment_status,
          created_at
        ),
        package_tracking_history!package_tracking_history_package_id_fkey (
          id,
          status,
          location,
          description,
          timestamp
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async searchPackagesByTrackingNumber(trackingNumber) {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        shipments (
          id,
          shipment_number,
          customer,
          service_type,
          service_type_label,
          payment_status,
          created_at
        ),
        package_tracking_history!package_tracking_history_package_id_fkey (
          id,
          status,
          location,
          description,
          timestamp
        )
      `)
      .ilike('tracking_number', `%${trackingNumber}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
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

  // Shipment operations
  async createShipment(shipmentData) {
    // Generate unique tracking number for the shipment
    const trackingNumber = 'NST' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    
    // Create shipment first
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert([{
        ...shipmentData,
        shipment_number: 'SHP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase(),
        payment_status: 'paid'
      }])
      .select()
      .single();
    
    if (shipmentError) throw shipmentError;
    
    // Create package with tracking number
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .insert([{
        shipment_id: shipment.id,
        tracking_number: trackingNumber,
        user_id: shipmentData.user_id,
        status: 'pending',
        origin_zip: shipmentData.origin_postal,
        destination_zip: shipmentData.destination_postal,
        weight: shipmentData.weight,
        recipient_name: shipmentData.recipient_name,
        recipient_address: shipmentData.recipient_address,
        contact_number: shipmentData.contact_number,
        service_type: shipmentData.service_type,
        customer: shipmentData.customer,
        price: shipmentData.price
      }])
      .select()
      .single();
    
    if (packageError) throw packageError;
    
    // Add initial tracking history entry
    const { error: historyError } = await supabase
      .from('package_tracking_history')
      .insert([{
        package_id: packageData.id,
        status: 'pending',
        location: 'Package created',
        description: 'Package has been created and is awaiting pickup',
        timestamp: new Date().toISOString()
      }]);
    
    if (historyError) throw historyError;
    
    // Return shipment with tracking number
    return {
      ...shipment,
      tracking_number: trackingNumber,
      package_id: packageData.id
    };
  },

  async createBulkShipments(shipmentsData) {
    const createdShipments = [];
    
    for (const shipmentData of shipmentsData) {
      // Generate unique tracking number for each shipment
      const trackingNumber = 'NST' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
      
      // Create shipment first with correct field names
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert([{
          user_id: shipmentData.user_id,
          shipment_number: 'SHP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase(),
          customer: shipmentData.customer,
          service_type: shipmentData.service_type,
          service_type_label: shipmentData.service_type_label || '',
          recipient_name: shipmentData.recipient_name,
          recipient_address: shipmentData.recipient_address,
          contact_number: shipmentData.contact_number,
          price: shipmentData.price,
          origin_postal: shipmentData.origin_zip || shipmentData.origin_postal || '', // Use correct field name
          destination_postal: shipmentData.destination_zip || shipmentData.destination_postal || '', // Use correct field name
          weight: shipmentData.weight,
          payment_status: 'paid'
        }])
        .select()
        .single();
      
      if (shipmentError) throw shipmentError;
      
      // Create package with tracking number using correct field names
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .insert([{
          shipment_id: shipment.id,
          tracking_number: trackingNumber,
          user_id: shipmentData.user_id,
          status: 'pending',
          origin_zip: shipmentData.origin_zip || shipmentData.origin_postal || '', // Packages table uses origin_zip
          destination_zip: shipmentData.destination_zip || shipmentData.destination_postal || '', // Packages table uses destination_zip
          weight: shipmentData.weight,
          recipient_name: shipmentData.recipient_name,
          recipient_address: shipmentData.recipient_address,
          contact_number: shipmentData.contact_number,
          service_type: shipmentData.service_type,
          customer: shipmentData.customer,
          price: shipmentData.price
        }])
        .select()
        .single();
      
      if (packageError) throw packageError;
      
      // Add initial tracking history entry
      const { error: historyError } = await supabase
        .from('package_tracking_history')
        .insert([{
          package_id: packageData.id,
          status: 'pending',
          location: 'Package created',
          description: 'Package has been created and is awaiting pickup',
          timestamp: new Date().toISOString()
        }]);
      
      if (historyError) throw historyError;
      
      createdShipments.push({
        shipment_id: shipment.id,
        shipment_number: shipment.shipment_number,
        tracking_number: trackingNumber,
        package_id: packageData.id,
        ...shipmentData
      });
    }
    
    return createdShipments;
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

  // User operations
  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Admin operations
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAllPackages() {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        shipments (
          id,
          shipment_number,
          customer
        ),
        users (
          username,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAdminStats() {
    try {
      // Get counts
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: packagesCount } = await supabase
        .from('packages')
        .select('*', { count: 'exact', head: true });

      // Get payments count from invoices table
      const { count: paymentsCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      // Get recent packages
      const { data: recentPackages } = await supabase
        .from('packages')
        .select(`
          *,
          shipments (
            id,
            shipment_number,
            customer
          ),
          users (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        counts: {
          users: usersCount || 0,
          packages: packagesCount || 0,
          payments: paymentsCount || 0
        },
        recentActivity: {
          packages: recentPackages || []
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Invoice operations
  async createInvoice(invoiceData) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{
        invoice_number: invoiceData.invoice_number,
        shipment_id: invoiceData.shipment_id,
        user_id: invoiceData.user_id,
        amount: invoiceData.amount,
        currency: invoiceData.currency || 'USD',
        status: invoiceData.status || 'paid',
        email_sent: invoiceData.email_sent || false,
        email_sent_at: invoiceData.email_sent ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getInvoicesByUserId(userId) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        shipments (
          id,
          shipment_number,
          recipient_name,
          service_type,
          payment_status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getInvoiceByNumber(invoiceNumber) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        shipments (
          id,
          shipment_number,
          recipient_name,
          service_type,
          payment_status
        ),
        users (
          id,
          username,
          email,
          phone
        )
      `)
      .eq('invoice_number', invoiceNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateInvoiceEmailStatus(invoiceNumber, emailSent = true) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ 
        email_sent: emailSent,
        email_sent_at: emailSent ? new Date().toISOString() : null
      })
      .eq('invoice_number', invoiceNumber)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createStatusUpdateEmailLog(packageId, userId, status, emailSent = true) {
    const { data, error } = await supabase
      .from('status_update_emails')
      .insert([{
        package_id: packageId,
        user_id: userId,
        status,
        email_sent: emailSent,
        sent_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export default supabase; 