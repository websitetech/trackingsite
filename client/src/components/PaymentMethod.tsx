import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { shipmentAPI, paymentAPI } from '../services/api';
import { environment } from '../config/environment';

// Load Stripe with environment variable
const stripePromise = loadStripe(environment.stripePublishableKey);

function StripePaymentElementForm({ 
  estimatedValue = 293, 
  fromCart = false, 
  singleShipmentData = null,
  onPaymentComplete
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

    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id;

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

      // Create all shipments in bulk using the new API
      const response = await shipmentAPI.createBulkShipments(shipmentsData);
      
      // Extract shipments array from response
      const createdShipments = response.shipments || response;
      
      // Clear cart after successful creation
      await clearCart();
      
      // Call onPaymentComplete callback to prevent further payment intent creation
      if (onPaymentComplete) {
        onPaymentComplete();
      }
      
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
      
      // Call onPaymentComplete callback to prevent further payment intent creation
      if (onPaymentComplete) {
        onPaymentComplete();
      }
      
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
    if (loading) return;

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required', // Don't redirect automatically
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      // Payment was successful
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSuccess(true);
        
        // Call onPaymentComplete callback to prevent further payment intent creation
        if (onPaymentComplete) {
          onPaymentComplete();
        }
        
        // If payment is successful and it's from cart, create shipments
        if (fromCart) {
          await createShipments();
        } else if (singleShipmentData) {
          // For single shipment, create the shipment
          await createSingleShipment();
        } else {
          // For single shipment without data, navigate to success page
          
          // Call onPaymentComplete callback to prevent further payment intent creation
          if (onPaymentComplete) {
            onPaymentComplete();
          }
          
          navigate('/payment-success', { 
            state: { 
              fromCart: false, 
              shipmentCount: 1,
              totalAmount: estimatedValue 
            } 
          });
        }
      } else {
        setError('Payment was not successful');
      }
    } catch (err: any) {
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
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const isCreatingPaymentIntent = useRef(false);

  useEffect(() => {
    async function fetchClientSecret() {
      // Don't create payment intent if payment is already completed
      if (paymentCompleted) {
        return;
      }

      // Prevent duplicate API calls
      if (isCreatingPaymentIntent.current) {
        return;
      }

      isCreatingPaymentIntent.current = true;
      setLoading(true);
      setError('');
      
      try {
        const data = await paymentAPI.createPaymentIntent(estimatedValue, 'cad');
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || 'Failed to load payment form');
      } finally {
        setLoading(false);
        isCreatingPaymentIntent.current = false;
      }
    }

    fetchClientSecret();
  }, [estimatedValue, paymentCompleted]);

  // Set payment completed when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      setPaymentCompleted(true);
    };
  }, []);

  if (loading) return <div className="text-center py-8">Loading payment form...</div>;
  if (error) return <div className="error-message mt-2">{error}</div>;
  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentElementForm 
        estimatedValue={estimatedValue} 
        fromCart={fromCart} 
        singleShipmentData={singleShipmentData}
        onPaymentComplete={() => setPaymentCompleted(true)}
      />
    </Elements>
  );
} 