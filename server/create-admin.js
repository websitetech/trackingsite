import bcrypt from 'bcryptjs';
import { dbHelpers } from './supabase.js';

async function createAdminUser() {
  try {
    const adminData = {
      username: 'admin',
      email: 'admin@noblespeedytrac.com',
      password: await bcrypt.hash('admin123', 10),
      email_verified: true,
      phone: '+14378702022',
      state_province: 'Ontario',
      postal_code: 'M1J1Z8',
      role: 'admin'
    };

    const admin = await dbHelpers.createUser(adminData);
    console.log('✅ Admin user created successfully:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });
    console.log('🔑 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      console.log('⚠️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

createAdminUser(); 