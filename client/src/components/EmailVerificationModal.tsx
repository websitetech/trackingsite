import { useState } from 'react';
import { authAPI } from '../services/api';

interface EmailVerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
  email: string;
  verificationCode: string;
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
      await authAPI.verifyEmail({ email, code });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Verify Email</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            We've sent a verification code to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Please check your email and enter the verification code below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-600 text-sm">Email verified successfully! Redirecting...</div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : success ? 'Verified!' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code? Check your spam folder or{' '}
            <button
              type="button"
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              try again
            </button>
          </p>
        </div>

        {/* Development mode: show verification code */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Development Mode:</strong> Verification code is: <code className="bg-yellow-100 px-1 rounded">{verificationCode}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal; 