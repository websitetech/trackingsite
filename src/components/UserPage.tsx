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
          <div className="company-quote" style={{ color: '#111' }}>
            Welcome back, <b>{user.username}</b>!
          </div>
          {/* Tracking form at the top */}
          <div style={{
            background: 'white',
            color: 'black',
            borderRadius: '1.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: '2rem',
            margin: '32px auto 24px auto',
            maxWidth: 600,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <h2 style={{ color: '#111', fontWeight: 700, fontSize: '1.4rem', marginBottom: 16 }}>Track Your Package</h2>
            {/* Tracking form fields */}
            <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 0 }}>
              <input type="text" placeholder="Enter Tracking Number" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }} />
              <input type="text" placeholder="Enter Zip Code" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }} />
              <button type="button" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: 8 }}>Track</button>
            </form>
          </div>
          {/* Only one box for Create New Shipment */}
          <div style={{
            background: 'white',
            color: 'black',
            borderRadius: '1.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: '2rem',
            margin: '0 auto',
            maxWidth: 600,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 32,
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>Create New Shipment</div>
            {!submitted ? (
              <form className="tracking-form" onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label style={{ color: '#111', fontWeight: 600 }}>Customer *</label>
                  <select name="customer" value={form.customer} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }}>
                    <option value="">Select customer</option>
                    {TARIFFS.map(t => <option key={t.customer} value={t.customer}>{t.customer}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ color: '#111', fontWeight: 600 }}>Service Type *</label>
                  <select name="serviceType" value={form.serviceType} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }}>
                    <option value="">Select service type</option>
                    {SERVICE_TYPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ color: '#111', fontWeight: 600 }}>Recipient Name *</label>
                  <input name="recipientName" value={form.recipientName} onChange={handleChange} required placeholder="Enter recipient name" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#111', fontWeight: 600 }}>Recipient Address *</label>
                  <input name="recipientAddress" value={form.recipientAddress} onChange={handleChange} required placeholder="Enter recipient address" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', fontSize: '1rem', color: '#111', background: '#fff' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#111', fontWeight: 600 }}>Calculated Price</label>
                  <div className="cost" style={{ fontSize: '1.3rem', color: '#dc2626', fontWeight: 700 }}>{getPrice()}</div>
                </div>
                {error && <div className="error-message" style={{ marginBottom: 8, color: '#dc2626' }}>{error}</div>}
                <button type="submit" className="btn btn-primary track-btn" style={{ marginTop: 8, background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Create Shipment</button>
              </form>
            ) : (
              <div className="success-message" style={{ animation: 'fadeInUp 0.7s', color: '#111' }}>
                <h3>Shipment Created!</h3>
                <p>Your shipment for <b>{form.customer}</b> has been created.</p>
                <button className="btn btn-secondary" onClick={() => setSubmitted(false)} style={{ background: '#fff', color: '#dc2626', border: '2px solid #dc2626', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Create Another</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserPage; 