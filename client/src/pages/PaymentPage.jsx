import React from 'react';
import PaymentMethod from '../components/PaymentMethod';

export default function PaymentPage() {
  return (
    <div className="p-6 flex flex-col items-center min-h-[60vh] bg-white">
      <h1 className="text-2xl font-bold text-red-700 mb-4">Payment</h1>
      <PaymentMethod />
    </div>
  );
} 