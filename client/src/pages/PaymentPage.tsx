
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import PaymentMethod from '../components/PaymentMethod';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: cartState } = useCart();
  
  const fromCart = location.state?.fromCart;
  const singleShipmentValue = location.state?.estimatedValue || 0;
  
  // Use cart total if coming from cart, otherwise use single shipment value
  const totalAmount = fromCart ? cartState.total : singleShipmentValue;

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handleBackToUser = () => {
    navigate('/user');
  };

  // Show loading state while cart is being loaded
  if (fromCart && cartState.loading) {
    return (
      <div className="shipment-bg">
        <div className="shipment-header">
          <div className="shipment-title-row">
            <span className="shipment-title">Cart Payment</span>
            <span className="shipment-title-icon">💳</span>
          </div>
          <div className="shipment-subtitle">Loading cart data...</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div style={{ color: '#666' }}>Loading your cart...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if cart failed to load
  if (fromCart && cartState.error) {
    return (
      <div className="shipment-bg">
        <div className="shipment-header">
          <div className="shipment-title-row">
            <span className="shipment-title">Cart Payment</span>
            <span className="shipment-title-icon">💳</span>
          </div>
          <div className="shipment-subtitle">Error loading cart</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div style={{ color: '#dc2626', marginBottom: '1rem' }}>Failed to load cart: {cartState.error}</div>
            <button
              onClick={handleBackToCart}
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart state if no items
  if (fromCart && cartState.items.length === 0) {
    return (
      <div className="shipment-bg">
        <div className="shipment-header">
          <div className="shipment-title-row">
            <span className="shipment-title">Cart Payment</span>
            <span className="shipment-title-icon">💳</span>
          </div>
          <div className="shipment-subtitle">Your cart is empty</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛒</div>
            <div style={{ color: '#666', marginBottom: '1rem' }}>Your cart is empty. Add some items to continue.</div>
            <button
              onClick={handleBackToUser}
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-bg">
      <div className="shipment-header">
        <div className="shipment-title-row">
          <span className="shipment-title">
            {fromCart ? 'Cart Payment' : 'Shipment Payment'}
          </span>
          <span className="shipment-title-icon">💳</span>
        </div>
        <div className="shipment-subtitle">
          {fromCart 
            ? `Complete payment for ${cartState.items.length} shipment${cartState.items.length > 1 ? 's' : ''}.`
            : 'Complete your shipment by selecting a payment method below.'
          }
        </div>
      </div>
      
      <div className="shipment-steps">
        <div className="shipment-step">
          <div className="shipment-step-circle shipment-step-active">1</div>
          <span className="shipment-step-label shipment-step-label-active">
            {fromCart ? 'Cart' : 'Details'}
          </span>
        </div>
        <div className="shipment-step-bar"></div>
        <div className="shipment-step">
          <div className="shipment-step-circle shipment-step-active">2</div>
          <span className="shipment-step-label shipment-step-label-active">Payment</span>
        </div>
        <div className="shipment-step-bar"></div>
        <div className="shipment-step">
          <div className="shipment-step-circle">3</div>
          <span className="shipment-step-label">Confirmation</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Payment Method */}
        <div style={{ flex: 2 }}>
          <div className="shipment-card">
            <PaymentMethod estimatedValue={totalAmount} fromCart={fromCart} />
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ flex: 1 }}>
          <div className="bg-white border border-gray-200 rounded-lg shadow p-6 h-fit">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: '#111' }}>
              Order Summary
            </h3>
            
            {fromCart && cartState.items.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Shipments: {cartState.items.length}
                </div>
                {cartState.items.map((item, index) => (
                  <div key={item.id} style={{ 
                    padding: '0.5rem 0', 
                    borderBottom: index < cartState.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ color: '#111', fontWeight: 500 }}>
                      {item.customer} - {item.serviceTypeLabel || item.serviceType}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                      {item.recipientName}
                    </div>
                    <div style={{ color: '#dc2626', fontWeight: 600 }}>
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, color: '#111' }}>Total:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            
            <button
              onClick={fromCart ? handleBackToCart : handleBackToUser}
              style={{
                width: '100%',
                background: 'white',
                border: '2px solid #dc2626',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {fromCart ? 'Back to Cart' : 'Back to Shipment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 