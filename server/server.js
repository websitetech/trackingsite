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
      user: { id: user.id, username: user.username, email: user.email }
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

    const createdShipments = [];

    for (const shipment of shipments) {
      const { origin_zip, destination_zip, weight, service_type, recipient_name, recipient_address, contact_number } = shipment;

      if (!origin_zip || !destination_zip || !weight || !recipient_name || !recipient_address || !contact_number) {
        return res.status(400).json({ error: 'All fields are required for each shipment' });
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
      createdShipments.push({
        tracking_number: newPackage.tracking_number,
        package_id: newPackage.id
      });
    }

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
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using Supabase database');
}); 