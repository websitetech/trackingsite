# PackageTracker - Full-Stack Shipping Application

A modern web application for package tracking, shipping estimates, and customer management built with React, Node.js, Express, and SQLite.

## Features

- **Package Tracking**: Track packages using tracking number and zip code
- **User Authentication**: Register and login with JWT authentication
- **Shipping Estimates**: Get cost estimates for different service types
- **Shipment Creation**: Create new shipments with tracking numbers
- **Customer Management**: Register new customers
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Modern CSS with responsive design

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

## Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

## Installation

1. **Clone or download the project**
   ```bash
   # If you have the project files, navigate to the project directory
   cd trackingsite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run server
   ```
   This will start the Express server on port 5000.

4. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run dev
   ```
   This will start the React development server on port 5173.

5. **Or run both simultaneously**
   ```bash
   npm run dev:full
   ```

## Usage

### 1. Package Tracking
- Enter a tracking number and zip code
- Click "Track Package" to see package status and location

### 2. User Registration/Login
- Click "Register" to create a new account
- Click "Login" to access your account
- Once logged in, you can create shipments

### 3. Shipping Estimates
- Click "Estimate Cost" button
- Enter origin and destination zip codes, weight, and service type
- Get instant cost estimates

### 4. Create Shipments
- Click "Ship Now" button (requires login)
- Fill in shipment details including recipient information
- Get a tracking number for your new shipment

### 5. New Customer Registration
- Click "New Customer" button
- Fill in customer information form
- Submit to register a new customer

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Package Operations
- `POST /api/track` - Track package
- `POST /api/estimate` - Get shipping estimate
- `POST /api/ship` - Create new shipment (requires auth)
- `GET /api/packages` - Get user's packages (requires auth)
- `GET /api/estimates` - Get shipping estimates history

### Health Check
- `GET /api/health` - Server health status

## Database Schema

The application uses SQLite with the following tables:

### Users
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password (hashed)
- created_at

### Packages
- id (PRIMARY KEY)
- tracking_number (UNIQUE)
- user_id (FOREIGN KEY)
- status
- origin_zip
- destination_zip
- weight
- created_at

### Shipping Estimates
- id (PRIMARY KEY)
- origin_zip
- destination_zip
- weight
- service_type
- estimated_cost
- estimated_days
- created_at

## Project Structure

```
trackingsite/
├── backend/
│   └── server.js          # Express server
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── TrackingForm.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── LoginModal.tsx
│   │   ├── RegisterModal.tsx
│   │   ├── EstimateModal.tsx
│   │   ├── ShipModal.tsx
│   │   └── NewCustomerModal.tsx
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── package.json
└── README.md
```

## Development

### Available Scripts
- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables
Create a `.env` file in the root directory for custom configuration:
```
PORT=5000
JWT_SECRET=your-secret-key-here
```

## Features in Detail

### Package Tracking
- Simulates real-time package tracking
- Shows status, location, and estimated delivery
- Displays tracking history

### Shipping Estimates
- Calculates costs based on distance, weight, and service type
- Supports Standard, Express, and Overnight services
- Stores estimate history in database

### User Authentication
- Secure password hashing with bcryptjs
- JWT token-based authentication
- Session persistence with localStorage

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Modern UI with smooth animations

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in the `.env` file or kill the process using the port

2. **Database errors**
   - The SQLite database is created automatically when the server starts
   - Check file permissions in the backend directory

3. **CORS errors**
   - The backend has CORS enabled for development
   - Ensure the frontend is running on the correct port

4. **Authentication issues**
   - Clear localStorage and try logging in again
   - Check that the JWT_SECRET is set

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
