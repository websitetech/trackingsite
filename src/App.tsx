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
      
      {/* Hero Section with background */}
      <section className="hero-bg">
        <div className="hero-section">
          <div className="tracking-card">
            <div className="tracking-tab">
              <span className="tracking-tab-icon">📦</span> Tracking Package
            </div>
            <span className="tracking-sub">Looking for a shipment update?</span>
            <TrackingForm onTrackingResult={setTrackingResult} />
          </div>

          <h1 className="hero-title">FAST. RELIABLE. SECURE.<br />Toronto's go-to delivery service.</h1>

          <ActionButtons 
            onEstimate={() => setShowEstimate(true)}
            onShip={() => setShowShip(true)}
            onNewCustomer={() => setShowNewCustomer(true)}
          />
        </div>
      </section>

      {/* Tracking Result */}
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

      {/* Specialty Delivery Areas */}
      <section className="specialty-section">
        <h2 className="specialty-title">Our Specialty Delivery Areas</h2>
        <div className="specialty-grid">
          <div className="specialty-card">
            <span className="specialty-icon">🔌</span>
            <span className="specialty-label">Technology<br />and Electronics</span>
          </div>
          <div className="specialty-card specialty-card-red">
            <span className="specialty-icon">🩺</span>
            <span className="specialty-label">Medical<br />Supplies</span>
          </div>
          <div className="specialty-card">
            <span className="specialty-icon">🍽️</span>
            <span className="specialty-label">Catering<br />Services</span>
          </div>
          <div className="specialty-card">
            <span className="specialty-icon">🏭</span>
            <span className="specialty-label">General Manufacturing<br />Products</span>
          </div>
          <div className="specialty-card specialty-card-wide">
            <span className="specialty-icon">📄</span>
            <span className="specialty-label">Confidential Documents</span>
          </div>
        </div>
      </section>

      {/* Footer / Bottom Banner */}
      <footer className="footer-banner">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">📦</span>
            <span className="footer-brand">Noble SpeedyTrac. inc</span>
          </div>
          <div className="footer-center">
            &copy; {new Date().getFullYear()} Noble SpeedyTrac. inc. All rights reserved.
          </div>
          <div className="footer-right">
            <span>Contact: <a href="mailto:info@noblespeedytrac.com">info@noblespeedytrac.com</a></span>
            <span> | </span>
            <span>+1 (555) 123-4567</span>
          </div>
        </div>
      </footer>

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
