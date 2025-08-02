// Test script for email functionality
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testEmailFunctionality() {
  console.log('🧪 Testing Email Functionality...\n');

  try {
    // Test 1: Test payment confirmation email
    console.log('📧 Testing Payment Confirmation Email...');
    const paymentEmailResponse = await fetch(`${API_BASE_URL}/dev/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        type: 'payment'
      })
    });

    const paymentEmailResult = await paymentEmailResponse.json();
    console.log('✅ Payment Email Test Result:', paymentEmailResult);

    // Test 2: Test shipment confirmation email
    console.log('\n📦 Testing Shipment Confirmation Email...');
    const shipmentEmailResponse = await fetch(`${API_BASE_URL}/dev/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        type: 'shipment'
      })
    });

    const shipmentEmailResult = await shipmentEmailResponse.json();
    console.log('✅ Shipment Email Test Result:', shipmentEmailResult);

    console.log('\n🎉 Email functionality tests completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Configure your SMTP settings in .env file');
    console.log('2. Set up Stripe webhook endpoint in your Stripe dashboard');
    console.log('3. Test with real payments to see email notifications');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmailFunctionality(); 