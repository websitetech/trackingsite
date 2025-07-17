import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import '../App.css';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Tariff {
  customer: string;
  exclusive: number;
  direct: number;
  rush: number;
  sameday: number;
}

interface UserPageProps {
  user: User;
}

const TARIFFS: Tariff[] = [
  { customer: 'APS', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'AMD', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'CTI', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'StenTech', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'FedEx depot / UPS', exclusive: 43.5, direct: 39.5, rush: 29.5, sameday: 20.5 },
  { customer: 'ECT', exclusive: 87.5, direct: 75.5, rush: 53.5, sameday: 27.5 },
  { customer: 'ATF', exclusive: 87.5, direct: 75.5, rush: 53.5, sameday: 27.5 },
  { customer: 'Tenstorrent', exclusive: 52.5, direct: 44.5, rush: 29.5, sameday: 21.5 },
  { customer: 'MACKIE', exclusive: 160.5, direct: 131.5, rush: 109.5, sameday: 89.5 },
  { customer: 'Bldg. A to B', exclusive: 160.5, direct: 131.5, rush: 109.5, sameday: 89.5 },
];

const SERVICE_TYPES = [
  { key: 'exclusive', label: 'Exclusive (Any time)' },
  { key: 'direct', label: 'Direct (Before 3pm)' },
  { key: 'rush', label: 'Rush 3-4 Hours (Before 1pm)' },
  { key: 'sameday', label: 'Same day (Before 12 Noon)' },
];

const REQUIRED_FIELDS = ['customer', 'serviceType', 'recipientName', 'recipientAddress'] as const;

type FormFields = {
  customer: string;
  serviceType: keyof Omit<Tariff, 'customer'> | '';
  recipientName: string;
  recipientAddress: string;
};

const UserPage: React.FC<UserPageProps> = ({ user }) => {
  const [form, setForm] = useState<FormFields>({
    customer: '',
    serviceType: '',
    recipientName: '',
    recipientAddress: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [anim, setAnim] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const getPrice = () => {
    const tariff = TARIFFS.find(t => t.customer === form.customer);
    if (!tariff || !form.serviceType) return '';
    return tariff[form.serviceType as keyof Omit<Tariff, 'customer'>]
      ? `$${tariff[form.serviceType as keyof Omit<Tariff, 'customer'>].toFixed(2)}`
      : '';
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnim(true);
    setTimeout(() => setAnim(false), 800);
    for (let field of REQUIRED_FIELDS) {
      if (!form[field]) {
        setError('Please fill in all required fields.');
        return;
      }
    }
    setSubmitted(true);
  };

  if (!user) return null;

  return (
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      <section className="hero-bg">
        <div className="hero-section">
          <div className="company-quote">
            Welcome back, <b>{user.username}</b>! Ready to create a new shipment?
          </div>
          <div className="tracking-card" style={{ marginTop: 24, animation: anim ? 'pulse 0.7s' : 'none' }}>
            <div className="tracking-tab">
              <span className="tracking-tab-icon">🚚</span> New Shipment
            </div>
            {!submitted ? (
              <form className="tracking-form" onSubmit={handleSubmit} style={{ transition: 'all 0.4s cubic-bezier(.22,1,.36,1)' }}>
                <div className="form-group">
                  <label>Customer *</label>
                  <select name="customer" value={form.customer} onChange={handleChange} required>
                    <option value="">Select customer</option>
                    {TARIFFS.map(t => <option key={t.customer} value={t.customer}>{t.customer}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Type *</label>
                  <select name="serviceType" value={form.serviceType} onChange={handleChange} required>
                    <option value="">Select service type</option>
                    {SERVICE_TYPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Recipient Name *</label>
                  <input name="recipientName" value={form.recipientName} onChange={handleChange} required placeholder="Enter recipient name" />
                </div>
                <div className="form-group">
                  <label>Recipient Address *</label>
                  <input name="recipientAddress" value={form.recipientAddress} onChange={handleChange} required placeholder="Enter recipient address" />
                </div>
                <div className="form-group">
                  <label>Calculated Price</label>
                  <div className="cost" style={{ fontSize: '1.3rem', color: '#dc2626', fontWeight: 700 }}>{getPrice()}</div>
                </div>
                {error && <div className="error-message" style={{ marginBottom: 8 }}>{error}</div>}
                <button type="submit" className="btn btn-primary track-btn" style={{ marginTop: 8 }}>Create Shipment</button>
              </form>
            ) : (
              <div className="success-message" style={{ animation: 'fadeInUp 0.7s' }}>
                <h3>Shipment Created!</h3>
                <p>Your shipment for <b>{form.customer}</b> has been created.</p>
                <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>Create Another</button>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="specialty-section">
        <h2 className="specialty-title">Our Specialty Delivery Areas</h2>
        <div className="specialty-grid">
          <div className="specialty-card"><span className="specialty-icon">🔌</span><span className="specialty-label">Technology<br />and Electronics</span></div>
          <div className="specialty-card"><span className="specialty-icon">🩺</span><span className="specialty-label">Medical<br />Supplies</span></div>
          <div className="specialty-card"><span className="specialty-icon">🍽️</span><span className="specialty-label">Catering<br />Services</span></div>
          <div className="specialty-card"><span className="specialty-icon">🏭</span><span className="specialty-label">General Manufacturing<br />Products</span></div>
          <div className="specialty-card"><span className="specialty-icon">📄</span><span className="specialty-label">Confidential Documents</span></div>
        </div>
      </section>
    </div>
  );
};

export default UserPage; 