import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { shipmentAPI, paymentAPI } from '../services/api';

const stripePromise = loadStripe('pk_test_51RmVWcI6ptZDqevNhSL1cOkv17IoYm5on5h04IjeWMYUAHk7HPf3TOjEJ2iHmPXO8T03xhvyn8VUBl2A8Tc8Etyt008ngbrspU');

function StripePaymentElementForm({ 
  estimatedValue = 293, 
  fromCart = false, 
  singleShipmentData = null
}: any) {
  const stripe = useStripe();
  const elements = useElements();
  const { state: cartState, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const createShipments = async () => {
    if (!fromCart || cartState.items.length === 0) return;

    console.log('🔄 Starting bulk shipment creation...');
    console.log('📦 Cart items count:', cartState.items.length);

    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id;

      console.log('👤 User ID:', userId);

      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Prepare shipments data for bulk creation
      const shipmentsData = cartState.items.map(item => ({
        user_id: userId,
        customer: item.customer,
        service_type: item.serviceType,
        service_type_label: item.serviceTypeLabel || '',
        recipient_name: item.recipientName,
        recipient_address: item.recipientAddress,
        contact_number: item.contactNumber,
        origin_postal: item.originPostal || '', // Use correct field name for shipments table
        destination_postal: item.destinationPostal || '', // Use correct field name for shipments table
        weight: item.weight || 1,
        price: item.price
      }));

      console.log('📋 Shipments data prepared:', shipmentsData);

      // Create all shipments in bulk using the new API
      const response = await shipmentAPI.createBulkShipments(shipmentsData);
      
      console.log('✅ Shipments created:', response);
      
      // Extract shipments array from response
      const createdShipments = response.shipments || response;
      
      // Clear cart after successful creation
      console.log('🗑️ Clearing cart...');
      await clearCart();
      console.log('✅ Cart cleared');
      
      // Navigate to success page with tracking numbers
      console.log('🎯 Navigating to success page with tracking numbers...');
      navigate('/payment-success', { 
        state: { 
          fromCart: true, 
          shipmentCount: cartState.items.length,
          totalAmount: cartState.total,
          shipments: createdShipments, // Include all shipment details with tracking numbers
          trackingNumbers: createdShipments.map((shipment: any) => shipment.tracking_number) // Extract just tracking numbers
        } 
      });
    } catch (err: any) {
      console.error('❌ Error creating shipments:', err);
      setError(err.message || 'Failed to create shipments');
    }
  };

  const createSingleShipment = async () => {
    if (!singleShipmentData) return;

    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id;

      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Add user_id to single shipment data
      const shipmentDataWithUserId = {
        ...singleShipmentData,
        user_id: userId
      };

      // Create single shipment using the API
      const shipmentResult = await shipmentAPI.createShipment(shipmentDataWithUserId);
      
      // Navigate to success page with shipment details
      navigate('/payment-success', { 
        state: { 
          fromCart: false, 
          shipmentCount: 1,
          totalAmount: estimatedValue,
          shipmentNumber: shipmentResult.shipment_number,
          trackingNumber: shipmentResult.tracking_number,
          shipments: [shipmentResult], // Include shipment details
          trackingNumbers: [shipmentResult.tracking_number] // Include tracking number
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

    console.log('🚀 Starting payment process...');
    console.log('📦 Cart items:', cartState.items);
    console.log('💰 Amount:', estimatedValue);

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required', // Don't redirect automatically
      });

      if (confirmError) {
        console.error('❌ Payment error:', confirmError);
        setError(confirmError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      console.log('✅ Payment intent:', paymentIntent);

      // Payment was successful
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('🎉 Payment succeeded! Creating shipments...');
        setSuccess(true);
        
        // If payment is successful and it's from cart, create shipments
        if (fromCart) {
          console.log('📦 Creating shipments from cart...');
          await createShipments();
        } else if (singleShipmentData) {
          console.log('📦 Creating single shipment...');
          // For single shipment, create the shipment
          await createSingleShipment();
        } else {
          console.log('📦 No shipment data, navigating to success...');
          // For single shipment without data, navigate to success page
          navigate('/payment-success', { 
            state: { 
              fromCart: false, 
              shipmentCount: 1,
              totalAmount: estimatedValue 
            } 
          });
        }
      } else {
        console.error('❌ Payment not successful:', paymentIntent?.status);
        setError('Payment was not successful');
      }
    } catch (err: any) {
      console.error('❌ Payment exception:', err);
      setError(err.message || 'Payment failed');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handlePay} className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold text-red-700 mb-2 text-center tracking-tight">
        {fromCart ? 'Pay for Cart' : 'Complete Payment'}
      </h2>
      
      <div className="estimate-row flex justify-between items-center py-3 px-0 border-b border-gray-100 font-semibold text-base mb-2">
        <span className="text-gray-700">Amount Due:</span>
        <span className="text-2xl font-extrabold text-red-700 tracking-tight">
          C${Number(estimatedValue).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
        </span>
      </div>
      
      {fromCart && (
        <div className="text-sm text-gray-600 text-center mb-2">
          {cartState.items.length} shipment{cartState.items.length > 1 ? 's' : ''} in cart
        </div>
      )}

      {/* Stripe Payment Element - only component */}
      <div className="mb-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                address: { 
                  country: 'CA',
                  state: 'ON',
                  postal_code: 'M5V 3A8'
                }
              }
            },
            paymentMethodOrder: [
              'link',
              'card'
            ],
            fields: {
                billingDetails: {
                    name: 'auto',
                    email: 'auto',
                    phone: 'auto',
                    address: {
                        country: 'auto',
                        line1: 'auto',
                        line2: 'auto',
                        city: 'auto',
                        state: 'auto',
                        postalCode: 'auto'
                    }
                }
            }
          }}
        />
      </div>

      <button 
        type="submit" 
        disabled={!stripe || loading} 
        className="track-btn btn btn-primary mt-2 mb-2 py-3 px-6"
      >
        {loading ? 'Processing...' : `Pay C$${Number(estimatedValue).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`}
      </button>
      
      {error && <div className="error-message mt-2 text-red-600">{error}</div>}
      {success && <div className="success-message mt-2 text-green-600"><h3>Payment successful!</h3></div>}
    </form>
  );
}

export default function PaymentMethod({ estimatedValue = 293, fromCart = false, singleShipmentData = null }: any) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchClientSecret() {
      setLoading(true);
      setError('');
      try {
        console.log('🔍 Fetching client secret for amount:', estimatedValue);
        const data = await paymentAPI.createPaymentIntent(estimatedValue, 'cad');
        console.log('✅ Client secret received:', data.clientSecret ? 'Success' : 'Failed');
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('❌ Error fetching client secret:', err);
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
        estimatedValue={estimatedValue} 
        fromCart={fromCart} 
        singleShipmentData={singleShipmentData}
      />
    </Elements>
  );
} 