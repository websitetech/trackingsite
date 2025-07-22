import React from 'react';
import { useLocation } from 'react-router-dom';
import PaymentMethod from '../components/PaymentMethod';

const ShipmentPage: React.FC = () => {
  const location = useLocation();
  const estimatedValue = location.state?.estimatedValue || 293; // fallback to 293 if not provided
  return (
    <div className="shipment-bg">
      {/* Decorative background circles can be omitted or handled in CSS if desired */}
      <div className="shipment-header">
        <div className="shipment-title-row">
          <span className="shipment-title">Shipment Payment</span>
          <span className="shipment-title-icon">📦</span>
        </div>
        <div className="shipment-subtitle">Complete your shipment by selecting a payment method below. Your delivery is almost on its way!</div>
      </div>
      <div className="shipment-steps">
        <div className="shipment-step">
          <div className="shipment-step-circle shipment-step-active">1</div>
          <span className="shipment-step-label shipment-step-label-active">Details</span>
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
      <div className="shipment-card">
        <PaymentMethod estimatedValue={estimatedValue} />
      </div>
    </div>
  );
}

export default ShipmentPage;