import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { dbHelpers } from './supabase.js';
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

// Admin middleware
const requireAdmin = async (req, res, next) => {
  try {
    // Get user from database to check role
    const user = await dbHelpers.getUserById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
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
app.post('/api/track', async (req, res) => {
  try {
    const { tracking_number } = req.body;

    if (!tracking_number) {
      return res.status(400).json({ error: 'Tracking number is required' });
    }

    // Get package from database
    const packageData = await dbHelpers.getPackageByTrackingNumber(tracking_number);
    
    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Get tracking history for the package
    const trackingHistory = await dbHelpers.getPackageTrackingHistory(packageData.id);

    // Format tracking data
    const trackingData = {
      tracking_number: packageData.tracking_number,
      status: packageData.status,
      location: trackingHistory.length > 0 ? trackingHistory[0].location : 'Origin',
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Mock delivery date
      history: trackingHistory.map(entry => ({
        date: entry.timestamp,
        status: entry.status,
        location: entry.location,
        description: entry.description
      }))
    };

    res.json(trackingData);
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
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
    const { 
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
      return res.status(400).json({ error: 'All required fields are missing' });
    }

    // Generate shipment number
    const shipment_number = dbHelpers.generateShipmentNumber();

    const shipmentData = {
      user_id,
      shipment_number,
      customer,
      service_type,
      service_type_label,
      recipient_name,
      recipient_address,
      contact_number,
      price: parseFloat(price),
      origin_postal,
      destination_postal,
      weight: weight ? parseFloat(weight) : null,
      status: 'pending',
      payment_status: 'pending'
    };

    const newShipment = await dbHelpers.createShipment(shipmentData);

    // Create package record linked to the shipment
    const tracking_number = dbHelpers.generateTrackingNumber();
    const packageData = {
      user_id,
      shipment_id: newShipment.id,
      tracking_number,
      origin_zip: origin_postal,
      destination_zip: destination_postal,
      weight: weight ? parseFloat(weight) : null,
      status: 'pending',
      recipient_name,
      recipient_address,
      contact_number
    };

    const newPackage = await dbHelpers.createPackage(packageData);

    // Add initial tracking history entry
    const initialTrackingData = {
      status: 'Shipment Created',
      location: 'Origin',
      description: `Shipment ${shipment_number} created and package ${tracking_number} assigned`
    };

    await dbHelpers.addTrackingHistory(newPackage.id, initialTrackingData);

    res.status(201).json({
      message: 'Shipment and package created successfully',
      shipment_number: newShipment.shipment_number,
      shipment_id: newShipment.id,
      tracking_number: newPackage.tracking_number,
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

    const createdShipments = [];

    for (const shipment of shipments) {
      const { 
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
      } = shipment;

      if (!customer || !service_type || !recipient_name || !recipient_address || !contact_number || !price) {
        return res.status(400).json({ error: 'All required fields are missing for each shipment' });
      }

      // Generate shipment number
      const shipment_number = dbHelpers.generateShipmentNumber();

      const shipmentData = {
        user_id,
        shipment_number,
        customer,
        service_type,
        service_type_label,
        recipient_name,
        recipient_address,
        contact_number,
        price: parseFloat(price),
        origin_postal,
        destination_postal,
        weight: weight ? parseFloat(weight) : null,
        status: 'pending',
        payment_status: 'pending'
      };

      const newShipment = await dbHelpers.createShipment(shipmentData);

      // Create package record linked to the shipment
      const tracking_number = dbHelpers.generateTrackingNumber();
      const packageData = {
        user_id,
        shipment_id: newShipment.id,
        tracking_number,
        origin_zip: origin_postal,
        destination_zip: destination_postal,
        weight: weight ? parseFloat(weight) : null,
        status: 'pending',
        recipient_name,
        recipient_address,
        contact_number
      };

      const newPackage = await dbHelpers.createPackage(packageData);

      // Add initial tracking history entry
      const initialTrackingData = {
        status: 'Shipment Created',
        location: 'Origin',
        description: `Shipment ${shipment_number} created and package ${tracking_number} assigned`
      };

      await dbHelpers.addTrackingHistory(newPackage.id, initialTrackingData);

      createdShipments.push({
        shipment_number: newShipment.shipment_number,
        shipment_id: newShipment.id,
        tracking_number: newPackage.tracking_number,
        package_id: newPackage.id
      });
    }

    res.status(201).json({
      message: `${createdShipments.length} shipments and packages created successfully`,
      shipments: createdShipments
    });

  } catch (error) {
    console.error('Bulk shipment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cart management endpoints
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  try {
    const cartItem = {
      user_id: req.user.id,
      ...req.body
    };

    const newCartItem = await dbHelpers.addToCart(cartItem);
    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await dbHelpers.getCartByUserId(req.user.id);
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    await dbHelpers.removeFromCart(itemId, req.user.id);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    await dbHelpers.clearCart(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer tariffs
app.get('/api/tariffs', async (req, res) => {
  try {
    const tariffs = await dbHelpers.getCustomerTariffs();
    res.json(tariffs);
  } catch (error) {
    console.error('Get tariffs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's shipments
app.get('/api/shipments', authenticateToken, async (req, res) => {
  try {
    const shipments = await dbHelpers.getShipmentsByUserId(req.user.id);
    res.json(shipments);
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment transactions
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const transactions = await dbHelpers.getPaymentTransactionsByUserId(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment transaction
app.post('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { 
      shipment_id, 
      amount, 
      payment_method, 
      stripe_payment_intent_id,
      stripe_charge_id,
      billing_address 
    } = req.body;

    const transactionData = {
      user_id: req.user.id,
      shipment_id,
      transaction_id: dbHelpers.generateTransactionId(),
      amount: parseFloat(amount),
      payment_method,
      payment_status: 'pending',
      stripe_payment_intent_id,
      stripe_charge_id,
      billing_address
    };

    const newTransaction = await dbHelpers.createPaymentTransaction(transactionData);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment status
app.patch('/api/payments/:transactionId/status', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    const updatedTransaction = await dbHelpers.updatePaymentStatus(transactionId, status);
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add tracking history
app.post('/api/packages/:packageId/tracking', authenticateToken, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { status, location, description } = req.body;

    const trackingData = {
      status,
      location,
      description
    };

    const newTrackingEntry = await dbHelpers.addTrackingHistory(packageId, trackingData);
    res.status(201).json(newTrackingEntry);
  } catch (error) {
    console.error('Add tracking history error:', error);
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
    const { amount, currency = 'usd' } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
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

  // Debug endpoint to check admin user
  app.get('/api/dev/check-admin', async (req, res) => {
    try {
      const adminUser = await dbHelpers.getUserByUsername('admin');
      res.json({ 
        adminUser,
        exists: !!adminUser,
        hasRole: adminUser ? !!adminUser.role : false,
        role: adminUser ? adminUser.role : null
      });
    } catch (error) {
      console.error('Check admin error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
}

// Admin endpoints
// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await dbHelpers.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (admin only)
app.put('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role, status } = req.body;
    
    const updateData = { username, email, role };
    if (status !== undefined) {
      updateData.email_verified = status === 'active';
    }
    
    const updatedUser = await dbHelpers.updateUser(userId, updateData);
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all shipments (admin only)
app.get('/api/admin/shipments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const shipments = await dbHelpers.getAllShipments();
    res.json(shipments);
  } catch (error) {
    console.error('Get all shipments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update shipment status (admin only)
app.put('/api/admin/shipments/:shipmentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { status, driver, notes } = req.body;
    
    const updateData = { status };
    if (driver !== undefined) updateData.driver = driver;
    if (notes !== undefined) updateData.notes = notes;
    
    const updatedShipment = await dbHelpers.updateShipment(shipmentId, updateData);
    res.json(updatedShipment);
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all packages (admin only)
app.get('/api/admin/packages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const packages = await dbHelpers.getAllPackages();
    res.json(packages);
  } catch (error) {
    console.error('Get all packages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update package status (admin only)
app.put('/api/admin/packages/:packageId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { status, current_location, delivery_notes } = req.body;
    
    const updateData = { status };
    if (current_location !== undefined) updateData.current_location = current_location;
    if (delivery_notes !== undefined) updateData.delivery_notes = delivery_notes;
    
    const updatedPackage = await dbHelpers.updatePackage(packageId, updateData);
    res.json(updatedPackage);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin dashboard stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await dbHelpers.getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using Supabase database');
}); 