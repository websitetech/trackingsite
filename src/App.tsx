import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import TrackingForm from './components/TrackingForm';
import ActionButtons from './components/ActionButtons';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import EstimateModal from './components/EstimateModal';
import ShipModal from './components/ShipModal';
import NewCustomerModal from './components/NewCustomerModal';

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showShip, setShowShip] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLoginSuccess = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setShowLogin(false);
  };

  const handleRegisterSuccess = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setShowRegister(false);
  };

  return (
    <div className="App">
      <Header 
        user={user}
        onLogin={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
        onLogout={handleLogout}
      />
      
      <main className="main-content">
        <div className="hero-section">
          <h1>Track Your Package</h1>
          <p>Enter your tracking number and zip code to get real-time updates</p>
        </div>

        <TrackingForm onTrackingResult={setTrackingResult} />

        {trackingResult && (
          <div className="tracking-result">
            <h3>Tracking Information</h3>
            <div className="result-card">
              <p><strong>Status:</strong> {trackingResult.status}</p>
              <p><strong>Location:</strong> {trackingResult.location}</p>
              <p><strong>Estimated Delivery:</strong> {new Date(trackingResult.estimated_delivery).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        <ActionButtons 
          onEstimate={() => setShowEstimate(true)}
          onShip={() => setShowShip(true)}
          onNewCustomer={() => setShowNewCustomer(true)}
        />
      </main>

      {/* Modals */}
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal 
          onClose={() => setShowRegister(false)}
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {showEstimate && (
        <EstimateModal 
          onClose={() => setShowEstimate(false)}
        />
      )}

      {showShip && (
        <ShipModal 
          onClose={() => setShowShip(false)}
          user={user}
        />
      )}

      {showNewCustomer && (
        <NewCustomerModal 
          onClose={() => setShowNewCustomer(false)}
        />
      )}
    </div>
  );
}

export default App;
