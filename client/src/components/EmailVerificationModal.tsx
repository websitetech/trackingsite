import { useState } from 'react';

interface EmailVerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
  email: string;
  verificationCode?: string;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ 
  onClose, 
  onSuccess, 
  email, 
  verificationCode 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://trackingsite.onrender.com/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '2rem',
        maxWidth: '450px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Verify Email</h2>
          <button 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.5rem',
              borderRadius: '0.5rem'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              fontSize: '3rem', 
              color: '#10b981', 
              marginBottom: '1rem' 
            }}>
              ✅
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#1a1a1a',
              marginBottom: '0.5rem' 
            }}>
              Email Verified!
            </h3>
            <p style={{ color: '#6b7280' }}>
              Your email has been successfully verified. You can now log in to your account.
            </p>
          </div>
        ) : (
          <>
            <div style={{ 
              background: '#f3f4f6', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              marginBottom: '1.5rem' 
            }}>
              <p style={{ 
                color: '#374151', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem' 
              }}>
                We've sent a verification code to:
              </p>
              <p style={{ 
                fontWeight: 600, 
                color: '#1a1a1a' 
              }}>
                {email}
              </p>
              {verificationCode && (
                <div style={{ 
                  background: '#dbeafe', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  marginTop: '0.75rem' 
                }}>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#1e40af', 
                    marginBottom: '0.25rem' 
                  }}>
                    Development Mode - Verification Code:
                  </p>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: '#1e40af', 
                    fontFamily: 'monospace' 
                  }}>
                    {verificationCode}
                  </p>
                </div>
              )}
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="verificationCode" style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1.1rem',
                    background: '#fff',
                    textAlign: 'center',
                    letterSpacing: '0.25rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              {error && (
                <div style={{ 
                  background: '#fef2f2', 
                  color: '#dc2626', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  fontSize: '0.9rem' 
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#9ca3af' : '#b91c1c',
                  color: 'white',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div style={{ 
              textAlign: 'center', 
              marginTop: '1.5rem', 
              paddingTop: '1.5rem', 
              borderTop: '1px solid #e5e7eb' 
            }}>
              <p style={{ 
                fontSize: '0.85rem', 
                color: '#6b7280' 
              }}>
                Didn't receive the code? Check your spam folder or{' '}
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b91c1c',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => window.location.reload()}
                >
                  try registering again
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal; 