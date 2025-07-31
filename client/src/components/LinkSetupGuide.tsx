import React from 'react';

const LinkSetupGuide: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🔗 Set Up Interac e-Transfer (Link)</h1>
      
      <div className="space-y-6">
        {/* What is Link */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">What is Link?</h2>
          <p className="text-blue-700 text-sm">
            Link is Stripe's Interac e-Transfer integration that allows you to pay instantly using your Canadian bank account. 
            Once set up, you can checkout with just one click!
          </p>
        </div>

        {/* Step 1 */}
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Create a Stripe Account</h3>
          <p className="text-gray-600 text-sm mb-3">
            You need a personal Stripe account to use Link payments.
          </p>
          <ol className="text-sm text-gray-600 space-y-1 ml-4">
            <li>1. Go to <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">stripe.com</a></li>
            <li>2. Click "Sign up" or "Create account"</li>
            <li>3. Enter your email address and create a password</li>
            <li>4. Verify your email address</li>
          </ol>
          <button 
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            onClick={() => window.open('https://stripe.com', '_blank')}
          >
            Create Stripe Account
          </button>
        </div>

        {/* Step 2 */}
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 2: Add Your Canadian Bank Account</h3>
          <p className="text-gray-600 text-sm mb-3">
            Once logged into your Stripe account, add your Canadian bank account details.
          </p>
          <ol className="text-sm text-gray-600 space-y-1 ml-4">
            <li>1. Go to "Payment methods" in your Stripe dashboard</li>
            <li>2. Click "Add bank account"</li>
            <li>3. Select "Canada" as your country</li>
            <li>4. Enter your bank details:</li>
          </ol>
          <div className="ml-4 mt-2 p-3 bg-gray-50 rounded text-sm">
            <p><strong>Bank Name:</strong> Your bank name (e.g., RBC, TD, BMO)</p>
            <p><strong>Account Number:</strong> Your bank account number</p>
            <p><strong>Transit Number:</strong> 5-digit transit number</p>
            <p><strong>Institution Number:</strong> 3-digit institution number</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 3: Verify Your Bank Account</h3>
          <p className="text-gray-600 text-sm mb-3">
            Stripe will verify your bank account by sending small test deposits.
          </p>
          <ol className="text-sm text-gray-600 space-y-1 ml-4">
            <li>1. Stripe will send 2 small deposits to your bank account</li>
            <li>2. Check your bank statement or online banking</li>
            <li>3. Enter the exact amounts in your Stripe dashboard</li>
            <li>4. Your bank account will be verified and activated</li>
          </ol>
          <div className="ml-4 mt-2 p-3 bg-yellow-50 rounded text-sm">
            <p className="text-yellow-800">
              <strong>Note:</strong> The verification deposits are usually less than $1 each and may take 1-2 business days to appear.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 4: Use Link for Payments</h3>
          <p className="text-gray-600 text-sm mb-3">
            Once verified, Link will appear as a main payment option on our checkout page.
          </p>
          <div className="ml-4 p-3 bg-green-50 rounded text-sm">
            <p className="text-green-800">
              <strong>Benefits:</strong> Faster checkout, no need to enter card details, secure bank-to-bank transfers.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Frequently Asked Questions</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Is Link secure?</p>
              <p className="text-gray-600">Yes, Link uses bank-level security and encryption. Your bank details are never shared with merchants.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">How long does verification take?</p>
              <p className="text-gray-600">Bank account verification typically takes 1-2 business days for the deposits to appear.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Can I use Link with any Canadian bank?</p>
              <p className="text-gray-600">Link works with most major Canadian banks and credit unions.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Is there a fee to use Link?</p>
              <p className="text-gray-600">No, there are no fees for customers to use Link. It's free to set up and use.</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help?</h3>
          <p className="text-blue-700 text-sm mb-3">
            If you have trouble setting up Link, contact Stripe support or our customer service.
          </p>
          <div className="space-x-4">
            <a 
              href="https://support.stripe.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Stripe Support
            </a>
            <button className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkSetupGuide; 