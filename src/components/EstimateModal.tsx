import { useState } from 'react';

const TARIFFS = [
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
  { key: 'exclusive', label: 'Exclusive (Any time)', days: 1 },
  { key: 'direct', label: 'Direct (Before 3pm)', days: 1 },
  { key: 'rush', label: 'Rush 3-4 Hours (Before 1pm)', days: 0.5 },
  { key: 'sameday', label: 'Same day (Before 12 Noon)', days: 0.5 },
];

const EstimateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [customer, setCustomer] = useState('');
  const [serviceType, setServiceType] = useState('exclusive');
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState<null | { price: number; days: number }>(null);

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEstimate(null);
    if (!customer || !serviceType) {
      setError('Please select customer and service type');
      return;
    }
    const tariff = TARIFFS.find(t => t.customer === customer);
    if (!tariff) {
      setError('No tariff found for this customer');
      return;
    }
    const price = Number(tariff[serviceType as keyof typeof tariff]);
    const days = SERVICE_TYPES.find(s => s.key === serviceType)?.days || 1;
    setEstimate({ price, days });
  };

  return (
    <div className="modal-overlay" style={{
      zIndex: 9999,
      animation: 'fadeIn 0.4s',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      width: '100vw',
      minWidth: 0,
      overflow: 'auto',
    }}>
      <div className="modal" style={{
        maxWidth: 550,
        width: '100%',
        margin: '0 auto',
        background: 'white',
        borderRadius: 20,
        padding: 48,
        boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
        animation: 'slideDown 0.5s',
        // maxHeight: '95vh',
        overflowY: 'auto',
        position: 'relative',
        marginTop: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height:"max-content"
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', margin: 0, marginRight: 12 }}>Get Shipping Estimate</h2>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: 28,
              cursor: 'pointer',
              color: '#dc2626',
              padding: '0.2rem 0.7rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              transition: 'background 0.2s, color 0.2s',
              alignSelf: 'flex-start',
            }}
            onClick={onClose}
            aria-label="Close"
            onMouseOver={e => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#b91c1c';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleEstimate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <label htmlFor="customer" style={{ fontWeight: 700, color: '#374151', fontSize: '1rem', marginBottom: 2 }}>Customer</label>
          <select id="customer" value={customer} onChange={e => setCustomer(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '0.85rem', border: '2px solid #e5e7eb', fontSize: '1rem', background: '#fff', color: '#1a1a1a', marginBottom: 8, transition: 'border 0.2s' }}>
            <option value="">Select customer</option>
            {TARIFFS.map(t => <option key={t.customer} value={t.customer}>{t.customer}</option>)}
          </select>
          <label htmlFor="serviceType" style={{ fontWeight: 700, color: '#374151', fontSize: '1rem', marginBottom: 2 }}>Service Type</label>
          <select id="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '0.85rem', border: '2px solid #e5e7eb', fontSize: '1rem', background: '#fff', color: '#1a1a1a', marginBottom: 8, transition: 'border 0.2s' }}>
            {SERVICE_TYPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          {error && <div className="error-message" style={{ color: '#dc2626', marginBottom: 8, fontWeight: 600 }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '0.85rem', fontWeight: 700, fontSize: '1.08rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(220,38,38,0.07)' }} onMouseOver={e => (e.currentTarget.style.background='linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)')} onMouseOut={e => (e.currentTarget.style.background='linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)')}>Get Estimate</button>
        </form>
        {estimate && (
          <div className="estimate-result" style={{ marginTop: 32, background: '#fff', borderRadius: 16, padding: 28, textAlign: 'center', border: '2.5px solid #b91c1c', boxShadow: '0 6px 24px rgba(220,38,38,0.09)', animation: 'fadeInUp 0.5s', position: 'relative' }}>
            <button onClick={() => setEstimate(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#b91c1c', cursor: 'pointer', borderRadius: 6, transition: 'background 0.2s' }} aria-label="Close estimate" onMouseOver={e => (e.currentTarget.style.background='#fef2f2')} onMouseOut={e => (e.currentTarget.style.background='none')}>×</button>
            <div style={{ fontSize: 38, marginBottom: 10, color: '#059669', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✔️</div>
            <h3 style={{ color: '#b91c1c', fontWeight: 800, marginBottom: 14, fontSize: '1.25rem', letterSpacing: 0.2 }}>Shipping Estimate</h3>
            <div style={{ borderTop: '1.5px solid #e5e7eb', margin: '0 auto 18px auto', width: '70%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', fontSize: '1.08rem' }}>
              <div><b>Customer:</b> <span style={{ color: '#1a1a1a' }}>{customer}</span></div>
              <div><b>Service Type:</b> <span style={{ color: '#1a1a1a' }}>{SERVICE_TYPES.find(s => s.key === serviceType)?.label}</span></div>
              <div><b>Estimated Cost:</b> <span style={{ color: '#b91c1c', fontWeight: 800, fontSize: '1.25rem' }}>${estimate.price.toFixed(2)}</span></div>
              <div><b>Estimated Delivery:</b> <span style={{ color: '#1a1a1a' }}>{estimate.days} {estimate.days === 1 ? 'day' : 'days'}</span></div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-32px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default EstimateModal; 