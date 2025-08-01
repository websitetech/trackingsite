import bcrypt from 'bcryptjs';
import { dbHelpers } from './supabase.js';

async function checkAdminUser() {
  try {
    // Get admin user by username
    const admin = await dbHelpers.getUserByUsername('admin');
    
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
    const testPassword = 'admin123';
    const isValidPassword = await bcrypt.compare(testPassword, admin.password);
    
    console.log('🔑 Password verification:', {
      testPassword,
      isValidPassword,
      hashedPassword: admin.password.substring(0, 20) + '...'
    });

    if (isValidPassword) {
      console.log('✅ Password is correct');
    } else {
      console.log('❌ Password is incorrect');
    }

    // Check if email is verified
    if (admin.email_verified) {
      console.log('✅ Email is verified');
    } else {
      console.log('❌ Email is NOT verified - this will prevent login');
    }

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  }
}

checkAdminUser(); 