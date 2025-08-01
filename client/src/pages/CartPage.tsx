import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { state, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleProceedToPayment = () => {
    navigate('/payment', { state: { fromCart: true } });
  };

  const handleContinueShopping = () => {
    navigate('/user');
  };

  if (state.items.length === 0) {
    return (
      <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: '3rem',
          margin: '2rem auto',
          maxWidth: 600,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ color: '#111', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Add some shipments to your cart to get started!
          </p>
          <button
            onClick={handleContinueShopping}
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
    );
  }

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        padding: '2rem',
        margin: '2rem auto',
        maxWidth: 800,
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#111', fontWeight: 700, fontSize: '1.8rem' }}>Shopping Cart</h1>
          <button
            onClick={clearCart}
            style={{
              background: 'none',
              border: '1px solid #dc2626',
              color: '#dc2626',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Clear Cart
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          {state.items.map((item, index) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem',
                background: '#fafafa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      background: '#dc2626', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '24px', 
                      height: '24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.8rem', 
                      marginRight: '0.75rem' 
                    }}>
                      {index + 1}
                    </span>
                    <h3 style={{ color: '#111', fontWeight: 600, fontSize: '1.1rem' }}>
                      {item.customer} - {item.serviceTypeLabel || item.serviceType}
                    </h3>
                  </div>
                  
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>Recipient:</strong> {item.recipientName}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>Address:</strong> {item.recipientAddress}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>Contact:</strong> {item.contactNumber}
                  </div>
                  {item.originPostal && item.destinationPostal && (
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <strong>Route:</strong> {item.originPostal} → {item.destinationPostal}
                    </div>
                  )}
                  {item.weight && (
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      <strong>Weight:</strong> {item.weight} lbs
                    </div>
                  )}
                </div>
                
                <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                  <div style={{ 
                    color: '#dc2626', 
                    fontWeight: 700, 
                    fontSize: '1.2rem', 
                    marginBottom: '0.5rem' 
                  }}>
                    ${item.price.toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #dc2626',
                      color: '#dc2626',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '2px solid #e5e7eb',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Total Items: {state.items.length}
            </div>
            <div style={{ 
              color: '#111', 
              fontWeight: 700, 
              fontSize: '1.5rem' 
            }}>
              Total: ${state.total.toFixed(2)}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleContinueShopping}
              style={{
                background: 'white',
                border: '2px solid #dc2626',
                color: '#dc2626',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Continue Shopping
            </button>
            <button
              onClick={handleProceedToPayment}
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
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 