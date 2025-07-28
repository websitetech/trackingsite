import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import PhoneInput from './PhoneInput';
import type { CountryCode } from '../utils/phoneValidation';

interface User {
  id: number;
  username: string;
  email: string;
}

interface ShipModalProps {
  onClose: () => void;
  user: User | null;
}

const ShipModal: React.FC<ShipModalProps> = ({ onClose, user }) => {
  const [originPostal, setOriginPostal] = useState('');
  const [destinationPostal, setDestinationPostal] = useState('');
  const [weight, setWeight] = useState('');
  const [serviceType, setServiceType] = useState('standard');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigate = useNavigate();
  const { addItem } = useCart();

  const calculatePrice = () => {
    const weightNum = parseFloat(weight) || 0;
    const baseCost = 15.99;
    const weightMultiplier = weightNum * 2.5;
    const distanceMultiplier = Math.abs(parseInt(destinationPostal) - parseInt(originPostal)) / 1000;
    
    let serviceMultiplier = 1;
    switch (serviceType) {
      case 'express': serviceMultiplier = 2.5; break;
      case 'overnight': serviceMultiplier = 4; break;
      default: serviceMultiplier = 1;
    }

    return (baseCost + weightMultiplier + distanceMultiplier) * serviceMultiplier;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to create a shipment');
      return;
    }

    if (!originPostal || !destinationPostal || !weight || !recipientName || !recipientAddress || !contactNumber) {
      setError('Please fill in all fields');
      return;
    }

    if (!isPhoneValid) {
      setError('Please enter a valid phone number');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const price = calculatePrice();
      const serviceTypeLabel = serviceType === 'standard' ? 'Standard (3-5 days)' : 
                              serviceType === 'express' ? 'Express (2-3 days)' : 'Overnight (1 day)';

      // Generate tracking number
      const trackingNumber = 'TRK' + Date.now().toString().slice(-9);
      
      // Create shipment object
      const shipment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        trackingNumber,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        recipient: recipientName,
        address: recipientAddress,
        serviceType: serviceTypeLabel,
        price,
        history: [
          { 
            date: new Date().toISOString().split('T')[0], 
            status: 'Order Created', 
            location: 'Toronto Hub' 
          },
        ],
        // Additional shipment details
        originPostal,
        destinationPostal,
        weight: weightNum,
        contactNumber: phoneCountry ? `${phoneCountry.dialCode} ${contactNumber}` : contactNumber,
      };

      // Save shipment to localStorage for this user
      const existingShipments = localStorage.getItem(`newShipments_${user.username}`);
      const shipments = existingShipments ? JSON.parse(existingShipments) : [];
      shipments.push(shipment);
      localStorage.setItem(`newShipments_${user.username}`, JSON.stringify(shipments));
      
      console.log('Shipment saved for user:', user.username);
      console.log('Shipment data:', shipment);
      console.log('Total shipments for user:', shipments.length);

      // Also add to cart
      const cartItem = {
        id: shipment.id,
        customer: 'Custom Shipment',
        serviceType,
        serviceTypeLabel,
        recipientName,
        recipientAddress,
        contactNumber: phoneCountry ? `${phoneCountry.dialCode} ${contactNumber}` : contactNumber,
        price,
        originPostal,
        destinationPostal,
        weight: weightNum,
      };

      addItem(cartItem);
      setTrackingNumber(trackingNumber);
      setAddedToCart(true);
      
      // Reset form
      setOriginPostal('');
      setDestinationPostal('');
      setWeight('');
      setServiceType('standard');
      setRecipientName('');
      setRecipientAddress('');
      setContactNumber('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string, country: CountryCode, isValid: boolean) => {
    setContactNumber(value);
    setPhoneCountry(country);
    setIsPhoneValid(isValid);
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };



  if (!user) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }} onClick={onClose}>
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Create Shipment</h2>
            <button 
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0.5rem',
                borderRadius: '0.5rem'
              }}
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Please login to create a shipment.</p>
          <button 
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {!addedToCart ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Create New Shipment</h2>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.5rem',
                  borderRadius: '0.5rem'
                }}
                onClick={onClose}
              >
                ×
              </button>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="shipOriginPostal" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Origin Postal Code</label>
                <input
                  type="text"
                  id="shipOriginPostal"
                  value={originPostal}
                  onChange={(e) => setOriginPostal(e.target.value)}
                  placeholder="Enter origin postal code"
                  required
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    background: '#fff'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="shipDestinationPostal" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Destination Postal Code</label>
                <input
                  type="text"
                  id="shipDestinationPostal"
                  value={destinationPostal}
                  onChange={(e) => setDestinationPostal(e.target.value)}
                  placeholder="Enter destination postal code"
                  required
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    background: '#fff'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="shipWeight" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Weight (lbs)</label>
                <input
                  type="number"
                  id="shipWeight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight in pounds"
                  step="0.1"
                  min="0.1"
                  required
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    background: '#fff'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="shipServiceType" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Service Type</label>
                <select
                  id="shipServiceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    background: '#fff'
                  }}
                >
                  <option value="standard">Standard (3-5 days)</option>
                  <option value="express">Express (2-3 days)</option>
                  <option value="overnight">Overnight (1 day)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="recipientName" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Recipient Name</label>
                <input
                  type="text"
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient name"
                  required
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    background: '#fff'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="recipientAddress" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Recipient Address</label>
                <textarea
                  id="recipientAddress"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter recipient address"
                  rows={3}
                  required
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.95rem',
                    background: '#fff',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="contactNumber" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Contact Number</label>
                <PhoneInput
                  value={contactNumber}
                  onChange={handlePhoneChange}
                  placeholder="Enter contact number"
                  required={true}
                />
              </div>

              {/* Price Display */}
              {originPostal && destinationPostal && weight && (
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '1rem', 
                  borderRadius: '0.75rem', 
                  border: '1px solid #e2e8f0' 
                }}>
                  <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Estimated Price:
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
                    ${calculatePrice().toFixed(2)}
                  </div>
                </div>
              )}

              {error && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  color: '#dc2626',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #fecaca',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add to Cart'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>
              Shipment Created!
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Your shipment has been created and added to your cart successfully.
            </p>
            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              border: '1px solid #e2e8f0',
              marginBottom: '2rem'
            }}>
              <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Tracking Number:
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>
                {trackingNumber}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setAddedToCart(false)}
                style={{
                  background: 'white',
                  border: '2px solid #dc2626',
                  color: '#dc2626',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Add Another
              </button>
              <button
                onClick={handleViewCart}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View Cart
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/orders');
                }}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipModal; 