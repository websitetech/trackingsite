import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0,
      verification_code TEXT,
      phone TEXT,
      state_province TEXT,
      postal_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Packages table
    db.run(`CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      status TEXT DEFAULT 'pending',
      origin_zip TEXT,
      destination_zip TEXT,
      weight REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Shipping estimates table
    db.run(`CREATE TABLE IF NOT EXISTS shipping_estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin_zip TEXT NOT NULL,
      destination_zip TEXT NOT NULL,
      weight REAL NOT NULL,
      service_type TEXT NOT NULL,
      estimated_cost REAL NOT NULL,
      estimated_days INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

// Email transporter setup (use your SMTP credentials in .env for production)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

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
    db.run(
      'INSERT INTO users (username, email, password, email_verified, verification_code, phone, state_province, postal_code) VALUES (?, ?, ?, 0, ?, ?, ?, ?)',
      [username, email, hashedPassword, verificationCode, phone, stateProvince, postalCode],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        // Send verification email
        const mailOptions = {
          from: process.env.SMTP_FROM || 'noreply@trackingsite.com',
          to: email,
          subject: 'Verify your email address',
          text: `Your verification code is: ${verificationCode}`,
          html: `<p>Your verification code is: <b>${verificationCode}</b></p>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ error: 'Failed to send verification email' });
          }
          res.status(201).json({ 
            message: 'User registered. Please verify your email.',
            user: { id: this.lastID, username, email, phone, stateProvince, postalCode },
            emailVerification: true
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Email verification endpoint
app.post('/api/verify-email', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.email_verified) return res.status(400).json({ error: 'Email already verified' });
    if (user.verification_code !== code) return res.status(400).json({ error: 'Invalid verification code' });
    db.run('UPDATE users SET email_verified = 1, verification_code = NULL WHERE email = ?', [email], function(err2) {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Email verified successfully' });
    });
  });
});

// Prevent login if not verified
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
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
  });
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
app.post('/api/estimate', (req, res) => {
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
    weight,
    service_type,
    estimated_cost: Math.round(estimatedCost * 100) / 100,
    estimated_days,
    currency: 'USD'
  };

  // Save estimate to database
  db.run(
    'INSERT INTO shipping_estimates (origin_zip, destination_zip, weight, service_type, estimated_cost, estimated_days) VALUES (?, ?, ?, ?, ?, ?)',
    [origin_zip, destination_zip, weight, service_type, estimate.estimated_cost, estimatedDays]
  );

  res.json(estimate);
});

// Create new shipment
app.post('/api/ship', authenticateToken, (req, res) => {
  const { origin_zip, destination_zip, weight, service_type, recipient_name, recipient_address } = req.body;
  const user_id = req.user.id;

  if (!origin_zip || !destination_zip || !weight || !recipient_name || !recipient_address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Generate tracking number
  const tracking_number = 'TRK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();

  db.run(
    'INSERT INTO packages (tracking_number, user_id, origin_zip, destination_zip, weight, status) VALUES (?, ?, ?, ?, ?, ?)',
    [tracking_number, user_id, origin_zip, destination_zip, weight, 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        message: 'Shipment created successfully',
        tracking_number,
        package_id: this.lastID
      });
    }
  );
});

// Get user's packages
app.get('/api/packages', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.all('SELECT * FROM packages WHERE user_id = ? ORDER BY created_at DESC', [user_id], (err, packages) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(packages);
  });
});

// Get shipping estimates history
app.get('/api/estimates', (req, res) => {
  db.all('SELECT * FROM shipping_estimates ORDER BY created_at DESC LIMIT 10', (err, estimates) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(estimates);
  });
});

// DEV: Insert test packages
app.post('/api/dev/seed-packages', (req, res) => {
  const testPackages = [
    {
      tracking_number: 'TRK12345678',
      user_id: 1,
      status: 'in transit',
      origin_zip: '10001',
      destination_zip: '90001',
      weight: 2.5
    },
    {
      tracking_number: 'TRK87654321',
      user_id: 1,
      status: 'delivered',
      origin_zip: '30301',
      destination_zip: '60601',
      weight: 1.2
    },
    {
      tracking_number: 'TRK11223344',
      user_id: 2,
      status: 'on the way',
      origin_zip: '94105',
      destination_zip: '33101',
      weight: 3.0
    }
  ];
  let inserted = 0;
  testPackages.forEach(pkg => {
    db.run(
      'INSERT OR IGNORE INTO packages (tracking_number, user_id, status, origin_zip, destination_zip, weight) VALUES (?, ?, ?, ?, ?, ?)',
      [pkg.tracking_number, pkg.user_id, pkg.status, pkg.origin_zip, pkg.destination_zip, pkg.weight],
      function(err) {
        if (!err) inserted++;
        if (inserted === testPackages.length) {
          res.json({ message: 'Test packages inserted' });
        }
      }
    );
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 