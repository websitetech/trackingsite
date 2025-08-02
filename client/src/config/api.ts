import { environment } from './environment';

// API configuration
export const apiConfig = {
  baseURL: environment.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Export the base URL for direct use if needed
export const API_BASE_URL = environment.apiUrl; 