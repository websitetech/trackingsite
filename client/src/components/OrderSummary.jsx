import React from 'react';

export default function OrderSummary({ onPay, estimatedValue = 293 }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-6 w-full md:w-80 animate-fade-in">
      <div className="mb-4">
        <button
          className="w-full bg-yellow-100 text-yellow-900 font-semibold py-2 rounded-lg mb-4 border border-yellow-200 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer"
          style={{ letterSpacing: 0.2 }}
          onClick={onPay}
        >
          Pay Now
        </button>
      </div>
      <hr className="mb-4 border-gray-100" />
      <div className="flex flex-col gap-2 text-sm text-gray-700 mb-2">
        <div className="flex justify-between">
          <span>Items:</span>
          <span>--</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery:</span>
          <span>--</span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="font-bold text-lg text-gray-900">Order Total:</span>
        <span className="text-2xl font-extrabold text-red-700">₹{Number(estimatedValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
} 