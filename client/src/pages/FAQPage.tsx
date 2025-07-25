import React from 'react';

const faqs = [
  {
    q: 'How do I track my shipment?',
    a: 'Enter your tracking number on the home page or in your dashboard to see the latest status and location.'
  },
  {
    q: 'How do I create a new shipment?',
    a: 'Click the “Ship Now” button on the home page or in your dashboard, fill in the shipment details, and submit.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit cards and online payment methods. You can save your payment method for faster checkout.'
  },
  {
    q: 'How do I contact support?',
    a: 'Use the live chat widget or email info@noblespeedytrac.com for assistance.'
  },
  {
    q: 'Can I cancel or modify a shipment?',
    a: 'You can cancel or modify a shipment before it is processed from your order history page.'
  },
];

const FAQPage: React.FC = () => (
  <div style={{ minHeight: '80vh', background: '#f3f4f6', padding: '2rem 0' }}>
    <div style={{ maxWidth: 700, margin: '0 auto', background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '2.5rem 2rem' }}>
      <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: 24 }}>Help Center / FAQ</h2>
      {faqs.map((item, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{item.q}</div>
          <div style={{ color: '#374151', fontSize: 16 }}>{item.a}</div>
        </div>
      ))}
    </div>
  </div>
);

export default FAQPage; 