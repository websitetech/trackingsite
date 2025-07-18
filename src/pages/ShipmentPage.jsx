import React from 'react';
import { useLocation } from 'react-router-dom';
import PaymentMethod from '../components/PaymentMethod';

export default function ShipmentPage() {
  const location = useLocation();
  const estimatedValue = location.state?.estimatedValue || 293; // fallback to 293 if not provided
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 py-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <PaymentMethod estimatedValue={estimatedValue} />
      </div>
    </div>
  );
} 