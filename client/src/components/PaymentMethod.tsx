import  { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { shipmentAPI, paymentAPI } from '../services/api';

const stripePromise = loadStripe('pk_test_51RmVWcI6ptZDqevNhSL1cOkv17IoYm5on5h04IjeWMYUAHk7HPf3TOjEJ2iHmPXO8T03xhvyn8VUBl2A8Tc8Etyt008ngbrspU');

function StripePaymentElementForm({ estimatedValue = 293, fromCart = false, singleShipmentData = null }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const { state: cartState, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const createShipments = async () => {
    if (!fromCart || cartState.items.length === 0) return;

    try {
      // Prepare shipments data for bulk creation
      const shipmentsData = cartState.items.map(item => ({
        customer: item.customer,
        service_type: item.serviceType,
        service_type_label: item.serviceTypeLabel || '',
        recipient_name: item.recipientName,
        recipient_address: item.recipientAddress,
        contact_number: item.contactNumber,
        origin_postal: item.originPostal || '',
        destination_postal: item.destinationPostal || '',
        weight: item.weight || 1,
        price: item.price
      }));

      // Create all shipments in bulk using the new API
      await shipmentAPI.createBulkShipments(shipmentsData);
      
      // Clear cart after successful creation
      await clearCart();
      
      // Navigate to success page
      navigate('/payment-success', { 
        state: { 
          fromCart: true, 
          shipmentCount: cartState.items.length,
          totalAmount: cartState.total 
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create shipments');
    }
  };

  const createSingleShipment = async () => {
    if (!singleShipmentData) return;

    try {
      // Create single shipment using the API
      const shipmentResult = await shipmentAPI.createShipment(singleShipmentData);
      
      // Navigate to success page with shipment details
      navigate('/payment-success', { 
        state: { 
          fromCart: false, 
          shipmentCount: 1,
          totalAmount: estimatedValue,
          shipmentNumber: shipmentResult.shipment_number,
          trackingNumber: shipmentResult.tracking_number
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create shipment');
    }
  };

  const handlePay = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }
    const { error: stripeError, paymentIntent }: any = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });
    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSuccess(true);
      // If payment is successful and it's from cart, create shipments
      if (fromCart) {
        await createShipments();
      } else if (singleShipmentData) {
        // For single shipment, create the shipment
        await createSingleShipment();
      } else {
        // For single shipment without data, navigate to success page
        navigate('/payment-success', { 
          state: { 
            fromCart: false, 
            shipmentCount: 1,
            totalAmount: estimatedValue 
          } 
        });
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handlePay} className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold text-red-700 mb-2 text-center tracking-tight">
        {fromCart ? 'Pay for Cart' : 'Pay with Card or Other Method'}
      </h2>
      <div className="estimate-row flex justify-between items-center py-3 px-0 border-b border-gray-100 font-semibold text-base mb-2">
        <span className="text-gray-700">Amount Due:</span>
        <span className="text-2xl font-extrabold text-red-700 tracking-tight">
          ${Number(estimatedValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
      {fromCart && (
        <div className="text-sm text-gray-600 text-center mb-2">
          {cartState.items.length} shipment{cartState.items.length > 1 ? 's' : ''} in cart
        </div>
      )}
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

export default function PaymentMethod({ estimatedValue = 293, fromCart = false, singleShipmentData = null }: any) {
  const [clientSecret, setClientSecret] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchClientSecret() {
      setLoading(true);
      setError('');
      try {
        const data = await paymentAPI.createPaymentIntent(estimatedValue, 'usd');
        setClientSecret(data.clientSecret);
      } catch (err: any) {
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
      <StripePaymentElementForm 
        clientSecret={clientSecret} 
        estimatedValue={estimatedValue} 
        fromCart={fromCart} 
        singleShipmentData={singleShipmentData}
      />
    </Elements>
  );
} 