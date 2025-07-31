import { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import TrackingForm from './components/TrackingForm';
import ActionButtons from './components/ActionButtons';
import LoginModal from './components/LoginModal';
import EstimateModal from './components/EstimateModal';
import ShipModal from './components/ShipModal';
import NewCustomerModal from './components/NewCustomerModal';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TrackingPage from './components/TrackingPage';
import UserPage from './components/UserPage';
import ShipmentPage from './pages/ShipmentPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import FAQPage from './pages/FAQPage';
import AdminDashboard from './pages/AdminDashboard';


interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

function AppRoutes() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showShip, setShowShip] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Ensure smooth video playback
    if (videoRef.current) {
      const video = videoRef.current;
      video.load();
      
      // Wait a moment then try to play
      setTimeout(() => {
        video.play().catch(() => {
          console.log('Autoplay blocked - video will start on user interaction');
        });
      }, 100);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/'); // Redirect to landing page
    window.location.href = '/'; // Fallback: force reload to landing page
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleRegisterClick = () => {
    setShowNewCustomer(true);
  };

  const handleVideoClick = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleLoginSuccess = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setShowLogin(false);
    navigate('/user');
  };

  return (
    <div className="App">
      <Header 
        user={user}
        onLogin={handleLoginClick}
        onRegister={handleRegisterClick}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={
          user ? <UserPage user={user} /> : (
            <>
              {/* Hero Section with video background */}
              <section className="hero-bg" onClick={handleVideoClick}>
                <video 
                  ref={videoRef}
                  className="hero-video"
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                  key="truck-video-stable"
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: '1'
                  }}
                  onLoadedData={() => {
                    console.log('🚛 TRUCK VIDEO LOADED SUCCESSFULLY!');
                    setVideoLoaded(true);
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  onError={(e) => {
                    console.error('Video load error:', e);
                    console.log('Falling back to alternative video source...');
                  }}
                  onLoadStart={() => {
                    console.log('🔄 Your custom truck video loading started...');
                    setVideoLoaded(false);
                  }}
                  onCanPlayThrough={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(() => {
                        console.log('Autoplay prevented, video will play on user interaction');
                      });
                    }
                  }}
                  onEnded={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play();
                    }
                  }}
                >
                  <source src="/truck-video.mp4" type="video/mp4" />
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                  🚛 TRUCK VIDEO LOADING...
                </video>
                {!videoLoaded && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#2563eb',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      zIndex: 5,
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '1rem 2rem',
                      borderRadius: '1rem',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.1)',
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    🚛 Loading your truck video...
                  </div>
                )}
                <div 
                  className="hero-fallback-image"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url(https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=2000&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                  }}
                ></div>
                <div className="hero-video-overlay"></div>
                <div className="hero-section">
                  <div className="company-quote">
                    At NobleSpeedytrac, we specialize in fast, reliable, and secure logistics solutions tailored to your business needs. From first mile to last mile, we ensure your cargo reaches its destination on time, every time.
                    Your trusted logistics partner — driven by precision, powered by innovation.
                  </div>
                  <div className="tracking-card">
                    <div className="tracking-tab">
                      <span className="tracking-tab-icon">📦</span> Tracking Package
                    </div>
                    <span className="tracking-sub">Looking for a shipment update?</span>
                    <TrackingForm />
                  </div>
                  <h1 className="hero-title">FAST. RELIABLE. SECURE.<br />Toronto's go-to delivery service.</h1>
                  <ActionButtons 
                    onEstimate={() => setShowEstimate(true)}
                    onShip={() => setShowShip(true)}
                    onNewCustomer={() => setShowNewCustomer(true)}
                  />
                </div>
              </section>
              {/* Specialty Delivery Areas */}
              <section className="specialty-section">
                <h2 className="specialty-title">Our Specialty Delivery Areas</h2>
                <div className="specialty-grid">
                  <div className="specialty-card">
                    <span className="specialty-icon">🔌</span>
                    <span className="specialty-label">Technology<br />and Electronics</span>
                  </div>
                  <div className="specialty-card">
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
                  <div className="specialty-card">
                    <span className="specialty-icon">📄</span>
                    <span className="specialty-label">Confidential Documents</span>
                  </div>
                </div>
              </section>
            </>
          )
        } />
        <Route path="/user" element={user ? <UserPage user={user} /> : <div>Please log in to view your dashboard.</div>} />
        <Route path="/profile" element={user ? <ProfilePage /> : <div>Please log in to view your profile.</div>} />
        <Route path="/track/:trackingNumber" element={<TrackingPage />} />
        <Route path="/shipment" element={user ? <ShipmentPage /> : <div>Please log in to create a shipment.</div>} />
        <Route path="/cart" element={user ? <CartPage /> : <div>Please log in to view your cart.</div>} />
        <Route path="/payment" element={user ? <PaymentPage /> : <div>Please log in to make a payment.</div>} />
        <Route path="/payment-success" element={user ? <PaymentSuccessPage /> : <div>Please log in to view payment success.</div>} />
        <Route path="/orders" element={user ? <OrderHistoryPage user={user} /> : <div>Please log in to view your orders.</div>} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/admin" element={
          user && user.role === 'admin' ? 
            <AdminDashboard /> : 
            <div style={{ 
              minHeight: '100vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#f3f4f6',
              color: '#dc2626',
              fontSize: '1.25rem',
              textAlign: 'center',
              padding: '2rem'
            }}>
              {user ? 'Access denied. Admin privileges required.' : 'Please log in to access admin dashboard.'}
            </div>
        } />
      </Routes>
      {/* Footer / Bottom Banner */}
      <footer className="footer-banner">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">📦</span>
            <span className="footer-brand">NobleSpeedytrac</span>
          </div>
          <div className="footer-center">
            &copy; {new Date().getFullYear()} NobleSpeedytrac. All rights reserved.
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
            setShowNewCustomer(true);
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

export default AppRoutes; 