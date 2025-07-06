import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

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

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ 
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 