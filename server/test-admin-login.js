import bcrypt from 'bcryptjs';
import { dbHelpers } from './supabase.js';

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login process...\n');

    // Step 1: Get admin user from database
    const admin = await dbHelpers.getUserByUsername('admin');
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found in database:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      email_verified: admin.email_verified
    });

    // Step 2: Test password verification
    const password = 'admin123';
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    console.log('\n🔑 Password verification:', {
      password,
      isValidPassword
    });

    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      return;
    }

    // Step 3: Simulate the login response (what the server should return)
    const loginResponse = {
      message: 'Login successful',
      token: 'mock-token',
      user: { 
        id: admin.id, 
        username: admin.username, 
        email: admin.email, 
        role: admin.role 
      }
    };

    console.log('\n📤 Login response (what server should return):', loginResponse);

    // Step 4: Check if role is present
    if (loginResponse.user.role === 'admin') {
      console.log('✅ Role field is present and correct: admin');
    } else {
      console.log('❌ Role field is missing or incorrect:', loginResponse.user.role);
    }

    // Step 5: Test admin access check
    const hasAdminAccess = loginResponse.user && loginResponse.user.role === 'admin';
    console.log('\n🔐 Admin access check:', hasAdminAccess ? 'GRANTED' : 'DENIED');

    if (hasAdminAccess) {
      console.log('✅ Admin access should work correctly');
    } else {
      console.log('❌ Admin access will be denied');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
}

testAdminLogin(); 