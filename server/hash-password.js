import bcrypt from 'bcryptjs';

// Function to hash a password
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully!');
    console.log('🔑 Original password:', password);
    console.log('🔒 Hashed password:', hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    throw error;
  }
};

// Function to verify a password
const verifyPassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('🔍 Password verification result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ Error verifying password:', error);
    throw error;
  }
};

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('❌ Please provide a password to hash');
  console.log('Usage: node hash-password.js "your-password"');
  process.exit(1);
}

// Hash the password
hashPassword(password)
  .then((hashedPassword) => {
    console.log('\n📋 Copy this hashed password to update your database:');
    console.log('='.repeat(50));
    console.log(hashedPassword);
    console.log('='.repeat(50));
    
    // Test verification
    console.log('\n🧪 Testing password verification...');
    return verifyPassword(password, hashedPassword);
  })
  .then((isValid) => {
    if (isValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
    }
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 