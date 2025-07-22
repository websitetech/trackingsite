import React from 'react';
import { useLocation } from 'react-router-dom';
import PaymentMethod from '../components/PaymentMethod';

export default function ShipmentPage() {
  const location = useLocation();
  const estimatedValue = location.state?.estimatedValue || 293; // fallback to 293 if not provided
  return (
    <div className="min-h-[100vh] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 relative py-12 px-2">
      {/* Decorative background circles */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-red-200 opacity-30 rounded-full blur-2xl -z-10" style={{filter:'blur(60px)', top: '-3rem', left: '-3rem'}}></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-100 opacity-20 rounded-full blur-2xl -z-10" style={{filter:'blur(80px)', bottom: '-4rem', right: '-4rem'}}></div>
      {/* Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl md:text-4xl font-extrabold text-red-700 tracking-tight drop-shadow">Shipment Payment</span>
          <span className="text-2xl">📦</span>
        </div>
        <div className="text-gray-600 text-center max-w-md">Complete your shipment by selecting a payment method below. Your delivery is almost on its way!</div>
      </div>
      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white font-bold">1</div>
          <span className="text-xs mt-1 text-red-700 font-semibold">Details</span>
        </div>
        <div className="w-8 h-1 bg-red-200 rounded"></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white font-bold">2</div>
          <span className="text-xs mt-1 text-red-700 font-semibold">Payment</span>
        </div>
        <div className="w-8 h-1 bg-red-200 rounded"></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-400 font-bold">3</div>
          <span className="text-xs mt-1 text-gray-400 font-semibold">Confirmation</span>
        </div>
      </div>
      {/* Payment Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 border border-red-100 hover:shadow-red-200 transition-shadow duration-300">
        <PaymentMethod estimatedValue={estimatedValue} />
      </div>
    </div>
  );
}