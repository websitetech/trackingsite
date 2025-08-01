// Debug utility to check current user login status
export function debugCurrentUser() {
  console.log('🔍 Debugging current user login status...');
  
  // Check localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  console.log('Token exists:', !!token);
  console.log('User data exists:', !!userStr);
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('Current user data:', user);
      console.log('User role:', user.role);
      console.log('Is admin?', user.role === 'admin');
    } catch (error) {
      console.log('Error parsing user data:', error);
    }
  }
  
  // Check if we're on admin route
  const isOnAdminRoute = window.location.pathname === '/admin';
  console.log('On admin route:', isOnAdminRoute);
  
  return {
    hasToken: !!token,
    hasUser: !!userStr,
    user: userStr ? JSON.parse(userStr) : null,
    isOnAdminRoute
  };
}

// Run debug in console
if (typeof window !== 'undefined') {
  window.debugCurrentUser = debugCurrentUser;
  console.log('💡 Run debugCurrentUser() in console to check login status');
} 