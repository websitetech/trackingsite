import React, { useState } from 'react';
import PaymentOptionCard from './PaymentOptionCard';
import OrderSummary from './OrderSummary';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaCcDinersClub, FaCcJcb, FaCcStripe, FaCcPaypal, FaCcApplePay, FaCcAmazonPay, FaCreditCard, FaUniversity } from 'react-icons/fa';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';

function getCardIcon(type) {
  switch (type) {
    case 'visa': return <FaCcVisa className="text-blue-700" size={20} />;
    case 'mastercard': return <FaCcMastercard className="text-red-700" size={20} />;
    case 'amex': return <FaCcAmex className="text-blue-500" size={20} />;
    case 'maestro': return <FaCreditCard className="text-blue-600" size={20} />;
    case 'rupay': return <FaCreditCard className="text-blue-800" size={20} />;
    default: return <FaCreditCard className="text-gray-500" size={20} />;
  }
}
function getUpiIcons() {
  return [
    <FaUniversity key="upi" className="text-green-700" size={18} />, // generic UPI
    <SiPhonepe key="phonepe" className="text-purple-700" size={18} />,
    <SiGooglepay key="gpay" className="text-blue-700" size={18} />,
    <SiPaytm key="paytm" className="text-blue-500" size={18} />,
  ];
}
function getBankIcons() {
  return [
    <FaUniversity key="hdfc" className="text-blue-800" size={18} />,
    <FaUniversity key="icici" className="text-orange-700" size={18} />,
    <FaUniversity key="sbi" className="text-blue-600" size={18} />,
  ];
}
function detectCardType(number) {
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  if (/^(5018|5020|5038|6304|6759|6761|6763)/.test(number)) return 'maestro';
  if (/^6/.test(number)) return 'rupay';
  return 'visa';
}

