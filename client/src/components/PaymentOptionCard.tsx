import React from 'react';

export default function PaymentOptionCard({ type, label, ending }:any) {
  return (
    <div className="flex items-center space-x-2 mt-2">
      <input type="radio" name="payment" className="accent-red-600" />
      <span className="text-gray-800">{label}{ending ? ` ending in ${ending}` : ''}</span>
    </div>
  );
} 