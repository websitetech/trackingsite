import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51RmVWcI6ptZDqevNhSL1cOkv17IoYm5on5h04IjeWMYUAHk7HPf3TOjEJ2iHmPXO8T03xhvyn8VUBl2A8Tc8Etyt008ngbrspU');

function StripePaymentElementForm({ clientSecret, estimatedValue = 293 }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });
    if (stripeError) setError(stripeError.message);
    else if (paymentIntent && paymentIntent.status === 'succeeded') setSuccess(true);
    setLoading(false);
  };

  return (
    <form onSubmit={handlePay} className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold text-red-700 mb-2 text-center tracking-tight">Pay with Card or Other Method</h2>
      <div className="estimate-row flex justify-between items-center py-3 px-0 border-b border-gray-100 font-semibold text-base mb-2">
        <span className="text-gray-700">Amount Due:</span>
        <span className="text-2xl font-extrabold text-red-700 tracking-tight">${Number(estimatedValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="mb-4">
        <PaymentElement />
      </div>
      <button type="submit" disabled={!stripe || loading} className="track-btn btn btn-primary mt-2 mb-2 py-3 px-6">
        {loading ? 'Processing...' : `Pay $${Number(estimatedValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
      </button>
      {error && <div className="error-message mt-2">{error}</div>}
      {success && <div className="success-message mt-2"><h3>Payment successful!</h3></div>}
    </form>
  );
}

export default function PaymentMethod({ estimatedValue = 293 }:any) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchClientSecret() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://trackingsite.onrender.com/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: estimatedValue, currency: 'usd' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create payment intent');
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message || 'Failed to load payment form');
      } finally {
        setLoading(false);
      }
    }
    fetchClientSecret();
  }, [estimatedValue]);

  if (loading) return <div className="text-center py-8">Loading payment form...</div>;
  if (error) return <div className="error-message mt-2">{error}</div>;
  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentElementForm clientSecret={clientSecret} estimatedValue={estimatedValue} />
    </Elements>
  );
} 