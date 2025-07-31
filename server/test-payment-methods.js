import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testPaymentMethods() {
  try {
    console.log('🔍 Testing Stripe Account Capabilities...\n');

    // Test 1: Check account details
    const account = await stripe.accounts.retrieve();
    console.log('📋 Account Details:');
    console.log('- Country:', account.country);
    console.log('- Charges Enabled:', account.charges_enabled);
    console.log('- Payouts Enabled:', account.payouts_enabled);
    console.log('- Capabilities:', account.capabilities);
    console.log('');

    // Test 2: Create payment intent with automatic methods
    console.log('💳 Creating Payment Intent with Automatic Methods...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00 CAD
      currency: 'cad',
      automatic_payment_methods: { enabled: true },
    });
    
    console.log('✅ Payment Intent Created:');
    console.log('- ID:', paymentIntent.id);
    console.log('- Amount:', paymentIntent.amount);
    console.log('- Currency:', paymentIntent.currency);
    console.log('- Payment Method Types:', paymentIntent.payment_method_types);
    console.log('');

    // Test 3: Check what payment methods are available
    console.log('🔧 Available Payment Methods:');
    
    // Check if Link is available
    try {
      const linkTest = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'cad',
        payment_method_types: ['link'],
      });
      console.log('✅ Link (Interac e-Transfer): AVAILABLE');
    } catch (error) {
      console.log('❌ Link (Interac e-Transfer): NOT AVAILABLE -', error.message);
    }

    // Check if US bank accounts are available
    try {
      const bankTest = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'cad',
        payment_method_types: ['us_bank_account'],
      });
      console.log('✅ US Bank Account: AVAILABLE');
    } catch (error) {
      console.log('❌ US Bank Account: NOT AVAILABLE -', error.message);
    }

    // Check if cards are available
    try {
      const cardTest = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'cad',
        payment_method_types: ['card'],
      });
      console.log('✅ Cards: AVAILABLE');
    } catch (error) {
      console.log('❌ Cards: NOT AVAILABLE -', error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('Your Stripe account supports:', paymentIntent.payment_method_types.join(', '));
    
    if (paymentIntent.payment_method_types.includes('link')) {
      console.log('✅ Interac e-Transfer (Link) should be visible in Payment Element');
    } else {
      console.log('❌ Interac e-Transfer (Link) is not available - check Stripe Dashboard');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', {
      type: error.type,
      code: error.code,
      param: error.param
    });
  }
}

testPaymentMethods(); 