import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51RmVWcI6ptZDqevNhSL1cOkv17IoYm5on5h04IjeWMYUAHk7HPf3TOjEJ2iHmPXO8T03xhvyn8VUBl2A8Tc8Etyt008ngbrspU');

function StripeCheckout({ estimatedValue = 293 }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Create PaymentIntent on backend
      const res = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: estimatedValue, currency: 'usd' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create payment intent');
      const clientSecret = data.clientSecret;

      // 2. Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Pay with Card</h2>
      <CardElement className="mb-4 p-2 border rounded" />
      <button type="submit" disabled={!stripe || loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors shadow">
        {loading ? 'Processing...' : `Pay $${estimatedValue}`}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">Payment successful!</div>}
    </form>
  );
}

export default function PaymentMethod({ estimatedValue = 293 }) {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckout estimatedValue={estimatedValue} />
    </Elements>
  );
} 