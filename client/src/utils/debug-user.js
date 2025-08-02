// Debug utility for checking user login status
export function debugCurrentUser() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return {
      isLoggedIn: false,
      message: 'No token or user data found'
    };
  }
  
  try {
    const user = JSON.parse(userStr);
    const isOnAdminRoute = window.location.pathname.includes('/admin');
    
    return {
      isLoggedIn: true,
      user: user,
      isAdmin: user.role === 'admin',
      isOnAdminRoute: isOnAdminRoute,
      token: token ? 'Present' : 'Missing'
    };
  } catch (error) {
    return {
      isLoggedIn: false,
      message: 'Error parsing user data',
      error: error.message
    };
  }
}

// Auto-run debug function when this module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  const debugInfo = debugCurrentUser();
  // Debug info is available but not logged to console
} 