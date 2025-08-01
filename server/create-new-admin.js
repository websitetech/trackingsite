import bcrypt from 'bcryptjs';
import { dbHelpers } from './supabase.js';

async function createNewAdminUser() {
  try {
    const adminData = {
      username: 'adminuser',
      email: 'adminuser@noblespeedytrac.com',
      password: await bcrypt.hash('password123', 10),
      email_verified: true,
      phone: '+14378702022',
      state_province: 'Ontario',
      postal_code: 'M1J1Z8',
      role: 'admin'
    };

    const admin = await dbHelpers.createUser(adminData);
    console.log('✅ New admin user created successfully:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });
    console.log('🔑 Login credentials:');
    console.log('   Username: adminuser');
    console.log('   Password: password123');
    console.log('   Role: admin');
    
  } catch (error) {
    if (error.code === '23505') {
      console.log('❌ Admin user already exists with username: adminuser');
      console.log('🔑 Try these credentials:');
      console.log('   Username: adminuser');
      console.log('   Password: password123');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

createNewAdminUser(); 