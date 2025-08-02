# API Configuration

This directory contains the centralized API configuration for the frontend application.

## Files

- `api.ts` - Main API configuration with environment-based base URL
- `../utils/apiUtils.ts` - Utility functions for API requests
- `../services/api.ts` - API service functions using the configuration

## Configuration

### Environment Variables

The API base URL can be configured using environment variables:

```bash
# Development (default)
VITE_API_BASE_URL=http://localhost:5000/api

# Production
VITE_API_BASE_URL=https://your-production-domain.com/api

# Staging
VITE_API_BASE_URL=https://staging.your-domain.com/api
```

### Environment Files

Create the following files in the `client/` directory:

#### `.env.local` (for local development)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

#### `.env.production` (for production builds)
```bash
VITE_API_BASE_URL=https://your-production-domain.com/api
```

#### `.env.development` (for development builds)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## Usage

### Basic Usage

```typescript
import { API_BASE_URL } from '../config/api';

// Use the configured base URL
const url = `${API_BASE_URL}/users`;
```

### Using API Utilities

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiUtils';

// GET request (public)
const users = await apiGet('/users');

// GET request (authenticated)
const userProfile = await apiGet('/profile', true);

// POST request (public)
const newUser = await apiPost('/register', { username: 'john', email: 'john@example.com' });

// POST request (authenticated)
const newPost = await apiPost('/posts', { title: 'Hello', content: 'World' }, true);

// PUT request (authenticated)
const updatedUser = await apiPut('/users/123', { name: 'John Doe' }, true);

// DELETE request (authenticated)
await apiDelete('/users/123', true);
```

### Using API Services

```typescript
import { authAPI, cartAPI } from '../services/api';

// Authentication
const user = await authAPI.login({ username: 'john', password: 'password' });

// Cart operations
const cartItems = await cartAPI.getCart();
await cartAPI.addToCart(cartItem);
```

## Environment Detection

The configuration automatically detects the environment:

```typescript
import { isDevelopment, isProduction, isTest } from '../config/api';

if (isDevelopment) {
  console.log('Running in development mode');
}

if (isProduction) {
  console.log('Running in production mode');
}
```

## Benefits

1. **Centralized Configuration** - All API URLs are managed in one place
2. **Environment Flexibility** - Easy switching between development, staging, and production
3. **Type Safety** - Full TypeScript support
4. **Consistent Error Handling** - Standardized error handling across all API calls
5. **Authentication Support** - Built-in token management
6. **Utility Functions** - Helper functions for common API operations

## Migration from Hardcoded URLs

If you have existing code with hardcoded URLs, replace them:

```typescript
// Before
const response = await fetch('http://localhost:5000/api/users');

// After
import { apiGet } from '../utils/apiUtils';
const users = await apiGet('/users');
```

## Troubleshooting

### Common Issues

1. **CORS Errors** - Ensure your backend allows requests from your frontend domain
2. **Environment Variables Not Loading** - Make sure to restart your development server after adding environment variables
3. **Authentication Errors** - Check that tokens are being stored and sent correctly

### Debug Mode

In development, the configuration is logged to the console:

```
🔧 API Configuration: {
  baseURL: "http://localhost:5000/api",
  environment: "development",
  customBaseURL: "not set"
}
``` 