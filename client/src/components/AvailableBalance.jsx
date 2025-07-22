import React from 'react';

export default function AvailableBalance() {
  return (
    <div className="border border-red-200 bg-white p-4 rounded shadow-sm">
      <p className="font-semibold text-red-700">Your available balance</p>
      <div className="mt-2 flex items-center">
        <input type="radio" name="payment" className="accent-red-600" />
        <span className="ml-2">Use your ₹244 Amazon Pay Balance</span>
      </div>
      <p className="text-sm text-red-500 mt-1">Insufficient balance. <a className="text-blue-600 underline" href="#">Add money & get rewarded</a></p>
    </div>
  );
} 