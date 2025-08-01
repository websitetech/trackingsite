import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  link?: {
    email: string;
  };
  customer_balance?: {
    amount: number;
    currency: string;
  };
  billing_details?: {
    name: string;
    email: string;
  };
}

export default function PaymentMethodsManager() {
  const [paymentMethods, setPaymentMethods] = useState<{
    cards: PaymentMethod[];
    linkAccounts: PaymentMethod[]; // Interac e-Transfer accounts
  }>({ cards: [], linkAccounts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentAPI.getPaymentMethods();
      setPaymentMethods({
        cards: data.cards || [],
        linkAccounts: data.linkAccounts || [] // Interac e-Transfer accounts
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleDetachPaymentMethod = async (paymentMethodId: string) => {
    try {
      await paymentAPI.detachPaymentMethod(paymentMethodId);
      await loadPaymentMethods(); // Reload payment methods
    } catch (err: any) {
      setError(err.message || 'Failed to remove payment method');
    }
  };

  const getCardIcon = (brand: string) => {
    const icons: { [key: string]: string } = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      jcb: '💳',
      diners: '💳',
      unionpay: '💳'
    };
    return icons[brand.toLowerCase()] || '💳';
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading payment methods...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Methods</h2>
        <p className="text-gray-600">Manage your saved credit cards and bank accounts</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Credit Cards */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">💳</span>
          Credit Cards
        </h3>
        
        {paymentMethods.cards.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">No saved credit cards</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {paymentMethods.cards.map((card) => (
              <div key={card.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getCardIcon(card.card?.brand || '')}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {card.card?.brand?.toUpperCase()} •••• {card.card?.last4}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Expires {formatExpiryDate(card.card?.exp_month || 0, card.card?.exp_year || 0)}
                      </p>
                      {card.billing_details?.name && (
                        <p className="text-sm text-gray-500">
                          {card.billing_details.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDetachPaymentMethod(card.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interac e-Transfer Accounts */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">💰</span>
          Interac e-Transfer Accounts
        </h3>
        
        {paymentMethods.linkAccounts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">No saved Interac e-Transfer accounts</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {paymentMethods.linkAccounts.map((account) => (
              <div key={account.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Interac e-Transfer
                      </h4>
                      <p className="text-sm text-gray-600">
                        Email: {account.link?.email}
                      </p>
                      {account.billing_details?.name && (
                        <p className="text-sm text-gray-500">
                          {account.billing_details.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDetachPaymentMethod(account.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Payment Method */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Add New Payment Method</h3>
        <p className="text-blue-700 mb-4">
          You can add new payment methods during checkout. The payment form will automatically show all available payment methods for your location, including Interac e-Transfer and Canadian bank transfers.
        </p>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">💳</span>
            <span className="text-blue-700">Credit/Debit Cards</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">💰</span>
            <span className="text-blue-700">Interac e-Transfer</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏦</span>
            <span className="text-blue-700">Canadian Bank Transfer</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-xl">🔒</span>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">Security</h4>
            <p className="text-sm text-gray-600">
              All payment methods are securely stored by Stripe and encrypted. We never store your full card numbers or bank account details on our servers. Interac e-Transfer transactions are processed securely through Interac's network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 