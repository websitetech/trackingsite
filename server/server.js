import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { dbHelpers, supabase } from './supabase.js';
import Stripe from 'stripe';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// console.log(stripe,process.env.STRIPE_SECRET_KEY,);
// Middleware
app.use(cors());
app.use(express.json());

// Email transporter setup - with fallback for development
let transporter;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.log('⚠️  Email configuration not found. Using development mode without email verification.');
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register user with email verification
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, phone, stateProvince, postalCode } = req.body;
    
    if (!username || !email || !password || !phone || !stateProvince || !postalCode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const userData = {
      username,
      email,
      password: hashedPassword,
      email_verified: false,
      verification_code: verificationCode,
      phone,
      state_province: stateProvince,
      postal_code: postalCode
    };

    const newUser = await dbHelpers.createUser(userData);

    // Send verification email if transporter is configured
    if (transporter) {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@trackingsite.com',
        to: email,
        subject: 'Verify your email address',
        text: `Your verification code is: ${verificationCode}`,
        html: `<p>Your verification code is: <b>${verificationCode}</b></p>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email error:', error);
          return res.status(500).json({ error: 'Failed to send verification email' });
        }
        res.status(201).json({ 
          message: 'User registered. Please verify your email.',
          user: { 
            id: newUser.id, 
            username, 
            email, 
            phone, 
            stateProvince, 
            postalCode 
          },
          emailVerification: true,
          verificationCode: verificationCode // Include code for development
        });
      });
    } else {
      // Development mode - return verification code in response
      res.status(201).json({ 
        message: 'User registered successfully. Email verification is disabled in development mode.',
        user: { 
          id: newUser.id, 
          username, 
          email, 
          phone, 
          stateProvince, 
          postalCode 
        },
        emailVerification: false,
        verificationCode: verificationCode, // Include code for development
        note: 'Copy this verification code to verify your email manually'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Email verification endpoint
app.post('/api/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const user = await dbHelpers.getUserByEmail(email);
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    await dbHelpers.updateUserVerification(email, true);
    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await dbHelpers.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Track package
app.post('/api/track', (req, res) => {
  const { tracking_number, zip_code } = req.body;

  if (!tracking_number || !zip_code) {
    return res.status(400).json({ error: 'Tracking number and zip code are required' });
  }

  // Simulate package tracking with mock data
  const mockTrackingData = {
    tracking_number,
    status: 'In Transit',
    location: 'Distribution Center',
    estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      { date: new Date().toISOString(), status: 'Package picked up', location: 'Origin' },
      { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'In transit', location: 'Distribution Center' }
    ]
  };

  res.json(mockTrackingData);
});

// Get shipping estimate
app.post('/api/estimate', async (req, res) => {
  try {
    const { origin_zip, destination_zip, weight, service_type = 'standard' } = req.body;

    if (!origin_zip || !destination_zip || !weight) {
      return res.status(400).json({ error: 'Origin zip, destination zip, and weight are required' });
    }

    // Simulate shipping cost calculation
    const baseCost = 15.99;
    const weightMultiplier = weight * 2.5;
    const distanceMultiplier = Math.abs(parseInt(destination_zip) - parseInt(origin_zip)) / 1000;
    
    let serviceMultiplier = 1;
    switch (service_type) {
      case 'express': serviceMultiplier = 2.5; break;
      case 'overnight': serviceMultiplier = 4; break;
      default: serviceMultiplier = 1;
    }

    const estimatedCost = (baseCost + weightMultiplier + distanceMultiplier) * serviceMultiplier;
    const estimatedDays = service_type === 'overnight' ? 1 : service_type === 'express' ? 2 : 5;

    const estimate = {
      origin_zip,
      destination_zip,
      weight: parseFloat(weight),
      service_type,
      estimated_cost: Math.round(estimatedCost * 100) / 100,
      estimated_days,
      currency: 'USD'
    };

    // Save estimate to database
    await dbHelpers.createShippingEstimate(estimate);

    res.json(estimate);

  } catch (error) {
    console.error('Estimate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new shipment
app.post('/api/ship', authenticateToken, async (req, res) => {
  try {
    const { origin_zip, destination_zip, weight, service_type, recipient_name, recipient_address, contact_number } = req.body;
    const user_id = req.user.id;

    if (!origin_zip || !destination_zip || !weight || !recipient_name || !recipient_address || !contact_number) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate tracking number
    const tracking_number = 'TRK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();

    const packageData = {
      tracking_number,
      user_id,
      origin_zip,
      destination_zip,
      weight: parseFloat(weight),
      recipient_name,
      recipient_address,
      contact_number,
      status: 'pending'
    };

    const newPackage = await dbHelpers.createPackage(packageData);

    res.status(201).json({
      message: 'Shipment created successfully',
      tracking_number,
      package_id: newPackage.id
    });

  } catch (error) {
    console.error('Shipment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create multiple shipments from cart
app.post('/api/ship/bulk', authenticateToken, async (req, res) => {
  try {
    const { shipments } = req.body;
    const user_id = req.user.id;

    if (!shipments || !Array.isArray(shipments) || shipments.length === 0) {
      return res.status(400).json({ error: 'Shipments array is required' });
    }

    // Add user_id to each shipment if not already present
    const shipmentsWithUserId = shipments.map(shipment => ({
      ...shipment,
      user_id: shipment.user_id || user_id
    }));

    // Use the database helper function
    const createdShipments = await dbHelpers.createBulkShipments(shipmentsWithUserId);

    res.status(201).json({
      message: `${createdShipments.length} shipments created successfully`,
      shipments: createdShipments
    });

  } catch (error) {
    console.error('Bulk shipment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's packages
app.get('/api/packages', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const packages = await dbHelpers.getPackagesByUserId(user_id);
    res.json(packages);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shipping estimates history
app.get('/api/estimates', async (req, res) => {
  try {
    const estimates = await dbHelpers.getRecentEstimates(10);
    res.json(estimates);
  } catch (error) {
    console.error('Get estimates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stripe PaymentIntent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'cad' } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    console.log('Creating payment intent with:', { amount, currency });
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      // Focus on payment methods that work well for one-time payments
      payment_method_types: [
        'card', // Credit/Debit cards (includes Apple Pay, Google Pay)
        'link' // Interac e-Transfer
      ]
    });
    
    console.log('Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_method_types: paymentIntent.payment_method_types
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Check Stripe account status and activation
app.get('/api/stripe-account-status', async (req, res) => {
  try {
    // Get account details
    const account = await stripe.accounts.retrieve();
    
    // Get account capabilities
    const capabilities = await stripe.accounts.listCapabilities(account.id);
    
    // Check payment methods availability
    const paymentMethods = await stripe.paymentMethods.list({
      limit: 1
    });

    const status = {
      accountId: account.id,
      country: account.country,
      businessType: account.business_type,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
      capabilities: capabilities.data.reduce((acc, cap) => {
        acc[cap.object] = cap.status;
        return acc;
      }, {}),
      paymentMethodsAvailable: {
        card: true, // Always available
        link: account.country === 'ca', // Link for Canada
        klarna: account.country === 'ca' // Klarna for Canada
      },
      accountStatus: account.charges_enabled && account.payouts_enabled ? 'FULLY_ACTIVATED' : 'PARTIALLY_ACTIVATED'
    };

    res.json(status);
  } catch (error) {
    console.error('Stripe account status check error:', error);
    res.status(500).json({ 
      error: 'Failed to check account status',
      details: error.message 
    });
  }
});

// Check available payment methods and their status
app.get('/api/payment-methods/available', async (req, res) => {
  try {
    // Get account details
    const account = await stripe.accounts.retrieve();
    
    // Get payment method types available for this account
    const paymentMethods = await stripe.paymentMethods.list({
      limit: 1
    });

    // Get account capabilities
    const capabilities = await stripe.accounts.listCapabilities(account.id);
    
    // Create a map of capability statuses
    const capabilityStatus = capabilities.data.reduce((acc, cap) => {
      acc[cap.id] = cap.status;
      return acc;
    }, {});

    // Check specific payment method availability based on actual capabilities
    const availableMethods = {
      card: capabilityStatus['card_payments'] === 'active',
      link: capabilityStatus['link_payments'] === 'active',
      klarna: capabilityStatus['klarna_payments'] === 'active',
      apple_pay: true, // Apple Pay if configured
      google_pay: true, // Google Pay if configured
      // Bank transfer options
      ach_debit: capabilityStatus['us_bank_account_ach_payments'] === 'active',
      sepa_debit: capabilityStatus['sepa_debit_payments'] === 'active',
      bacs_debit: capabilityStatus['bacs_debit_payments'] === 'active',
      // Other payment methods
      ideal: capabilityStatus['ideal_payments'] === 'active',
      sofort: capabilityStatus['sofort_payments'] === 'active',
      bancontact: capabilityStatus['bancontact_payments'] === 'active',
      eps: capabilityStatus['eps_payments'] === 'active',
      giropay: capabilityStatus['giropay_payments'] === 'active',
      p24: capabilityStatus['p24_payments'] === 'active',
      blik: false, // Not available for CA
      oxxo: false, // Not available for CA
      konbini: false, // Not available for CA
      promptpay: false, // Not available for CA
      paynow: false, // Not available for CA
      grabpay: false, // Not available for CA
      fpx: false, // Not available for CA
      boleto: false, // Not available for CA
      pix: false, // Not available for CA
    };
    
    const status = {
      accountId: account.id,
      country: account.country,
      businessType: account.business_type,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
      capabilities: capabilityStatus,
      availablePaymentMethods: availableMethods,
      accountStatus: account.charges_enabled && account.payouts_enabled ? 'FULLY_ACTIVATED' : 'PARTIALLY_ACTIVATED',
      // Check if Link is specifically enabled
      linkEnabled: capabilityStatus['link_payments'] === 'active',
      // Check if Apple Pay is configured
      applePayEnabled: true, // Will be true if configured
      // Debug info
      debug: {
        accountRequirements: account.requirements,
        accountCapabilities: capabilities.data,
        paymentMethodTypes: paymentMethods.data.map(pm => pm.type),
        capabilityStatus: capabilityStatus
      }
    };

    res.json(status);
  } catch (error) {
    console.error('Payment methods check error:', error);
    res.status(500).json({ 
      error: 'Failed to check payment methods',
      details: error.message 
    });
  }
});

// Cart endpoints
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  try {
    const { 
      item_id, 
      customer, 
      service_type, 
      service_type_label, 
      recipient_name, 
      recipient_address, 
      contact_number, 
      origin_postal, 
      destination_postal, 
      weight, 
      price 
    } = req.body;
    const user_id = req.user.id;

    if (!customer || !service_type || !recipient_name || !recipient_address || !contact_number || !price) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const cartItem = {
      user_id,
      item_id: item_id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer,
      service_type,
      service_type_label: service_type_label || '',
      recipient_name,
      recipient_address,
      contact_number,
      origin_postal: origin_postal || '',
      destination_postal: destination_postal || '',
      weight: weight || 1,
      price: parseFloat(price),
      created_at: new Date().toISOString()
    };

    const newCartItem = await dbHelpers.addToCart(cartItem);
    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const cartItems = await dbHelpers.getCartByUserId(user_id);
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart items' });
  }
});

app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    await dbHelpers.removeFromCart(id, user_id);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    await dbHelpers.clearCart(user_id);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Manual payment endpoints
app.post('/api/manual-payment/create', authenticateToken, async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'cad', 
      paymentMethod, 
      orderDetails,
      fromCart = false,
      singleShipmentData = null
    } = req.body;
    const user_id = req.user.id;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ error: 'Amount and payment method are required' });
    }

    // Generate unique reference number
    const referenceNumber = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const manualPayment = {
      user_id,
      reference_number: referenceNumber,
      amount: parseFloat(amount),
      currency,
      payment_method: paymentMethod, // 'interac_etransfer', 'bank_transfer'
      status: 'pending',
      order_details: orderDetails,
      from_cart: fromCart,
      single_shipment_data: singleShipmentData,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    const newPayment = await dbHelpers.createManualPayment(manualPayment);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Create manual payment error:', error);
    res.status(500).json({ error: 'Failed to create manual payment' });
  }
});

app.post('/api/manual-payment/verify', async (req, res) => {
  try {
    const { reference_number, customer_email, customer_name } = req.body;

    if (!reference_number || !customer_email) {
      return res.status(400).json({ error: 'Reference number and customer email are required' });
    }

    // Find the manual payment
    const payment = await dbHelpers.getManualPaymentByReference(reference_number);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Update payment status to verified
    await dbHelpers.updateManualPaymentStatus(reference_number, 'verified', {
      customer_email,
      customer_name,
      verified_at: new Date().toISOString()
    });

    // Process the order based on payment type
    if (payment.from_cart) {
      // Process cart items
      // This would create shipments from the cart
      res.json({ 
        message: 'Payment verified successfully',
        reference_number,
        status: 'verified',
        next_step: 'process_cart'
      });
    } else if (payment.single_shipment_data) {
      // Process single shipment
      const shipmentResult = await dbHelpers.createShipment(payment.single_shipment_data);
      res.json({ 
        message: 'Payment verified and shipment created',
        reference_number,
        status: 'verified',
        shipment_number: shipmentResult.shipment_number,
        tracking_number: shipmentResult.tracking_number
      });
    } else {
      res.json({ 
        message: 'Payment verified successfully',
        reference_number,
        status: 'verified'
      });
    }

  } catch (error) {
    console.error('Verify manual payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

app.get('/api/manual-payment/:referenceNumber', async (req, res) => {
  try {
    const { referenceNumber } = req.params;
    const payment = await dbHelpers.getManualPaymentByReference(referenceNumber);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get manual payment error:', error);
    res.status(500).json({ error: 'Failed to get payment details' });
  }
});

// Development endpoint to auto-verify users (for testing)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/dev/auto-verify', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      await dbHelpers.updateUserVerification(email, true);
      res.json({ message: 'User auto-verified for development' });
    } catch (error) {
      console.error('Auto-verify error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Development endpoint to add initial tracking history for existing packages
  app.post('/api/dev/add-initial-history', async (req, res) => {
    try {
      // Get all packages that don't have tracking history
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id, tracking_number, status')
        .not('id', 'in', (
          supabase
            .from('package_tracking_history')
            .select('package_id')
        ));
      
      if (packagesError) throw packagesError;

      if (packages.length === 0) {
        return res.json({ message: 'All packages already have tracking history' });
      }

      // Add initial tracking history for each package
      const historyEntries = packages.map(pkg => ({
        package_id: pkg.id,
        status: pkg.status || 'pending',
        location: 'Package created',
        description: 'Package has been created and is awaiting pickup',
        timestamp: new Date().toISOString()
      }));

      const { error: historyError } = await supabase
        .from('package_tracking_history')
        .insert(historyEntries);

      if (historyError) throw historyError;

      res.json({ 
        message: `Added initial tracking history for ${packages.length} packages`,
        packages_updated: packages.length
      });
    } catch (error) {
      console.error('Add initial history error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Tracking endpoints
app.get('/api/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    if (!trackingNumber) {
      return res.status(400).json({ error: 'Tracking number is required' });
    }

    const packageData = await dbHelpers.getPackageByTrackingNumber(trackingNumber);
    
    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Get tracking history
    const trackingHistory = await dbHelpers.getPackageTrackingHistory(packageData.id);

    res.json({
      package: packageData,
      tracking_history: trackingHistory,
      shipment: packageData.shipments
    });

  } catch (error) {
    console.error('Track package error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search packages by tracking number (partial match)
app.get('/api/search/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    if (!trackingNumber) {
      return res.status(400).json({ error: 'Tracking number is required' });
    }

    const packages = await dbHelpers.searchPackagesByTrackingNumber(trackingNumber);
    
    res.json({ packages });

  } catch (error) {
    console.error('Search packages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's packages with tracking history
app.get('/api/packages/with-history', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const packages = await dbHelpers.getPackagesWithTrackingHistory(user_id);
    res.json(packages);
  } catch (error) {
    console.error('Get packages with history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update package status (admin only)
app.post('/api/packages/:packageId/status', authenticateToken, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { status, location, description } = req.body;
    const user_id = req.user.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Check if user is admin or owns the package
    const packageData = await dbHelpers.getPackageByTrackingNumber(packageId);
    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // For now, allow any authenticated user to update status
    // In production, you'd want to check if user is admin or package owner
    const result = await dbHelpers.updatePackageStatus(packageData.id, status, location, description);
    
    res.json({
      message: 'Package status updated successfully',
      package: result.package,
      history: result.history
    });

  } catch (error) {
    console.error('Update package status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get package tracking history
app.get('/api/packages/:packageId/history', async (req, res) => {
  try {
    const { packageId } = req.params;
    
    const history = await dbHelpers.getPackageTrackingHistory(packageId);
    
    res.json({ tracking_history: history });

  } catch (error) {
    console.error('Get tracking history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using Supabase database');
}); 