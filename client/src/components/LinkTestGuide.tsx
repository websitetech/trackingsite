import React from 'react';

const LinkTestGuide: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🧪 Test Link (Interac e-Transfer)</h1>
      
      <div className="space-y-6">
        {/* Test Mode Notice */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Test Mode Active</h2>
          <p className="text-yellow-700 text-sm">
            You're currently in test mode. No real money will be charged. Use test credentials below.
          </p>
        </div>

        {/* Test Customer Setup */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Create Test Customer Account</h3>
          <p className="text-gray-600 text-sm mb-3">
            Create a separate Stripe account to simulate a customer.
          </p>
          <ol className="text-sm text-gray-600 space-y-1 ml-4">
            <li>1. Go to <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">stripe.com</a></li>
            <li>2. Click "Sign up" with a different email</li>
            <li>3. This will be your "customer" account</li>
            <li>4. Verify your email</li>
          </ol>
        </div>

        {/* Test Bank Account */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 2: Add Test Bank Account</h3>
          <p className="text-gray-600 text-sm mb-3">
            Use these test credentials to add a bank account.
          </p>
          <div className="ml-4 p-3 bg-gray-50 rounded text-sm">
            <p><strong>Bank Name:</strong> Royal Bank of Canada (or any Canadian bank)</p>
            <p><strong>Account Number:</strong> <code className="bg-gray-200 px-1 rounded">000123456789</code></p>
            <p><strong>Transit Number:</strong> <code className="bg-gray-200 px-1 rounded">12345</code></p>
            <p><strong>Institution Number:</strong> <code className="bg-gray-200 px-1 rounded">003</code></p>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-4">
            Note: These are test credentials. No real bank account needed.
          </p>
        </div>

        {/* Test Verification */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 3: Test Bank Verification</h3>
          <p className="text-gray-600 text-sm mb-3">
            In test mode, verification is instant.
          </p>
          <div className="ml-4 p-3 bg-green-50 rounded text-sm">
            <p className="text-green-800">
              <strong>Test Mode:</strong> Bank account verification is automatic. No real deposits needed.
            </p>
          </div>
        </div>

        {/* Test Payment */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 4: Test Link Payment</h3>
          <p className="text-gray-600 text-sm mb-3">
            Now test the complete payment flow.
          </p>
          <ol className="text-sm text-gray-600 space-y-1 ml-4">
            <li>1. Go to your app's checkout page</li>
            <li>2. Add items to cart</li>
            <li>3. Look for Link tab (should be prominent now)</li>
            <li>4. Select your test bank account</li>
            <li>5. Complete the payment</li>
            <li>6. Verify shipment creation</li>
          </ol>
        </div>

        {/* Test Data */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Data</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Test Amount:</strong> $39.50 (or any amount)</p>
            <p><strong>Test Currency:</strong> CAD</p>
            <p><strong>Test Country:</strong> Canada</p>
            <p><strong>Expected Result:</strong> Payment succeeds, shipment created</p>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Troubleshooting</h3>
          <div className="text-sm text-red-700 space-y-2">
            <p><strong>Link not showing:</strong> Make sure you're logged into your test customer account</p>
            <p><strong>Payment fails:</strong> Check browser console for errors</p>
            <p><strong>Bank verification fails:</strong> Use the exact test credentials above</p>
            <p><strong>No shipment created:</strong> Check server logs for API errors</p>
          </div>
        </div>

        {/* Switch to Production */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Ready for Production?</h3>
          <p className="text-green-700 text-sm mb-3">
            Once testing is complete, switch back to production keys.
          </p>
          <div className="text-xs text-green-600">
            <p>1. Change <code className="bg-green-200 px-1 rounded">pk_test_</code> back to <code className="bg-green-200 px-1 rounded">pk_live_</code></p>
            <p>2. Update server environment variables</p>
            <p>3. Test with real customers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkTestGuide; 