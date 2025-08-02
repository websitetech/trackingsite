// Environment configuration
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RmVWcI6ptZDqevNhSL1cOkv17IoYm5on5h04IjeWMYUAHk7HPf3TOjEJ2iHmPXO8T03xhvyn8VUBl2A8Tc8Etyt008ngbrspU';

export const environment = {
  apiUrl: apiUrl,
  stripePublishableKey: stripePublishableKey
}; 