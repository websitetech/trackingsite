import bcrypt from 'bcryptjs';
import { dbHelpers } from './supabase.js';

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login process...\n');

    // Test the new admin user
    const admin = await dbHelpers.getUserByUsername('adminuser');
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      email_verified: admin.email_verified
    });

    // Test password verification
    const password = 'password123';
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    console.log('\\n🔑 Password verification:', {
      password,
      isValidPassword,
      hashedPassword: admin.password.substring(0, 20) + '...'
    });

    if (isValidPassword) {
      console.log('✅ Password is correct');
    } else {
      console.log('❌ Password is incorrect');
    }

    if (admin.role === 'admin') {
      console.log('✅ User has admin role');
    } else {
      console.log('❌ User does not have admin role');
    }

    if (admin.email_verified) {
      console.log('✅ Email is verified');
    } else {
      console.log('❌ Email is not verified');
    }

    console.log('\\n📋 Login Summary:');
    console.log('   Username: adminuser');
    console.log('   Password: password123');
    console.log('   Role: ' + admin.role);
    console.log('   Email Verified: ' + admin.email_verified);
    console.log('   Password Valid: ' + isValidPassword);
    
    if (isValidPassword && admin.role === 'admin' && admin.email_verified) {
      console.log('\\n✅ Admin login should work!');
    } else {
      console.log('\\n❌ Admin login will fail - check the issues above');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
}

testAdminLogin(); 