import bcrypt from 'bcryptjs';
import { supabase } from './supabase.js';

async function updateAdminPassword() {
  try {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin user password
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('username', 'admin')
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }

    console.log('✅ Admin password updated successfully');
    console.log('🔑 New credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: admin');

    // Verify the password works
    const isValidPassword = await bcrypt.compare(newPassword, hashedPassword);
    console.log('✅ Password verification test:', isValidPassword ? 'PASSED' : 'FAILED');

  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  }
}

updateAdminPassword(); 