import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { dbHelpers, supabase } from './supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to generate meaningful status descriptions
const getStatusDescription = (status, location = null) => {
  const locationText = location ? ` at ${location}` : '';
  
  switch (status) {
    case 'pending':
      return `Package is pending and awaiting pickup${locationText}`;
    case 'in_transit':
      return `Package is in transit${locationText}`;
    case 'out_for_delivery':
      return `Package is out for delivery${locationText}`;
    case 'delivered':
      return `Package has been delivered${locationText}`;
    case 'cancelled':
      return `Package delivery has been cancelled${locationText}`;
    default:
      return `Package status updated to ${status}${locationText}`;
  }
};

// console.log(stripe,process.env.STRIPE_SECRET_KEY,);
// Middleware
app.use(cors());
app.use(express.json());

// Email transporter setup - with fallback for development
let transporter;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const isSSL = port === 465;
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSSL, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.log('⚠️  Email configuration not found. Using development mode without email verification.');
}

// Helper function to generate invoice HTML
const generateInvoiceHTML = async (shipment, user, invoiceNumber) => {
  const currentDate = new Date().toLocaleDateString();
  
  // Get package status since status is only in packages table
  let packageStatus = 'pending';
  try {
    const packageData = await dbHelpers.getPackageByTrackingNumber(shipment.tracking_number);
    if (packageData) {
      packageStatus = packageData.status;
    }
  } catch (error) {
    console.log('Could not get package status:', error.message);
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 15px; background-color: #f5f5f5; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .company-logo { max-width: 200px; height: auto; margin-bottom: 15px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .invoice-title { font-size: 18px; color: #666; }
        .invoice-details { display: flex; justify-content: space-around; margin-bottom: 20px; }
        .invoice-info, .customer-info { flex: 1; margin: 0 15px; }
        .invoice-info h3, .customer-info h3 { margin-top: 0; color: #333; font-size: 16px; }
        .shipment-details { margin-bottom: 20px; }
        .shipment-details h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px; font-size: 16px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .total-section { border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .tracking-info { background-color: #f8f9fa; padding: 12px; border-radius: 5px; margin-top: 15px; }
        .tracking-number { font-weight: bold; color: #007bff; }
        .tracking-link { color: #007bff; text-decoration: none; font-weight: bold; }
        .tracking-link:hover { text-decoration: underline; }
        .bottom-logo { text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
        .bottom-logo img { max-width: 120px; height: auto; cursor: pointer; }
        .bottom-logo a { text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-name">Noble Speedy Trac</div>
          <div class="invoice-title">Order Invoice</div>
        </div>
        
        <div class="invoice-details">
          <div class="invoice-info">
            <h3>Invoice Details</h3>
            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span class="detail-value">${invoiceNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${currentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Shipment Number:</span>
              <span class="detail-value">${shipment.shipment_number}</span>
            </div>
          </div>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${user.username}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${user.email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${user.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="shipment-details">
          <h3>Shipment Details</h3>
          <div class="detail-row">
            <span class="detail-label">Service Type:</span>
            <span class="detail-value">${shipment.service_type_label || shipment.service_type}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Recipient Name:</span>
            <span class="detail-value">${shipment.recipient_name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Recipient Address:</span>
            <span class="detail-value">${shipment.recipient_address}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Contact Number:</span>
            <span class="detail-value">${shipment.contact_number}</span>
          </div>
        </div>
        
        <div class="tracking-info">
          <h3>Tracking Information</h3>
          <div class="detail-row">
            <span class="detail-label">Tracking Number:</span>
            <span class="detail-value tracking-number">${shipment.tracking_number}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">${packageStatus}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Track Your Package:</span>
            <span class="detail-value">
              <a href="https://www.noblespeedytrac.com/" class="tracking-link" target="_blank">
                Click here to track your package
              </a>
            </span>
          </div>
        </div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Total Amount:</span>
            <span>$${shipment.price}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Noble Speedy Trac!</p>
          <p>For any questions, please contact us at info@noblespeedytrac.com</p>
          <p>Track your package at: <a href="https://www.noblespeedytrac.com/" class="tracking-link" target="_blank">https://www.noblespeedytrac.com/</a></p>
        </div>
        
        <div class="bottom-logo">
          <a href="https://www.noblespeedytrac.com/" target="_blank">
            <img src="https://www.noblespeedytrac.com/logo.png" alt="Noble Speedy Trac Logo" onerror="this.style.display='none'">
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to generate bulk invoice HTML for multiple shipments
const generateBulkInvoiceHTML = async (shipments, user, invoiceNumber) => {
  const currentDate = new Date().toLocaleDateString();
  const totalAmount = shipments.reduce((sum, shipment) => sum + parseFloat(shipment.price), 0);
  
  // Get package statuses for all shipments
  const shipmentItems = await Promise.all(shipments.map(async (shipment, index) => {
    let packageStatus = 'pending';
    try {
      const packageData = await dbHelpers.getPackageByTrackingNumber(shipment.tracking_number);
      if (packageData) {
        packageStatus = packageData.status;
      }
    } catch (error) {
      console.log('Could not get package status for shipment:', shipment.tracking_number);
    }
    
    return `
      <div class="shipment-item" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
        <h4 style="margin-top: 0; color: #333;">Item ${index + 1}</h4>
        <div class="detail-row">
          <span class="detail-label">Shipment Number:</span>
          <span class="detail-value">${shipment.shipment_number}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tracking Number:</span>
          <span class="detail-value tracking-number">${shipment.tracking_number}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service Type:</span>
          <span class="detail-value">${shipment.service_type_label || shipment.service_type}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Recipient Name:</span>
          <span class="detail-value">${shipment.recipient_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Recipient Address:</span>
          <span class="detail-value">${shipment.recipient_address}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact Number:</span>
          <span class="detail-value">${shipment.contact_number}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">${packageStatus}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Price:</span>
          <span class="detail-value">$${shipment.price}</span>
        </div>
      </div>
    `;
  }));
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bulk Order Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 15px; background-color: #f5f5f5; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .company-logo { max-width: 200px; height: auto; margin-bottom: 15px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .invoice-title { font-size: 18px; color: #666; }
        .invoice-details { display: flex; justify-content: space-around; margin-bottom: 20px; }
        .invoice-info, .customer-info { flex: 1; margin: 0 15px; }
        .invoice-info h3, .customer-info h3 { margin-top: 0; color: #333; font-size: 16px; }
        .shipment-items { margin-bottom: 20px; }
        .shipment-items h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px; font-size: 16px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .total-section { border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .tracking-link { color: #007bff; text-decoration: none; font-weight: bold; }
        .tracking-link:hover { text-decoration: underline; }
        .bottom-logo { text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
        .bottom-logo img { max-width: 120px; height: auto; }
        .bottom-logo a { text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-name">Noble Speedy Trac</div>
          <div class="invoice-title">Bulk Order Invoice</div>
        </div>
        
        <div class="invoice-details">
          <div class="invoice-info">
            <h3>Invoice Details</h3>
            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span class="detail-value">${invoiceNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${currentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Items:</span>
              <span class="detail-value">${shipments.length}</span>
            </div>
          </div>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${user.username}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${user.email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${user.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="shipment-items">
          <h3>Shipment Items</h3>
          ${shipmentItems.join('')}
        </div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Total Amount:</span>
            <span>$${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Noble Speedy Trac!</p>
          <p>For any questions, please contact us at info@noblespeedytrac.com</p>
          <p>Track your packages at: <a href="https://www.noblespeedytrac.com/" class="tracking-link" target="_blank">https://www.noblespeedytrac.com/</a></p>
        </div>
        
        <div class="bottom-logo">
          <a href="https://www.noblespeedytrac.com/" target="_blank">
            <img src="https://www.noblespeedytrac.com/logo.png" alt="Noble Speedy Trac Logo" onerror="this.style.display='none'">
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to send invoice email
const sendInvoiceEmail = async (shipment, user) => {
  if (!transporter) {
    console.log('⚠️  Email transporter not configured. Skipping invoice email.');
    return false;
  }

  try {
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    
    const invoiceHTML = await generateInvoiceHTML(shipment, user, invoiceNumber);
    
    // Create invoice record in database
    await dbHelpers.createInvoice({
      invoice_number: invoiceNumber,
      shipment_id: shipment.id,
      user_id: user.id,
      amount: shipment.price,
      currency: 'USD',
      status: 'paid'
    });
    
    // Generate PDF from HTML
    let pdfBuffer;
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(invoiceHTML, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ 
        format: 'A4', 
        printBackground: true,
        margin: { top: '10px', right: '15px', bottom: '10px', left: '15px' }
      });
      await browser.close();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      // Fallback to HTML attachment if PDF generation fails
      pdfBuffer = Buffer.from(invoiceHTML, 'utf-8');
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'info@noblespeedytrac.com',
      to: user.email,
      subject: `Order Invoice - Shipment ${shipment.shipment_number}`,
      html: invoiceHTML,
      attachments: [
        {
          filename: `invoice-${shipment.shipment_number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent successfully:', info.messageId);
    
    // Update invoice email status
    await dbHelpers.updateInvoiceEmailStatus(invoiceNumber, true);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    return false;
  }
};

// Helper function to send bulk invoice email
const sendBulkInvoiceEmail = async (shipments, user) => {
  if (!transporter) {
    console.log('⚠️  Email transporter not configured. Skipping bulk invoice email.');
    return false;
  }

  try {
    // Generate invoice number
    const invoiceNumber = `BULK-INV-${Date.now()}`;
    
    const invoiceHTML = await generateBulkInvoiceHTML(shipments, user, invoiceNumber);
    
    // Create invoice records in database for each shipment
    for (const shipment of shipments) {
      await dbHelpers.createInvoice({
        invoice_number: `${invoiceNumber}-${shipment.shipment_number}`,
        shipment_id: shipment.id,
        user_id: user.id,
        amount: shipment.price,
        currency: 'USD',
        status: 'paid'
      });
    }
    
    // Generate PDF from HTML
    let pdfBuffer;
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });
      const page = await browser.newPage();
      await page.setContent(invoiceHTML, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ 
        format: 'A4', 
        printBackground: true,
        margin: { top: '10px', right: '15px', bottom: '10px', left: '15px' }
      });
      await browser.close();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      // Fallback to HTML attachment if PDF generation fails
      console.log('Using HTML fallback for invoice attachment');
      pdfBuffer = Buffer.from(invoiceHTML, 'utf-8');
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'info@noblespeedytrac.com',
      to: user.email,
      subject: `Order Invoice - ${shipments.length} Shipments`,
      html: invoiceHTML,
      attachments: [
        {
          filename: `bulk-invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Bulk invoice email sent successfully:', info.messageId);
    
    // Update invoice email status for all shipments
    for (const shipment of shipments) {
      await dbHelpers.updateInvoiceEmailStatus(`${invoiceNumber}-${shipment.shipment_number}`, true);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error sending bulk invoice email:', error);
    return false;
  }
};

// Helper function to send status update email
const sendStatusUpdateEmail = async (packageData, newStatus, location, description) => {
  if (!transporter) {
    console.log('⚠️  Email transporter not configured. Skipping status update email.');
    return false;
  }

  try {
    // Get user information
    const user = await dbHelpers.getUserById(packageData.user_id);
    if (!user) {
      console.log('❌ User not found for status update email');
      return false;
    }

    const statusUpdateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Package Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 15px; background-color: #f5f5f5; }
          .email-container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .status-update { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
          .status-badge { display: inline-block; background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
          .package-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .tracking-link { color: #007bff; text-decoration: none; font-weight: bold; }
          .tracking-link:hover { text-decoration: underline; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .bottom-logo { text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
          .bottom-logo img { max-width: 120px; height: auto; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="company-name">Noble Speedy Trac</div>
            <div>Package Status Update</div>
          </div>
          
          <p>Dear ${user.username},</p>
          
          <p>Your package status has been updated:</p>
          
          <div class="status-update">
            <h3>New Status: <span class="status-badge">${newStatus}</span></h3>
            ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          </div>
          
          <div class="package-info">
            <h3>Package Details</h3>
            <div class="detail-row">
              <span class="detail-label">Tracking Number:</span>
              <span class="detail-value">${packageData.tracking_number}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Package ID:</span>
              <span class="detail-value">${packageData.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Status:</span>
              <span class="detail-value">${newStatus}</span>
            </div>
          </div>
          
          <p>Track your package at: <a href="https://www.noblespeedytrac.com/" class="tracking-link" target="_blank">https://www.noblespeedytrac.com/</a></p>
          
          <div class="footer">
            <p>Thank you for choosing Noble Speedy Trac!</p>
            <p>For any questions, please contact us at info@noblespeedytrac.com</p>
          </div>
          
          <div class="bottom-logo">
            <a href="https://www.noblespeedytrac.com/" target="_blank">
              <img src="https://www.noblespeedytrac.com/logo.png" alt="Noble Speedy Trac Logo" onerror="this.style.display='none'">
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'info@noblespeedytrac.com',
      to: user.email,
      subject: `Package Status Update - ${packageData.tracking_number}`,
      html: statusUpdateHTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Status update email sent successfully:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
    return false;
  }
};

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

    const token = jwt.sign({ 
      id: user.id, 
      username: user.username,
      role: user.role || 'client'
    }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role || 'client' // Include role with default fallback
      }
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
    const { origin_zip, destination_zip, weight, service_type, recipient_name, recipient_address, contact_number, price } = req.body;
    const user_id = req.user.id;

    if (!origin_zip || !destination_zip || !weight || !recipient_name || !recipient_address || !contact_number) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create shipment data
    const shipmentData = {
      user_id,
      customer: 'Custom Shipment',
      service_type: service_type || 'standard',
      service_type_label: service_type === 'express' ? 'Express' : service_type === 'overnight' ? 'Overnight' : 'Standard',
      recipient_name,
      recipient_address,
      contact_number,
      origin_postal: origin_zip,
      destination_postal: destination_zip,
      weight: parseFloat(weight),
      price: price || 0
    };

    // Use the database helper function to create shipment
    const createdShipment = await dbHelpers.createShipment(shipmentData);

    // Get user information for email
    const user = await dbHelpers.getUserById(user_id);
    
    // Send invoice email
    let emailSent = false;
    try {
      emailSent = await sendInvoiceEmail(createdShipment, user);
      
      if (emailSent) {
        console.log(`📧 Invoice email sent successfully for shipment ${createdShipment.shipment_number}`);
      } else {
        console.log(`❌ Invoice email failed for shipment ${createdShipment.shipment_number}`);
      }
    } catch (emailError) {
      console.error(`Failed to send email for shipment ${createdShipment.shipment_number}:`, emailError);
      emailSent = false;
    }

    res.status(201).json({
      message: 'Shipment created successfully',
      shipment: createdShipment,
      tracking_number: createdShipment.tracking_number,
      email_sent: emailSent
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

    // Get user information for email
    const user = await dbHelpers.getUserById(user_id);
    
    // Send bulk invoice email with all shipments
    let emailSent = false;
    try {
      emailSent = await sendBulkInvoiceEmail(createdShipments, user);
      
      if (emailSent) {
        console.log(`📧 Bulk invoice email sent successfully for ${createdShipments.length} shipments`);
      } else {
        console.log(`❌ Bulk invoice email failed for ${createdShipments.length} shipments`);
      }
    } catch (emailError) {
      console.error(`Failed to send bulk invoice email for ${createdShipments.length} shipments:`, emailError);
      emailSent = false;
    }

    console.log(`📦 ${createdShipments.length} shipments created successfully`);

    res.status(201).json({
      message: `${createdShipments.length} shipments created successfully`,
      shipments: createdShipments,
      email_sent: emailSent
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

// Admin: Get all packages (for admin console)
app.get('/api/admin/packages', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Check if user is admin (you can enhance this check)
    const user = await dbHelpers.getUserById(user_id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get all packages with tracking history for admin
    const { data: packages, error } = await supabase
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
        package_tracking_history (
          id,
          status,
          location,
          description,
          timestamp
        ),
        users (
          id,
          username,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(packages);
  } catch (error) {
    console.error('Admin get packages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get packages by status (for admin console)
app.get('/api/admin/packages/status/:status', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status } = req.params;
    
    // Check if user is admin
    const user = await dbHelpers.getUserById(user_id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get packages by status
    const { data: packages, error } = await supabase
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
        package_tracking_history (
          id,
          status,
          location,
          description,
          timestamp
        ),
        users (
          id,
          username,
          email,
          phone
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(packages);
  } catch (error) {
    console.error('Admin get packages by status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get order history (all shipments with package status)
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Check if user is admin
    const user = await dbHelpers.getUserById(user_id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get all shipments with their package status
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select(`
        *,
        packages (
          id,
          tracking_number,
          status,
          current_location,
          created_at
        ),
        users (
          id,
          username,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(shipments);
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get package statistics (for admin dashboard)
app.get('/api/admin/statistics', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Check if user is admin
    const user = await dbHelpers.getUserById(user_id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get package statistics
    const statistics = await dbHelpers.getPackageStatistics();
    
    res.json(statistics);
  } catch (error) {
    console.error('Admin get statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoints
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const users = await dbHelpers.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Update user in database
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/packages/:packageId', authenticateToken, async (req, res) => {
  try {
    const { packageId } = req.params;
    const packageData = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Get the current package data to check if status is changing
    const { data: currentPackage, error: currentError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();
    
    if (currentError) throw currentError;

    // Check if status was updated and send notification
    if (packageData.status && packageData.status !== currentPackage.status) {
      try {
        // Get package with user information for email
        const { data: packageWithUser, error: userError } = await supabase
          .from('packages')
          .select(`
            *,
            users (
              id,
              username,
              email
            )
          `)
          .eq('id', packageId)
          .single();
        
        if (!userError && packageWithUser && packageWithUser.users) {
          // Use updatePackageStatus function to properly handle tracking history
          const updateResult = await dbHelpers.updatePackageStatus(
            packageId, 
            packageData.status, 
            packageData.current_location || currentPackage.current_location,
            getStatusDescription(packageData.status, packageData.current_location || currentPackage.current_location)
          );
          
          // Send status update email
          const emailSent = await sendStatusUpdateEmail(
            packageWithUser, 
            packageData.status, 
            packageData.current_location || currentPackage.current_location, 
            getStatusDescription(packageData.status, packageData.current_location || currentPackage.current_location)
          );
          
          if (emailSent) {
            console.log(`📧 Status update email sent successfully for package ${packageWithUser.tracking_number}`);
            // Log the email notification in database
            try {
              await dbHelpers.createStatusUpdateEmailLog(packageWithUser.id, packageWithUser.user_id, packageData.status, true);
            } catch (logError) {
              console.log('⚠️  Could not log status update email (table may not exist):', logError.message);
            }
          } else {
            console.log(`❌ Status update email failed for package ${packageWithUser.tracking_number}`);
            // Log the failed email notification in database
            try {
              await dbHelpers.createStatusUpdateEmailLog(packageWithUser.id, packageWithUser.user_id, packageData.status, false);
            } catch (logError) {
              console.log('⚠️  Could not log failed status update email (table may not exist):', logError.message);
            }
          }
          
          res.json({
            ...updateResult.package,
            notification_sent: emailSent,
            tracking_history_updated: true
          });
          return;
        }
      } catch (emailError) {
        console.error(`Failed to send status update email for package ${currentPackage.tracking_number}:`, emailError);
        // Log the failed email notification in database
        try {
          await dbHelpers.createStatusUpdateEmailLog(currentPackage.id, currentPackage.user_id, packageData.status, false);
        } catch (logError) {
          console.log('⚠️  Could not log failed status update email (table may not exist):', logError.message);
        }
      }
    }

    // If only location is being updated (no status change), update directly
    if (packageData.current_location && packageData.current_location !== currentPackage.current_location) {
      const updateResult = await dbHelpers.updatePackageLocation(
        packageId,
        packageData.current_location,
        `Package location updated to ${packageData.current_location}`
      );
      
      res.json({
        ...updateResult.package,
        notification_sent: false,
        tracking_history_updated: true
      });
      return;
    }

    // For other updates (non-status, non-location), update directly
    const { data, error } = await supabase
      .from('packages')
      .update(packageData)
      .eq('id', packageId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      ...data,
      notification_sent: false,
      tracking_history_updated: false
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const stats = await dbHelpers.getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's invoices
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const invoices = await dbHelpers.getInvoicesByUserId(user_id);
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific invoice by invoice number
app.get('/api/invoices/:invoiceNumber', async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    
    if (!invoiceNumber) {
      return res.status(400).json({ error: 'Invoice number is required' });
    }

    const invoice = await dbHelpers.getInvoiceByNumber(invoiceNumber);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
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
    
    // Send status update email to package owner
    let emailSent = false;
    try {
      emailSent = await sendStatusUpdateEmail(packageData, status, location, description);
      
      if (emailSent) {
        console.log(`📧 Status update email sent successfully for package ${packageData.tracking_number}`);
        // Log the email notification in database
        try {
          await dbHelpers.createStatusUpdateEmailLog(packageData.id, packageData.user_id, status, true);
        } catch (logError) {
          console.log('⚠️  Could not log status update email (table may not exist):', logError.message);
        }
      } else {
        console.log(`❌ Status update email failed for package ${packageData.tracking_number}`);
        // Log the failed email notification in database
        try {
          await dbHelpers.createStatusUpdateEmailLog(packageData.id, packageData.user_id, status, false);
        } catch (logError) {
          console.log('⚠️  Could not log failed status update email (table may not exist):', logError.message);
        }
      }
    } catch (emailError) {
      console.error(`Failed to send status update email for package ${packageData.tracking_number}:`, emailError);
      emailSent = false;
      // Log the failed email notification in database
      try {
        await dbHelpers.createStatusUpdateEmailLog(packageData.id, packageData.user_id, status, false);
      } catch (logError) {
        console.log('⚠️  Could not log failed status update email (table may not exist):', logError.message);
      }
    }
    
    res.json({
      message: 'Package status updated successfully',
      package: result.package,
      history: result.history,
       email_sent: emailSent
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