export default function PaymentMethod({ estimatedValue = 293 }) {
  const [savedCards, setSavedCards] = useState([]);
  const [showNewCard, setShowNewCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    save: false,
    nickname: '',
    icon: 'visa',
  });
  const [cardAdded, setCardAdded] = useState(false);
  const [selected, setSelected] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmiInfo, setShowEmiInfo] = useState(false);
  const [showCodInfo, setShowCodInfo] = useState(false);

  const handleCardInput = (e) => {
    const { name, value, type, checked } = e.target;
    let icon = cardForm.icon;
    if (name === 'number') {
      icon = detectCardType(value);
    }
    setCardForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      icon,
    }));
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (cardForm.number && cardForm.name && cardForm.expiry && cardForm.cvv) {
      if (cardForm.save) {
        setSavedCards((prev) => [
          ...prev,
          {
            type: 'Credit',
            label: cardForm.name,
            ending: cardForm.number.slice(-4),
            icon: cardForm.icon,
            nickname: cardForm.nickname,
          },
        ]);
      }
      setCardAdded(true);
      setTimeout(() => setCardAdded(false), 1200);
      setCardForm({ name: '', number: '', expiry: '', cvv: '', save: false, nickname: '', icon: 'visa' });
      setShowNewCard(false);
    }
  };

  const handleSelect = (key) => setSelected(key);
  const handlePay = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-white rounded shadow-md border border-red-100 animate-fade-in">
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-xl border border-gray-200 bg-white p-6 rounded-lg shadow-sm animate-fade-in">
          {/* Payment Methods List */}
          <div className="flex flex-col gap-4">
            {/* Saved Cards Section */}
            {savedCards.length > 0 && (
              <label className={`flex items-center gap-3 p-4 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer ${selected.startsWith('card') ? 'bg-[#fff7e6] border-yellow-300 ring-2 ring-yellow-200' : 'hover:bg-gray-50'}`}
                tabIndex={0} aria-label="Saved cards" onClick={() => handleSelect('card0')} onKeyDown={e => e.key === 'Enter' && handleSelect('card0')}>
                <input type="radio" name="payment" className="accent-blue-600" checked={selected.startsWith('card')} onChange={() => handleSelect('card0')} aria-label="Select saved card" />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 mb-1">CREDIT & DEBIT CARDS</span>
                  <div className="flex items-center gap-2">
                    {getCardIcon(savedCards[0]?.icon)}
                    <span className="font-semibold text-gray-900">{savedCards[0]?.label} ending in {savedCards[0]?.ending}</span>
                    <span className="ml-auto text-xs text-gray-500">{savedCards[0]?.nickname}</span>
                  </div>
                </div>
                {selected.startsWith('card') && <span className="ml-2 text-green-500 animate-checkmark">✔</span>}
              </label>
            )}

            {/* Add New Card Section */}
            <label className={`flex items-center gap-3 p-4 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer ${selected === 'newcard' ? 'bg-[#fff7e6] border-yellow-300 ring-2 ring-yellow-200' : 'hover:bg-gray-50'}`}
              tabIndex={0} aria-label="Add new card" onClick={() => handleSelect('newcard')} onKeyDown={e => e.key === 'Enter' && handleSelect('newcard')}>
              <input type="radio" name="payment" className="accent-blue-600" checked={selected === 'newcard'} onChange={() => handleSelect('newcard')} aria-label="Select new card" />
              <div className="flex flex-col w-full">
                <span className="font-bold text-gray-900 mb-1">Credit or debit card</span>
                <div className="flex gap-2 mb-1">
                  {getCardIcon('visa')}
                  {getCardIcon('mastercard')}
                  {getCardIcon('amex')}
                  {getCardIcon('maestro')}
                  {getCardIcon('rupay')}
                </div>
                {showNewCard && (
                  <form className="space-y-3 animate-fade-in mt-2" onSubmit={handleAddCard}>
                    <div className="flex items-center gap-2">
                      {getCardIcon(cardForm.icon)}
                      <input
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition"
                        type="text"
                        name="name"
                        value={cardForm.name}
                        onChange={handleCardInput}
                        placeholder="Name on Card"
                        required
                      />
                    </div>
                    <input
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition"
                      type="text"
                      name="number"
                      value={cardForm.number}
                      onChange={handleCardInput}
                      placeholder="Card Number"
                      maxLength={19}
                      required
                      aria-label="Card Number"
                    />
                    <div className="flex gap-3">
                      <input
                        className="w-1/2 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition"
                        type="text"
                        name="expiry"
                        value={cardForm.expiry}
                        onChange={handleCardInput}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        aria-label="Expiry"
                      />
                      <input
                        className="w-1/2 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition"
                        type="password"
                        name="cvv"
                        value={cardForm.cvv}
                        onChange={handleCardInput}
                        placeholder="CVV"
                        maxLength={4}
                        required
                        aria-label="CVV"
                      />
                    </div>
                    <input
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition"
                      type="text"
                      name="nickname"
                      value={cardForm.nickname}
                      onChange={handleCardInput}
                      placeholder="Nickname (optional)"
                      aria-label="Card Nickname"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="save"
                        checked={cardForm.save}
                        onChange={handleCardInput}
                        className="accent-blue-600"
                        aria-label="Save card for future"
                      />
                      Save this card for future payments
                    </label>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors shadow"
                      aria-label="Add Card"
                    >
                      Add Card
                    </button>
                    {cardAdded && (
                      <div className="text-green-600 text-center animate-fade-in">Card added!</div>
                    )}
                  </form>
                )}
              </div>
              {selected === 'newcard' && <span className="ml-2 text-green-500 animate-checkmark">✔</span>}
            </label>

            {/* UPI Section */}
            <label className={`flex items-center gap-3 p-4 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer ${selected === 'upi' ? 'bg-[#fff7e6] border-orange-300 ring-2 ring-orange-200' : 'hover:bg-gray-50'}`}
              tabIndex={0} aria-label="UPI" onClick={() => handleSelect('upi')} onKeyDown={e => e.key === 'Enter' && handleSelect('upi')}>
              <input type="radio" name="payment" className="accent-blue-600" checked={selected === 'upi'} onChange={() => handleSelect('upi')} aria-label="Select UPI" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 mb-1">UPI</span>
                <div className="flex items-center gap-2 mb-1">
                  {getUpiIcons()}
                </div>
              </div>
              {selected === 'upi' && <span className="ml-2 text-green-500 animate-checkmark">✔</span>}
            </label>

            {/* Other Payment Methods */}
            <label className={`flex flex-col gap-2 p-4 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer ${selected === 'other' ? 'bg-[#fff7e6] border-yellow-300 ring-2 ring-yellow-200' : 'hover:bg-gray-50'}`}
              tabIndex={0} aria-label="Other payment methods" onClick={() => handleSelect('other')} onKeyDown={e => e.key === 'Enter' && handleSelect('other')}>
              <div className="flex items-center mb-2">
                <input type="radio" name="payment" className="accent-blue-600" checked={selected === 'other'} onChange={() => handleSelect('other')} aria-label="Select Other Payment Methods" />
                <span className="font-bold text-gray-900 ml-2">Another payment method</span>
                {selected === 'other' && <span className="ml-2 text-green-500 animate-checkmark">✔</span>}
              </div>
              <div className="flex flex-col gap-2 pl-7">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="payment" className="accent-blue-600" checked={selected === 'netbanking'} onChange={() => handleSelect('netbanking')} aria-label="Select Net Banking" />
                  <span>Net Banking</span>
                  <select className="ml-2 border rounded px-2 py-1 text-sm bg-white text-black">
                    <option className="text-black bg-white">Choose an Option</option>
                    <option className="text-black bg-white">HDFC</option>
                    <option className="text-black bg-white">ICICI</option>
                    <option className="text-black bg-white">SBI</option>
                  </select>
                  {getBankIcons()}
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="payment" className="accent-blue-600" checked={selected === 'otherupi'} onChange={() => handleSelect('otherupi')} aria-label="Select Other UPI Apps" />
                  <span>Other UPI Apps</span>
                </label>
              </div>
            </label>
          </div>
          <OrderSummary onPay={handlePay} estimatedValue={estimatedValue} />
        </div>
      </div>
      {/* Animations CSS */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease; }
        .animate-slide-up { animation: slideUp 0.7s cubic-bezier(.4,2,.6,1); }
        .animate-checkmark { animation: checkmark 0.4s cubic-bezier(.4,2,.6,1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkmark { 0% { opacity: 0; transform: scale(0.5); } 80% { opacity: 1; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
} 