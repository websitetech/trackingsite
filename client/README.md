# Tracking Website

A modern package tracking website built with React, TypeScript, and Supabase.

## Features

- 🔐 User authentication with email verification
- 📦 Package tracking and management
- 💰 Shipping cost estimation
- 💳 Payment processing interface
- 📱 Responsive design
- ⚡ Real-time updates with Supabase

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with email verification
- **Icons**: React Icons

## Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trackingsite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-secret-key
   ```

4. **Set up database schema**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and run the contents of `backend/schema.sql`

5. **Start the development server**
   ```bash
   npm run dev:full
   ```

## Available Scripts

- `npm run dev` - Start frontend only
- `npm run server` - Start backend only
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
trackingsite/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   └── assets/        # Static assets
├── backend/
│   ├── server.js      # Express server
│   ├── supabase.js    # Supabase configuration
│   └── schema.sql     # Database schema
└── public/            # Public assets
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/verify-email` - Email verification

### Tracking
- `POST /api/track` - Track package
- `POST /api/estimate` - Get shipping estimate
- `POST /api/ship` - Create new shipment

### User Data
- `GET /api/packages` - Get user's packages
- `GET /api/estimates` - Get shipping estimates history

## Database Schema

### Tables
- **users** - User accounts and authentication
- **packages** - Shipment tracking data
- **shipping_estimates** - Cost estimates history

## Deployment

### Frontend
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages

### Backend
The backend can be deployed to:
- Railway
- Heroku
- DigitalOcean App Platform

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |
| `SMTP_HOST` | SMTP server for emails | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASS` | SMTP password | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
